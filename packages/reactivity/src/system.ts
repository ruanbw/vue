/**
 * 依赖项
 */
export interface Dependencie {
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
    dep: Dependencie
    // 下一个依赖项节点
    nextDep: Link | undefined
}

let linkPool: Link | undefined

/**
 * 链接链表关系
 * @param dep 依赖
 * @param sub 订阅者
 */
export function link(dep: Dependencie, sub: Sub) {

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
    let newLink: Link = undefined
    if (linkPool) {
        newLink = linkPool
        linkPool = linkPool.nextDep
        newLink.nextDep = nextDep
        newLink.dep = dep
        newLink.sub = sub
    } else {
        newLink = {
            dep,
            sub,
            prevSub: undefined,
            nextSub: undefined,
            nextDep,
        }
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
    if (sub.depsTail) {
        sub.depsTail.nextDep = newLink
        sub.depsTail = newLink
    } else {
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
        const sub = link.sub
        if (!sub.tracking) {
            queuedEffect.push(link.sub)
        }
        link = link.nextSub
    }

    queuedEffect.forEach((effect) => effect.notify())
}

/**
 * 开始收集依赖
 * @param sub 
 */
export function startTrack(sub: Sub) {
    // 标记为重新执行依赖
    sub.depsTail = undefined
}

/**
 * 依赖收集完毕，清除未使用的依赖
 * @param sub 
 */
export function endTrack(sub: Sub) {
    const depsTail = sub.depsTail
    /**
     * depsTail存在，并且depsTail有nextDep 
     * depsTail不存在，但deps存在
     */
    if (depsTail) {
        if (depsTail.nextDep) {
            clearTracking(depsTail.nextDep)
            depsTail.nextDep = undefined
        }
    } else if (sub.deps) {
        clearTracking(sub.deps)
        sub.deps = undefined
    }
}

function clearTracking(link: Link) {
    while (link) {
        const { dep, nextDep, nextSub, prevSub } = link

        /**
         * 如果 prevSub 有，那就把 prevSub 的下一个节点指向当前的下一个
         * 如果没有，那就是头节点，那就把 dep.subs 指向当前节点的下一个
         */
        if (prevSub) {
            prevSub.nextSub = nextSub
            link.nextSub = undefined
        } else {
            dep.subs = nextSub
        }

        /**
         * 如果 nextSub有，那就把nextSub的上一个节点，指向当前节点的上一个节点
         * 如果nextSub没有，那就是尾节点，把dep.depTail指向上一个节点
         */
        if (nextSub) {
            nextSub.prevSub = prevSub
            link.prevSub = undefined
        } else {
            dep.subsTail = prevSub
        }

        link.dep = undefined
        link.sub = undefined
        link.nextDep = linkPool
        linkPool = link
        link = nextDep
    }
}
