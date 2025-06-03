import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import eslintPlugin from 'vite-plugin-eslint';
import legacy from '@vitejs/plugin-legacy';

const __dirname = dirname(fileURLToPath(import.meta.url));
const plugins = [
  vue(),
  eslintPlugin({
    failOnError: false, //报错不影响编译
    failOnWarning: false, // 警告不影响编译
    include: ['src/**/*.js', 'src/**/*.vue']
  })
];
let libConfig = {
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'index',
      // 将添加适当的扩展名后缀
      fileName: 'index'
    },
    rollupOptions: {
      // 确保外部化处理那些
      // 你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖
        // 提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
};
if (process.env.CUSTOM_NODE_ENV === 'demo') {
  libConfig = {
    build: {}
  };
  plugins.push(legacy({}));
}
export default defineConfig({
  base: '/vue2-color-picker-gradient',
  plugins: [...plugins],
  build: {
    ...libConfig.build
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  lintOnSave: true
});
