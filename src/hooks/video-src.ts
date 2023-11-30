interface VideoSrcListener {
    (el: HTMLVideoElement, src: string): void
}

const listeners: VideoSrcListener[] = []

export function init() {
    const backup = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src')!

    Object.defineProperty(HTMLMediaElement.prototype, 'src', {
        get: new Proxy(backup.get!, {}),
        set: new Proxy(backup.set!, {
            apply(...args) {
                const [, el, [url]] = args
                const result = Reflect.apply(...args)

                if (el instanceof HTMLVideoElement) {
                    listeners.forEach(callback => callback(el, url))
                }

                return result
            },
        }),
    })

    // Object.setPrototypeOf(c
    //     HTMLMediaElement,
    //     new Proxy(HTMLMediaElement.prototype, {
    //         set(...args): boolean {
    //             const [, prop] = args
    //
    //             if (prop === 'src') {
    //                 debugger
    //             }
    //
    //             return Reflect.set(...args)
    //         },
    //     }),
    // )
}

export function registerOnVideoSrcListener(callback: VideoSrcListener) {
    listeners.push(callback)
}
