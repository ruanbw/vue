import { endTrack, Link, startTrack, Sub } from "./system";

export let activeSub
export function setActiveSub(sub) {
    activeSub = sub
}

export class ReactiveEffect implements Sub {
    /**
     * 依赖项链表的头节点
     */
    deps: Link | undefined

    /**
     * 依赖项链表的尾节点
     */
    depsTail: Link | undefined

    tracking: boolean = false

    constructor(public fn) {
    }

    private run() {
        const prevSub = activeSub
        setActiveSub(this)
        this.tracking = true
        startTrack(this)

        try {
            return this.fn()
        } finally {
            this.tracking = false
            endTrack(this)
            setActiveSub(prevSub)

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
