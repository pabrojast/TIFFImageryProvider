import { readFileSync } from 'fs';
import esbuild from 'rollup-plugin-esbuild';
import path from 'path';
import dts from 'rollup-plugin-dts';
import webWorkerLoader from "rollup-plugin-web-worker-loader";

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url)).toString(),
);

const deps = { ...pkg.dependencies, ...pkg.peerDependencies };
const external = Object.keys(deps)

// Plugin to add .js extension to terriajs-cesium imports in output
function addJsExtensionPlugin() {
  return {
    name: 'add-js-extension',
    renderChunk(code) {
      // Add .js to terriajs-cesium imports (both with 'from' and bare imports)
      return code
        .replace(
          /from\s+['"]terriajs-cesium\/Source\/(Core|Scene)\/([^'"]+)['"]/g,
          (match, folder, module) => {
            if (!module.endsWith('.js')) {
              return `from 'terriajs-cesium/Source/${folder}/${module}.js'`;
            }
            return match;
          }
        )
        .replace(
          /import\s+['"]terriajs-cesium\/Source\/(Core|Scene)\/([^'"]+)['"]/g,
          (match, folder, module) => {
            if (!module.endsWith('.js')) {
              return `import 'terriajs-cesium/Source/${folder}/${module}.js'`;
            }
            return match;
          }
        );
    }
  };
}

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    input: 'src/index.ts',
    output: {
      dir: path.dirname(pkg.main),
      name: pkg.main,
      format: 'esm',
      sourcemap: true,
      // preserveModules: true,
    },
    external,
    plugins: [
      esbuild({
        target: 'es6',
      }),
      webWorkerLoader({
        targetPlatform: "browser",
        extensions: ["ts", "js"],
      }),
      webWorkerLoader({
        extensions: ["ts", "js"],
      }),
      addJsExtensionPlugin(),
    ]
  }, 
  {
    input: 'src/index.ts',
    output: {
      dir: path.dirname(pkg.types),
      entryFileNames: '[name].d.ts',
      format: 'esm',
    },
    plugins: [dts()],
  },
];

export default config;