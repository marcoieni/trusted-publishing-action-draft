// See: https://rollupjs.org/introduction/

import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

function configBlock(filename: string) {
    return {
        input: `src/${filename}.ts`,
        output: {
            esModule: true,
            file: `dist/${filename}.js`,
            format: "es",
            sourcemap: true,
        },
        plugins: [
            typescript(),
            commonjs(),
            nodeResolve({ preferBuiltins: true }),
        ],
    };
}

const config = [configBlock("main"), configBlock("post")];

export default config;
