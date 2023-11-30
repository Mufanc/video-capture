const cache = new WeakMap<SourceBuffer, string>()

export function init() {
    MediaSource.prototype.addSourceBuffer = new Proxy(MediaSource.prototype.addSourceBuffer, {
        apply(...args) {
            const [, , [mime]] = args
            const buffer = Reflect.apply(...args)

            cache.set(buffer, mime)

            return buffer
        },
    })
}

export function getMimeType(buffer: SourceBuffer) {
    return cache.get(buffer)
}
