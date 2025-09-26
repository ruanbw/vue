import { describe, expect, it, vi } from "vitest"
import { effect } from "../effect"
import { reactive } from "../reactive"

describe('reactivity/reactive', () => {


    it("reactive", () => {
        const obj = reactive({ a: 1 })

        const fnSpy = vi.fn(() => {
            console.log(obj.a);
        })

        effect(fnSpy)
        expect(fnSpy).toHaveBeenCalledTimes(1)
        obj.a = 2
        expect(fnSpy).toHaveBeenCalledTimes(2)
    })

})
