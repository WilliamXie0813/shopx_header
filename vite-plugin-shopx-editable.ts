import { parse } from '@babel/parser'
import _traverse from '@babel/traverse'
import * as t from '@babel/types'
import _generate from '@babel/generator'
import type { Plugin } from 'vite'

const traverse: typeof _traverse =
  (_traverse as unknown as { default?: typeof _traverse }).default ?? _traverse
const generate: typeof _generate =
  (_generate as unknown as { default?: typeof _generate }).default ?? _generate

// ── Path segment types ────────────────────────────────────────────

interface IndexSegment {
  type: 'index'
  varName: string
}

type PathSegment = string | IndexSegment

function isIndex(s: PathSegment): s is IndexSegment {
  return typeof s !== 'string' && s.type === 'index'
}

// ── Scope tracking ────────────────────────────────────────────────

interface MapScope {
  varName: string
  indexVar: string
  arrayPath: PathSegment[]
}

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Walk a MemberExpression chain from right to left, collecting property names.
 * Returns { root, parts } where root is the leftmost identifier and parts
 * are the property names in left-to-right order.
 */
function walkMemberChain(
  node: t.MemberExpression | t.OptionalMemberExpression,
): { root: t.Identifier; parts: string[] } | null {
  const parts: string[] = []
  let current: t.Node = node

  while (t.isMemberExpression(current) || t.isOptionalMemberExpression(current)) {
    const prop: t.Expression | t.PrivateName = current.property
    if (!t.isIdentifier(prop)) return null
    parts.unshift(prop.name)
    current = current.object

    // Unwrap optional chaining TS wrapper
    if (t.isTSNonNullExpression(current)) {
      current = current.expression
    }
  }

  if (!t.isIdentifier(current)) return null
  return { root: current, parts }
}

/**
 * Resolve a root identifier against the scope stack.
 * For `config`: returns empty array (paths are relative to config root).
 * For tracked variables: returns arrayPath + index segment for that scope.
 */
function resolveRoot(
  root: t.Identifier,
  scopeStack: MapScope[],
  configParamName: string,
): PathSegment[] | null {
  if (root.name === configParamName) return []

  for (let i = scopeStack.length - 1; i >= 0; i--) {
    if (root.name === scopeStack[i].varName) {
      const idx: IndexSegment = { type: 'index', varName: scopeStack[i].indexVar }
      return [...scopeStack[i].arrayPath, idx]
    }
  }
  return null
}

/**
 * Check if a call expression is a .map() call.
 */
function isMapCall(node: t.CallExpression): boolean {
  const callee = node.callee
  if (!t.isMemberExpression(callee) && !t.isOptionalMemberExpression(callee)) return false
  return (
    !callee.computed &&
    t.isIdentifier(callee.property, { name: 'map' }) &&
    node.arguments.length >= 1 &&
    (t.isArrowFunctionExpression(node.arguments[0]) ||
      t.isFunctionExpression(node.arguments[0]))
  )
}

/**
 * Get the callback node from a .map() call (handles both arrow and function expressions).
 */
function getMapCallback(node: t.CallExpression): t.ArrowFunctionExpression | t.FunctionExpression | null {
  const arg = node.arguments[0]
  if (t.isArrowFunctionExpression(arg) || t.isFunctionExpression(arg)) return arg
  return null
}

// ── Scope extraction ───────────────────────────────────────────────

const scopePushed = new WeakSet<t.Node>()

function extractMapScope(
  node: t.CallExpression,
  scopeStack: MapScope[],
  configParamName: string,
): MapScope | null {
  const callee = node.callee as t.MemberExpression | t.OptionalMemberExpression
  // Walk the object before .map, not the .map itself
  const chain = walkMemberChain(
    callee.object as t.MemberExpression | t.OptionalMemberExpression,
  )
  if (!chain) return null

  const basePath = resolveRoot(chain.root, scopeStack, configParamName)
  if (basePath === null) return null

  const callback = getMapCallback(node)
  if (!callback) return null

  // Extract params: first param is element, second (optional) is index
  const params = callback.params
  if (params.length < 1) return null
  const firstParam = params[0]
  if (!t.isIdentifier(firstParam)) return null

  const varName = firstParam.name
  const indexVar =
    params.length >= 2 && t.isIdentifier(params[1])
      ? params[1].name
      : `__i_${varName}`

  // Build the array path: basePath includes index for tracked vars,
  // then append the property chain from this .map() call
  const arrayPath: PathSegment[] = [...basePath, ...chain.parts]

  return { varName, indexVar, arrayPath }
}

// ── Member expression resolution ───────────────────────────────────

/**
 * Resolve a MemberExpression against tracked scope variables.
 * If expr is `item.label` and `item` is tracked, returns the full path segments.
 */
function resolveMemberPath(
  expr: t.MemberExpression,
  scopeStack: MapScope[],
): PathSegment[] | null {
  // Walk the member chain
  const properties: string[] = []
  let current: t.Expression = expr

  while (t.isMemberExpression(current)) {
    if (!t.isIdentifier(current.property)) return null
    properties.unshift(current.property.name)
    current = current.object
  }

  if (!t.isIdentifier(current)) return null

  // Find the scope for this variable
  for (let i = scopeStack.length - 1; i >= 0; i--) {
    const scope = scopeStack[i]
    if (current.name === scope.varName) {
      // Build: arrayPath + [idx(scope.indexVar)] + properties
      const idx: IndexSegment = { type: 'index', varName: scope.indexVar }
      return [...scope.arrayPath, idx, ...properties]
    }
  }

  // Direct config access: config.title → ['title']
  // We don't track this here since it's not in a .map callback,
  // but for standalone config.xxx references we support it.
  // Check if it's the configParamName
  return null
}

