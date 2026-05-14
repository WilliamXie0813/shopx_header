import get from 'lodash/get'
import set from 'lodash/set'
import cloneDeep from 'lodash/cloneDeep'

export function getValueByPath(obj: any, path: string): any {
  return get(obj, path)
}

export function setValueByPath(obj: any, path: string, value: any): any {
  const copy = cloneDeep(obj)
  set(copy, path, value)
  return copy
}

export { getValueByPath as get, setValueByPath as set }
