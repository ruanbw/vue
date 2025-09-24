import {describe, expect, it,vi} from "vitest"
import {effect} from "../effect"
import {ref} from "../ref"

describe('reactivity/effect', () => {
    it('should run the passed function once (wrapped by a effect)', () => {
        const fnSpy = vi.fn(() => {})
        effect(fnSpy)
        expect(fnSpy).toHaveBeenCalledTimes(1)
    })

    it('should value', () => {
        let dummy
        const count = ref(0)
        effect(() => {
            dummy = count.value
        })
        expect(dummy).toBe(0)
        count.value++
        expect(dummy).toBe(1)
    });

})