// ── Path segments to TemplateLiteral ────────────────────────────────

/**
 * Convert path segments to a babel TemplateLiteral AST node.
 * ['nav', 'items', idx('i'), 'label'] → `nav.items[${i}].label`
 */
function segmentsToTemplateLiteral(segments: PathSegment[]): t.TemplateLiteral {
  const quasis: t.TemplateElement[] = []
  const expressions: t.Expression[] = []

  let currentStr = ''

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]

    if (isIndex(seg)) {
      quasis.push(t.templateElement({ raw: currentStr + '[', cooked: currentStr + '[' }))
      expressions.push(t.identifier(seg.varName))
      currentStr = ']'
    } else {
      if (currentStr.length > 0 && !currentStr.endsWith(']')) {
        currentStr += '.'
      } else if (currentStr.endsWith(']')) {
        currentStr += '.'
      }
      currentStr += seg
    }
  }

  // Final quasi
  quasis.push(t.templateElement({ raw: currentStr, cooked: currentStr }))

  return t.templateLiteral(quasis, expressions)
}

// ── Injection ──────────────────────────────────────────────────────

/**
 * Inject `{...__editable(pathTemplate)}` as a JSX spread attribute on a JSX element.
 */
function injectEditableAttribute(
  jsxElement: t.JSXElement,
  pathTemplate: t.TemplateLiteral,
): void {
  // Only inject on elements, not fragments
  const opening = jsxElement.openingElement

  // Don't inject if this element already has data-editable-path
  for (const attr of opening.attributes) {
    if (
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name, { name: 'data-editable-path' })
    ) {
      return
    }
  }

  const spreadAttr = t.jsxSpreadAttribute(
    t.callExpression(t.identifier('__editable'), [pathTemplate]),
  )
  opening.attributes.push(spreadAttr)
}

// ── Import injection ───────────────────────────────────────────────

function ensureImport(ast: t.File, importSource: string): void {
  // Check if __editable is already imported from this source
  for (const stmt of ast.program.body) {
    if (!t.isImportDeclaration(stmt)) continue
    if (stmt.source.value !== importSource) continue
    for (const spec of stmt.specifiers) {
      if (
        t.isImportSpecifier(spec) &&
        t.isIdentifier(spec.imported, { name: '__editable' })
      ) {
        return // Already imported
      }
    }
  }

  // Add the import
  const importStmt = t.importDeclaration(
    [t.importSpecifier(t.identifier('__editable'), t.identifier('__editable'))],
    t.stringLiteral(importSource),
  )

  // Insert after the last import declaration, or at the top
  let insertIndex = 0
  for (let i = ast.program.body.length - 1; i >= 0; i--) {
    if (t.isImportDeclaration(ast.program.body[i])) {
      insertIndex = i + 1
      break
    }
  }

  ast.program.body.splice(insertIndex, 0, importStmt)
}

// ── Plugin ────────────────────────────────────────────────────────

export interface ShopxEditableOptions {
  /** Import source for the __editable runtime. Default: '@shopx/editable' */
  importSource?: string
  /** Name of the config prop parameter. Default: 'config' */
  configParamName?: string
  /** Glob patterns for files to include. Default: all .tsx/.jsx files */
  include?: RegExp
}

export default function shopxEditable(options?: ShopxEditableOptions): Plugin {
  const importSource = options?.importSource ?? '@shopx/editable'
  const configParamName = options?.configParamName ?? 'config'
  const include = options?.include ?? /\.(tsx|jsx)$/

  return {
    name: 'shopx-editable',
    enforce: 'pre',

    transform(code, id) {
      if (!include.test(id)) return

      let ast: t.File
      try {
        ast = parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        })
      } catch {
        return // Silently skip files with parse errors
      }

      const scopeStack: MapScope[] = []
      let modified = false
      let needsImport = false

      traverse(ast, {
        CallExpression: {
          enter(callPath) {
            const node = callPath.node
            if (!isMapCall(node)) return

            const callback = getMapCallback(node)
            if (!callback) return

            const scope = extractMapScope(node, scopeStack, configParamName)
            if (!scope) return

            scopeStack.push(scope)
            scopePushed.add(node)
          },
          exit(callPath) {
            if (scopePushed.has(callPath.node)) {
              scopeStack.pop()
              scopePushed.delete(callPath.node)
            }
          },
        },

        JSXExpressionContainer(exprPath) {
          // Only inject for visible children, not attribute values
          if (!t.isJSXElement(exprPath.parent)) return

          const expression = exprPath.node.expression
          if (!t.isMemberExpression(expression)) return

          const segments = resolveMemberPath(expression, scopeStack)
          if (!segments) return

          const parentEl = exprPath.parent
          const templateLiteral = segmentsToTemplateLiteral(segments)
          injectEditableAttribute(parentEl, templateLiteral)
          modified = true
          needsImport = true
        },
      })

      if (!modified) return

      if (needsImport) {
        ensureImport(ast, importSource)
      }

      const output = generate(ast, {}, code)
      return { code: output.code, map: output.map }
    },
  }
}
