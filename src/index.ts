// ==UserScript==
// @name         Video Downloader
// @namespace    Violentmonkey Scripts
// @match        http*://*/*
// @grant        GM_addStyle
// @version      1.0
// @author       -
// @description  2023/11/29 10:12:34
// @run-at       document-start
// ==/UserScript==

import { VideoDownloader } from '@/downloader'

import { init as initVideoSrcHook, registerOnVideoSrcListener } from '@/hooks/video-src'
import { init as initUrlHook } from '@/hooks/url'
import { init as initMediaSourceHook } from '@/hooks/media-source'

function init() {
    initVideoSrcHook()
    initUrlHook()
    initMediaSourceHook()
}

function main() {
    init()
    registerOnVideoSrcListener(el => {
        VideoDownloader.create(el)
    })
}

main()
