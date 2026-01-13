// esbuild.config.js 修复版（适配 Node.js 22 + EdgeOne）
import esbuild from 'esbuild';
import { nodeModulesPolyfill } from '@esbuild-plugins/node-modules-polyfill';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import resolve from 'esbuild-plugin-resolve';
import replace from 'esbuild-plugin-text-replace';

// 构建 Deno 版本（保留原有逻辑）
esbuild.build({
  entryPoints: ['node.js'],
  outfile: 'dist/deno.js',
  bundle: true,
  platform: 'neutral',
  target: 'esnext',
  format: 'esm',
  plugins: [
    nodeModulesPolyfill(),
    NodeGlobalsPolyfillPlugin({
      buffer: true,
      process: true,
    }),
    resolve({
      crypto: 'crypto-browserify',
      buffer: 'buffer',
    }),
    replace({
      include: /node_modules\/.+/,
      replace: [
        { from: 'process.env.NODE_ENV', to: '"production"' },
      ],
    }),
  ],
  define: {
    'process.env.PORT': '8080', // 适配 EdgeOne 端口
    global: 'globalThis', // 修复 Node.js 22 的全局变量问题
  },
}).catch(() => process.exit(1));

// 构建 Node.js 版本（新增，确保构建不报错）
esbuild.build({
  entryPoints: ['node.js'],
  outfile: 'dist/node.js',
  bundle: true,
  platform: 'node',
  target: 'node18', // 兼容项目要求的 Node.js ≥18
  format: 'esm',
  external: ['@hono/node-server', 'hono'], // 排除无需打包的依赖
}).catch(() => process.exit(1));
