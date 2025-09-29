import { describe, expect, it, vi } from "vitest"
import { hasChanged } from "../index";

describe('shared', () => {

    it("isChanged", () => {
        const obj = { a: 1 }

        let changed = hasChanged(obj,obj)
        // 没有被改变
        expect(changed).toBe(false)

    })
})
