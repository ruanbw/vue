import { activeSub } from "./effect";
import type { Dependencie, Link } from "./system";
import { link, propagate } from "./system";

/**
 * 响应式数据标记
 */
export enum ReactiveFlags {
    IS_REF = '__v_isRef'
}

/**
 * 创建 ref 对象
 * @param value 创建 ref 对象的初始值
 * @returns 响应式数据
 */
export function ref<T>(value?: T): RefImpl<T> {
    if (isRef(value)) {
        return value as RefImpl<T>
    }
    return new RefImpl(value)
}

/**
 * ref 对象实现类
 */
export class RefImpl<T> {
    private _value: T

    private readonly [ReactiveFlags.IS_REF] = true

    /**
     * 订阅者链表的头节点，理解为我们将的 head
     */
    private subs: Link

    /**
     * 订阅者链表的尾节点，理解为我们讲的 tail
     */
    private subsTail: Link

    constructor(value?: T) {
        this._value = value
    }

    get value() {
        // 收集依赖
        trackRef(this)
        return this._value
    }

    set value(newValue) {
        if (this._value === newValue) return
        this._value = newValue
        // 触发订阅者
        triggerRef(this)
    }
}

/**
 * 收集依赖，建立 ref 和 effect 之间的链表关系
 * @param dep
 */
function trackRef(dep: Dependencie) {
    if (activeSub) {
        link(dep, activeSub)
    }
}

/**
 * 触发 ref 关联的 effect 重新执行
 * @param dep
 */
function triggerRef(dep: Dependencie) {
    if (dep.subs) {
        propagate(dep.subs)
    }
}

/**
 * 判断是否是 ref 对象
 * @param value
 * @returns
 */
export function isRef(value: any) {
    return !!(value && value[ReactiveFlags.IS_REF])
}
