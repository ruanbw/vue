/**
 * 依赖项
 */
export interface Dep {
    // 订阅者链表的头节点
    subs: Link | undefined
    // 订阅者链表的尾节点
    subsTail: Link | undefined
}

/**
 * 订阅者
 */
export interface Sub {
    // 依赖项链表的头节点
    deps: Link | undefined
    // 依赖项链表的尾节点
    depsTail: Link | undefined
}

export interface Link {
    // 订阅者
    sub: Sub
    // 下一个订阅者节点
    nextSub: Link | undefined
    // 上一个订阅者节点
    prevSub: Link | undefined
    // 依赖项
    dep: Dep
    // 下一个依赖项节点
    nextDep: Link | undefined
}

/**
 * 链接链表关系
 * @param dep 依赖
 * @param sub 订阅者
 */
export function link(dep: Dep, sub: Sub) {

    // 如果dep和sub已经关联过了，则不处理
    const currentDep = sub.depsTail

    /**
     * 复用节点的两种情况
     * 1. sub.depsTail没有，并且sub.deps有，则复用头节点
     * 2. 如果尾节点有sub.nextDep，则尝试复用尾结点的nextDep
     */

    const nextDep = currentDep === undefined ? sub.deps : currentDep.nextDep

    if (nextDep && nextDep.dep === dep) {
        sub.depsTail = nextDep
        return
    }

    /**
     * dep  理解为响应式对象
     * sub  理解为使用、访问响应式对象的函数
     */
    const newLink: Link = {
        dep,
        sub,
        prevSub: undefined,
        nextSub: undefined,
        nextDep: undefined,
    }

    /**
     * 关联链表关系，分两种情况
     * 1. 尾节点有，那就往尾节点后面加
     * 2. 如果尾节点没有，则表示第一次关联，那就往头节点加，头尾相同
     */
    if (dep.subsTail) {
        dep.subsTail.nextSub = newLink
        newLink.prevSub = dep.subsTail
        dep.subsTail = newLink
    } else {
        dep.subs = newLink
        dep.subsTail = newLink
    }

    /**
     * 订阅者链表关系
     * 1. 尾节点有，那就往尾节点后面加
     * 2. 如果尾节点没有，则表示第一次关联，那就往头节点加，头尾相同
     */
    if (sub.depsTail){
        sub.depsTail.nextDep = newLink
        sub.depsTail = newLink
    }else{
        sub.deps = newLink
        sub.depsTail = newLink
    }
}

/**
 * 传播更新
 * @param subs 订阅者
 */
export function propagate(subs: Link) {
    let link = subs
    let queuedEffect = []
    while (link) {
        queuedEffect.push(link.sub)
        link = link.nextSub
    }

    queuedEffect.forEach((effect) => effect.notify())
}