import { describe, expect, it, vi } from "vitest"
import { effect } from "../effect"
import { ref } from "../ref"

describe('reactivity/effect', () => {
    it('should run the passed function once (wrapped by a effect)', () => {
        const fnSpy = vi.fn(() => { })
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
    
    it('recursion', () => {
        const count = ref(0)
        const fnSpy = vi.fn(() => { count.value++})
        effect(fnSpy)
        expect(fnSpy).toHaveBeenCalledTimes(1)
    });

    it('switch branches', () => {
        const name = ref("foo")
        const age = ref(18)
        const flag = ref(true)
        let dummy

        const fnSpy = vi.fn(() => {
            if (flag.value) {
                dummy = name.value
            } else {
                dummy = age.value
            }
        })

        effect(fnSpy)
        expect(fnSpy).toHaveBeenCalledTimes(1)
        expect(dummy).toBe("foo")

        /**
         * flag === false
         * name的依赖清除
         */
        flag.value = !flag.value
        expect(fnSpy).toHaveBeenCalledTimes(2)
        expect(dummy).toBe(18)

        /**
         * flag === false
         * name的依赖清除，改变name的值后没有依赖执行，那么fnSpy就没有被调用，历史调用次数还是2
         */
        name.value = "foo2"
        expect(fnSpy).toHaveBeenCalledTimes(2)
        expect(dummy).toBe(18)

        age.value++
        expect(fnSpy).toHaveBeenCalledTimes(3)
        expect(dummy).toBe(19)
    });
})
