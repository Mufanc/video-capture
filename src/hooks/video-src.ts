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
                const [, element, [url]] = args
                const result = Reflect.apply(...args)

                if (element instanceof HTMLVideoElement) {
                    listeners.forEach(callback => callback(element, url))
                }

                return result
            },
        }),
    })
}

export function registerSrcChangeListener(callback: VideoSrcListener) {
    listeners.push(callback)
}
