// See: https://rollupjs.org/introduction/

import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

function configBlock(filename) {
    return {
        input: `src/${filename}.js`,
        output: {
            esModule: true,
            file: `dist/${filename}.js`,
            format: "es",
            sourcemap: true,
        },
        plugins: [commonjs(), nodeResolve({ preferBuiltins: true })],
    };
}

const config = [configBlock("main"), configBlock("post")];

export default config;
