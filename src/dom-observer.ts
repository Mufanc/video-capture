export class VideoObserver {
    private readonly observer: MutationObserver

    constructor(callback: (el: HTMLVideoElement) => void) {
        this.observer = new MutationObserver(recs => {
            recs.forEach(rec => {
                rec.addedNodes.forEach(node => {
                    if (!(node instanceof HTMLVideoElement)) return
                    callback(node)
                })
            })
        })
    }

    observe() {
        this.observer.observe(document.documentElement, { childList: true, subtree: true })
    }
}
