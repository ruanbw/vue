import { isObject } from "@vue/shared";
import { Dependencie, link, Link, propagate } from "./system";
import { activeSub } from "./effect";

/**
 * obj = {a:1,b:2}
 * targetMap = {
 *  [obj]: {
 *    a: Dep,
 *    b: Dep
 *  }
 * }
 */
let targetMap = new WeakMap<object, Map<string, Dep>>()

export function reactive(target) {
    return createReactiveObject(target)
}

function createReactiveObject(target) {

    if (!isObject(target)) {
        return target
    }

    const proxy = new Proxy(target, {
        get(target, key, receiver) {

            track(target, key)

            return Reflect.get(target, key, receiver)
        },
        set(target, key, newValue, receiver) {

            const res = Reflect.set(target, key, receiver)

            trigger(target, key)

            return res
        }
    })

    return proxy
}

class Dep implements Dependencie {

    subs: Link;
    subsTail: Link;

    constructor() {

    }
}

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

function trigger(target, key) {

    const depsMap = targetMap.get(target)

    if (!depsMap) return

    const dep = depsMap.get(key)

    if (!dep) return

    propagate(dep.subs)
}
