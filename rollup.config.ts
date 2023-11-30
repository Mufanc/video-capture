import { defineConfig } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import Terser from '@rollup/plugin-terser'
import Alias from '@rollup/plugin-alias'

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    input: 'build/js/index.js',
    output: [
        {
            file: 'build/rollup/index.js',
            format: 'iife',
        },
        {
            file: 'build/rollup/index.min.js',
            format: 'iife',
            plugins: [Terser()],
        },
    ],
    plugins: [nodeResolve(), Alias({ entries: [{ find: '@', replacement: '.' }] })],
})
