import { describe, expect, it, vi } from "vitest"
import { effect } from "../effect"
import { ref } from "../ref"
import { computed } from "../computed"

describe('reactivity/computed', () => {
    it('computed1', () => {
        const count = ref(0)
        
        const c = computed(() => count.value + 1)

        const fnSpyEffect = vi.fn(() => {
            console.log(c.value);
        })
        effect(fnSpyEffect)
        
        expect(c.value).toBe(1)
        expect(fnSpyEffect).toHaveBeenCalledTimes(1)
        count.value = 1
        expect(c.value).toBe(2)
        expect(fnSpyEffect).toHaveBeenCalledTimes(2)
    })

    it('computed2 run count', () => {
        const count = ref(0)

        const fnSpyComputed = vi.fn(() => {
            return count.value + 1
        })
        const c = computed(fnSpyComputed)
        c.value
        expect(fnSpyComputed).toHaveBeenCalledTimes(1)

        // computed依赖coun,但count的值没有改变，所以计算属性不更新
        count.value = 0
        expect(fnSpyComputed).toHaveBeenCalledTimes(1)

        count.value = 1
        expect(fnSpyComputed).toHaveBeenCalledTimes(2)
    })

    it('computed3 value cache', () => {
        const count = ref(0)

        const fnSpyComputed = vi.fn(() => {
            return count.value * 0
        })
        const c = computed(fnSpyComputed)

        const fnSpyEffect = vi.fn(() => {
            console.log(c.value)
        })
        effect(fnSpyEffect)

        expect(fnSpyEffect).toHaveBeenCalledTimes(1)
        expect(fnSpyComputed).toHaveBeenCalledTimes(1)

        count.value = 1
        expect(fnSpyEffect).toHaveBeenCalledTimes(1)
        expect(fnSpyComputed).toHaveBeenCalledTimes(2)
        expect(c.value).toBe(0)
    })

})
