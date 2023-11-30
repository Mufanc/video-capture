const keyProgress = Symbol()
const keyProgressL = Symbol()

const keyMime = Symbol()
const keyBuffer = Symbol()
const keyParent = Symbol()

export interface ProgressListener {
    (captured: { [mime: string]: number }): void
}

class Captured {
    count: number = 0
    buffers: BufferSource[] = []
}

declare global {
    interface MediaSource {
        [keyProgress]: Parameters<ProgressListener>[0]
        [keyProgressL]: ProgressListener | undefined
    }

    interface SourceBuffer {
        [keyMime]: string | undefined
        [keyBuffer]: Captured | undefined
        [keyParent]: MediaSource | undefined
    }
}

function defineProp<T, K extends keyof T, V extends T[K]>(obj: T, key: K, value: V) {
    Object.defineProperty(obj, key, {
        value,
        enumerable: false,
    })
}

export function init() {
    MediaSource.prototype.addSourceBuffer = new Proxy(MediaSource.prototype.addSourceBuffer, {
        apply(...args) {
            const source: MediaSource = args[1]
            const mime: string = args[2][0]
            const buffer: SourceBuffer = Reflect.apply(...args)

            defineProp(buffer, keyMime, mime)
            defineProp(buffer, keyBuffer, new Captured())
            defineProp(buffer, keyParent, source)

            if (!source[keyProgress]) source[keyProgress] = {}
            source[keyProgress][mime] = 0

            return buffer
        },
    })

    SourceBuffer.prototype.appendBuffer = new Proxy(SourceBuffer.prototype.appendBuffer, {
        apply(...args) {
            const source: SourceBuffer = args[1]
            const buffer: BufferSource = args[2][0]

            const result = Reflect.apply(...args)

            const captured = source[keyBuffer]
            const mime = source[keyMime]
            const parent = source[keyParent]

            if (captured && mime && parent) {
                captured.buffers.push(buffer)
                captured.count++

                const progress = parent[keyProgress]

                progress[mime] = captured.count
                parent[keyProgressL]?.call(parent, progress)
            }

            return result
        },
    })
}

export function getMimeType(buffer: SourceBuffer): string | undefined {
    return buffer[keyMime]
}

export function getCapturedBuffers(buffer: SourceBuffer): BufferSource[] | undefined {
    return buffer[keyBuffer]?.buffers
}

export function registerProgressListener(src: MediaSource, listener: ProgressListener) {
    defineProp(src, keyProgressL, listener)
}
