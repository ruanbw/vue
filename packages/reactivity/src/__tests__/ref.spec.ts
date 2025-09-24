import {describe, expect, it} from "vitest"
import {isRef, ref} from "../ref"

describe('reactivity/ref', () => {
    it('should hold a value', () => {
        const a = ref(1)
        expect(a.value).toBe(1)
        a.value = 2
        expect(a.value).toBe(2)
    })

    it('isRef', () => {
        const a = ref(1)
        expect(isRef(a)).toBe(true)
    })
})