import fs from 'fs/promises'
import path from 'path'
import { glob } from 'glob'

const userscript = 'video-capture'

!(async () => {
    const src = (await fs.readFile('src/index.ts')).toString()
    const metadata = src.match(/(?:\/\/ .+\n+)+/)![0]

    await fs.mkdir('build/dist', { recursive: true })

    const files = await glob('build/rollup/index*.js')
    files.map(async file => {
        const content = (await fs.readFile(file)).toString()

        const ext = path.extname(file)
        const basename = path.basename(file, ext)
        const output = basename.replace(/^[^.]+/, userscript) + '.user' + ext

        await fs.writeFile(path.join('build/dist', output), metadata + content)
    })
})()
