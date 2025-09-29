import { activeSub, setActiveSub } from "./effect"
import { ReactiveFlags } from "./ref"
import { Dependencie, endTrack,link, Link, startTrack, Sub } from "./system"
import {hasChanged} from "@vue/shared";

/**
 * 计算属性
 */
export function computed(getterOrOptions) {
    let getter
    let setter

    if (typeof getterOrOptions === "function") {
        getter = getterOrOptions
    } else {
        const { get, set } = getterOrOptions
        getter = get
        setter = set
    }
    return new ComputedRefImpl(getter, setter)
}

class ComputedRefImpl implements Dependencie, Sub {
    _value
    subs: Link
    subsTail: Link
    deps: Link
    depsTail: Link

    tracking: boolean

    dirty = true

    private [ReactiveFlags.IS_REF] = true

    constructor(public getter, private setter) {

    }

    get value() {
        if (this.dirty){
            this.update()
        }
        if(activeSub){
            link(this,activeSub)
        }
        return this._value
    }

    set value(newValue) {
        if (this.setter) {
            this.setter(newValue)
        } else {
            console.warn("只读");
        }
    }

    update() {
        const prevSub = activeSub
        setActiveSub(this)
        startTrack(this)
        try{
            const oldValue = this._value
            this._value = this.getter()
            this.dirty = false
            return hasChanged(this._value, oldValue)
        }
        finally{
            endTrack(this)
            setActiveSub(prevSub)
        }
    }
}
