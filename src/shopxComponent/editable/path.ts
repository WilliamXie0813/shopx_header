import get from 'lodash/get'
import set from 'lodash/set'
import cloneDeep from 'lodash/cloneDeep'

export function getValueByPath(obj: unknown, path: string): unknown {
  return get(obj, path)
}

export function setValueByPath<T extends object>(
  obj: T,
  path: string,
  value: unknown,
): T {
  const copy = cloneDeep(obj)
  set(copy, path, value)
  return copy
}

export { getValueByPath as get, setValueByPath as set }
