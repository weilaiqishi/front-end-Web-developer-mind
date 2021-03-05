function throttle(callback, wait) {
    let start = 0
    return function (...args) {
        const now = new Date().getTime()
        if (now - start >= wait) {
            callback.call(this, ...args)
            start = now
        }
    }
}

function debounce(callback, time) {
    let timeout = null
    return function (...args) {
        if (timeout !== null) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
            callback.call(this, ...args)
            timeout = null
        }, time)
    }
}