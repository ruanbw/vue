import { describe, expect, it, vi } from "vitest"
import { effect } from "../effect"
import { reactive } from "../reactive"

describe('reactivity/reactive', () => {

    it("reactive1", () => {
        const obj = reactive({ a: 1 })

        const fnSpy = vi.fn(() => {
            console.log(obj.a);
        })

        effect(fnSpy)
        expect(fnSpy).toHaveBeenCalledTimes(1)
        obj.a = 2
        expect(fnSpy).toHaveBeenCalledTimes(2)
    })

    it("reactive2", () => {
        const obj = { a: 1 }
        const proxy1 = reactive(obj)
        const proxy2 = reactive(obj)
        expect(proxy1).toEqual(proxy2)
    })

    it("old value", () => {
        const obj = { a: 1 }
        const proxy = reactive(obj)

        const fnSpy = vi.fn(() => {
            console.log(proxy.a);
        })

        effect(fnSpy)
        expect(fnSpy).toHaveBeenCalledTimes(1)
        proxy.a = 1
        expect(fnSpy).toHaveBeenCalledTimes(1)
        proxy.a = 2
        expect(fnSpy).toHaveBeenCalledTimes(2)
    })
})
