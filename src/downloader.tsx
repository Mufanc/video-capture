import React from 'jsx-dom/min'
import { getMediaSource } from '@/hooks/url'
import { getCapturedBuffers, getMimeType, registerProgressListener } from '@/hooks/media-api'

// prettier-ignore
GM_addStyle(
`
    .download-video {
        display: none;
        position: absolute;
        right: 10px;
        top: 10px;
        z-index: 2147483647;
        padding: .5em;
        text-align: end;
        font-size: 1rem;
        font-family: monospace;
        border-radius: .5em;
        background-color: rgba(255, 255, 255, 0.85);
        border: none;
    }
    
    .video-parent:hover > video[src] ~ .download-video {
        display: block;
    }
`
        .replace(/;\n/g, ' !important;\n')
        .replace(/\s+/g, ' '),
)

async function download(src: MediaSource) {
    const sources = src.sourceBuffers

    for (let i = 0; i < sources.length; i++) {
        const source = sources[i]
        const mime = getMimeType(source)

        if (!mime) continue

        if (source.updating) {
            await new Promise(resolve => {
                source.addEventListener('update', resolve, { once: true })
            })
        }

        const buffers = getCapturedBuffers(source)

        const [, type, extension, codec] = mime.match(/(.+?)\/(.+?);(.+)/)!

        console.log(`download ${type}`, codec)

        const blob = new Blob(buffers, { type: `${type}/${extension}` })
        const url = URL.createObjectURL(blob)

        const download = (
            <a
                download={`${document.title}.${type}.${extension}`}
                href={url}
                onClick={ev => ev.stopPropagation()}
            ></a>
        ) as HTMLElement

        download.click()
        download.remove()

        URL.revokeObjectURL(url)
    }
}

export function attachToVideo(el: HTMLVideoElement) {
    const src = getMediaSource(el.src)
    if (!src) return

    const container = el.parentElement!
    const button = <button className="download-video"></button>

    container.classList.add('video-parent')
    container.appendChild(button)

    registerProgressListener(src, captured => {
        const buffer: string[] = []

        for (const [mime, count] of Object.entries(captured)) {
            buffer.push(`${mime}: ${count}<br/>`)
        }

        button.innerHTML = buffer.join('')
    })

    src.addEventListener('sourceended', async () => {
        button.innerHTML = '下载视频'
        button.addEventListener('click', async () => await download(src))
    })
}
