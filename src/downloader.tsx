import React, { stopPropagation } from 'jsx-dom/min'
import { getMimeType } from '@/hooks/media-source'
import { getMediaSource } from '@/hooks/url'
import { delay } from '@/utils'

GM_addStyle(`
    .download-video {
        display: none;
        position: absolute !important;
        right: 10px !important;
        top: 10px !important;
        z-index: 2147483647 !important;
        padding: .5em !important;
        font-size: 1.1rem !important;
        font-family: system-ui !important;
        border-radius: .5em !important;
        background-color: rgba(255, 255, 255, 0.85) !important;
    }
    
    .video-parent:hover > video[src] ~ .download-video {
        display: block;                       
    }
`)

export class VideoDownloader {
    private readonly video: HTMLVideoElement
    private readonly src: MediaSource

    private constructor(el: HTMLVideoElement, src: MediaSource) {
        this.video = el
        this.src = src

        const container = el.parentElement!

        container.classList.add('video-parent')
        container.appendChild(
            <button className="download-video" onClick={ev => this.download(ev)}>
                下载该视频
            </button>,
        )
    }

    async download(event: MouseEvent) {
        event.stopPropagation()

        this.video.pause()
        this.video.currentTime = 0

        const buffers = this.src.sourceBuffers
        const streams: { [mime: string]: any[] } = {}

        for (let i = 0; i < buffers.length; i++) {
            const buffer = buffers[i]
            const mime = getMimeType(buffer)

            if (!mime) continue

            streams[mime] = []

            if (buffer.updating) {
                await new Promise(resolve => {
                    buffer.addEventListener('update', resolve, { once: true })
                })
            }

            buffer.remove(0, this.src.duration)
            buffer.appendBuffer = new Proxy(buffer.appendBuffer, {
                apply(...args) {
                    const [, , [buffer]] = args

                    streams[mime].push(buffer)

                    return Reflect.apply(...args)
                },
            })
        }

        this.src.addEventListener(
            'sourceended',
            () => {
                for (const [mime, buffers] of Object.entries(streams)) {
                    const [, type, extension, codec] = mime.match(/(.+)\/(.+);(.+)/)!

                    debugger

                    const blob = new Blob(buffers, { type: `${type}/${extension}` })
                    const url = URL.createObjectURL(blob)

                    const download: HTMLElement = (
                        <a
                            download={`${document.title}.${type}.${extension}`}
                            href={url}
                            onClick={ev => ev.stopPropagation()}
                        ></a>
                    ) as any

                    download.click()
                    download.remove()

                    URL.revokeObjectURL(url)
                }
            },
            { once: true },
        )

        // async function resume(el: HTMLVideoElement) {
        //     try {
        //         await el.play()
        //         el.playbackRate = 5
        //     } catch (err) {
        //         await delay(100)
        //         await resume(el)
        //     }
        // }
        //
        // await resume(this.video)

        await this.video.play()
    }

    static create(el: HTMLVideoElement) {
        const source = getMediaSource(el.src)
        if (!source) return null
        return new VideoDownloader(el, source)
    }
}
