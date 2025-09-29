/**
 * 判断是不是对象
 * @param value 
 * @returns 
 */
export function isObject(value: Record<any, any>) {
    return value !== null && typeof value === 'object'
}

/**
 * 值是否被改变过
 * @param newValue 新值
 * @param oldValue 旧值
 * @returns 
 */
export function hasChanged(newValue,oldValue) {
    return !Object.is(newValue,oldValue)
}
