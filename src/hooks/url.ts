const cache = new Map<string, MediaSource>()

export function init() {
    URL.createObjectURL = new Proxy(URL.createObjectURL, {
        apply(...args): any {
            const object = args[2][0]
            const url = Reflect.apply(...args)

            if (object instanceof MediaSource) {
                cache.set(url, object)
            }

            return url
        },
    })

    URL.revokeObjectURL = new Proxy(URL.revokeObjectURL, {
        apply(...args) {
            const url: string = args[2][0]

            cache.delete(url)

            return Reflect.apply(...args)
        },
    })
}

export function getMediaSource(url: string) {
    return cache.get(url)
}
