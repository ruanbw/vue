import {Link} from "./system";

export let activeSub

export class ReactiveEffect {
    /**
     * 依赖项链表的头节点
     */
    deps: Link | undefined

    /**
     * 依赖项链表的尾节点
     */
    depsTail: Link | undefined

    constructor(public fn) {
    }

    run() {
        const prevSub = activeSub
        activeSub = this

        // 标记为重新执行依赖
        this.depsTail = undefined

        try {
            return this.fn()
        } finally {
            activeSub = prevSub
        }
    }

    notify() {
        this.scheduler()
    }

    scheduler() {
        this.run()
    }
}

export function effect(fn: Function, options?: any) {
    const _effect = new ReactiveEffect(fn)
    Object.assign(_effect, options)

    _effect.run()

    const runner = _effect.run.bind(_effect)
    runner.effect = _effect

    return runner
}