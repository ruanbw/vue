import { endTrack, Link, startTrack } from "./system";

export let activeSub

export class ReactiveEffect {
    /**
     * 依赖项链表的头节点
     */
    private deps: Link | undefined

    /**
     * 依赖项链表的尾节点
     */
    private depsTail: Link | undefined

    private tracking: boolean = false

    constructor(public fn) {
    }

    private run() {
        const prevSub = activeSub
        activeSub = this
        this.tracking = true
        startTrack(this)

        try {
            return this.fn()
        } finally {
            this.tracking = false
            endTrack(this)
            activeSub = prevSub

        }
    }

    notify() {
        this.scheduler()
    }

    private scheduler() {
        this.run()
    }
}

export function effect(fn: Function, options?: any) {
    const _effect = new ReactiveEffect(fn)
    Object.assign(_effect, options)

    _effect.notify()

    const runner = _effect.notify.bind(_effect)
    runner.effect = _effect

    return runner
}
