// ==UserScript==
// @name         Video Capture
// @namespace    Violentmonkey Scripts
// @match        http*://*/*
// @grant        GM_addStyle
// @version      1.0
// @author       -
// @description  2023/11/29 10:12:34
// @run-at       document-start
// ==/UserScript==

import { attachToVideo } from '@/downloader'

import { init as initVideoSrcHook, registerSrcChangeListener } from '@/hooks/video-src'
import { init as initUrlHook } from '@/hooks/url'
import { init as initMediaApiHook } from '@/hooks/media-api'

function init() {
    initVideoSrcHook()
    initUrlHook()
    initMediaApiHook()
}

function main() {
    init()
    registerSrcChangeListener(el => {
        attachToVideo(el)
    })
}

main()
