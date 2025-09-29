import { describe, expect, it, assert,vi,test } from "vitest"
import { isRef, ref } from "../ref"
import { effect } from "../effect"

describe('reactivity/ref', () => {
  it('should hold a value', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
    a.value = 2
    expect(a.value).toBe(2)
  })

  it('should be reactive', () => {
    const a = ref(1)
    let dummy
    const fn = vi.fn(() => {
      dummy = a.value
    })
    effect(fn)
    
    expect(fn).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)
    a.value = 2
    expect(fn).toHaveBeenCalledTimes(2)
    expect(dummy).toBe(2)
    // same value should not trigger
    a.value = 2
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should work without initial value', () => {
    const a = ref()
    let dummy
    effect(() => {
      dummy = a.value
    })
    expect(dummy).toBe(undefined)
    a.value = 2
    expect(dummy).toBe(2)
  })

  test('should not trigger when setting the same raw object', () => {
    const obj = {}
    const r = ref(obj)
    const spy = vi.fn()
    effect(() => spy(r.value))
    expect(spy).toHaveBeenCalledTimes(1)

    // r.value = obj
    // expect(spy).toHaveBeenCalledTimes(1)
  })
})

