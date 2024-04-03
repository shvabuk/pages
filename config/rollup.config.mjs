import path from 'node:path';
import { fileURLToPath } from 'node:url';
import banner from './banner.mjs';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rollupConfig = {
  input: globSync(`${path.resolve(__dirname, '../esm')}**/*.js`),
  output: {
    banner: banner(),
    dir: path.resolve(__dirname, `../commonjs`),
    format: 'cjs',
    generatedCode: 'es2015',
    entryFileNames: "[name].cjs"
  },
  external: ['glob', 'twig', 'pretty', 'decompress', 'follow-redirects', 'node:fs', 'node:path', 'node:readline'],
}

export default rollupConfig;
