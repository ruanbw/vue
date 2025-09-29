import { isObject } from "@vue/shared";
import { Dependencie, link, Link, propagate } from "./system";
import { activeSub } from "./effect";
import { isRef, ReactiveFlags } from "./ref";

const mutableHandlers = {
    get(target, key, receiver) {

        // 是不是代理对象的标记
        if (ReactiveFlags[key]) return true

        track(target, key)

        const res = Reflect.get(target, key, receiver)

        if(isRef(res)){
            return res.value
        }

        return res
    },
    set(target, key, newValue, receiver) {

        const oldValue = Reflect.get(target, key, receiver)

        // 新值如果是对象则继续代理
        newValue = isObject(newValue) ? reactive(newValue) : newValue

        const res = Reflect.set(target, key, newValue, receiver)

        if(isRef(oldValue) && !isRef(newValue)){
            oldValue.value = newValue

            return res
        }

        if (oldValue !== newValue) {
            trigger(target, key)
        }

        return res
    }
}

/**
 * 保存对象每个键的依赖关系
 * obj = {a:1,b:2}
 * targetMap = {
 *  [obj]: {
 *    a: Dep,
 *    b: Dep
 *  }
 * }
 */
const targetMap = new WeakMap<Record<any, any>, Map<string, Dep>>()

/**
 * 保存对象的代理关系
 */
const proxyMap = new WeakMap<Record<any, any>, (typeof Proxy)>()

/**
 * 响应式对象数据
 * @param target 对象
 * @returns 代理对象
 */
export function reactive(target) {
    if (!isObject(target)) {
        return target
    }
    if (isReactive(target)) return
    return createReactiveObject(target)
}

/**
 * 创建响应式对象数据
 * @param target 对象
 * @returns 代理对象
 */
function createReactiveObject(target) {

    // 对象已被代理过，则返回对应代理对象
    if (proxyMap.has(target)) {
        return proxyMap.get(target)
    }

    // 代理对象
    const proxy = new Proxy(target, mutableHandlers)

    proxyMap.set(target, proxy)

    return proxy
}

class Dep implements Dependencie {
    subs: Link;
    subsTail: Link;
}

/**
 * 收集对象某个键的依赖
 * @param target 对象
 * @param key 键
 */
function track(target, key) {
    if (!activeSub) return

    let depsMap = targetMap.get(target)

    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key)

    if (!dep) {
        dep = new Dep()
        depsMap.set(key, dep)
    }

    link(dep, activeSub)
}

/**
 * 触发对象某个键的依赖
 * @param target 对象
 * @param key 键
 */
function trigger(target, key) {

    const depsMap = targetMap.get(target)

    if (!depsMap) return

    const dep = depsMap.get(key)

    if (!dep) return

    propagate(dep.subs)
}

/**
 * 时不时响应式对象
 * @param target 对象
 */
function isReactive(target) {
    return target[ReactiveFlags.IS_REACTIVE]
}
