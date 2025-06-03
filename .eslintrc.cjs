/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');
// @rushstack/eslint-patch 是由微软 Rush Stack 团队开发的工具，
// 主要用于 修复 ESLint 在现代 JavaScript/TypeScript 项目中的兼容性问题
// 尤其在复杂工具链或特定框架（如 Vue、React）中表现突出
// 继承的位置后面的会覆盖前面的
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/essential', // Vue 2 推荐规则
    // 'plugin:vue/vue3-recommended', // 更全面的 Vue 规则（适用于 Vue 3）
    '@vue/eslint-config-prettier', // vue中使用关闭冲突规则
    '@vue/eslint-config-prettier/skip-formatting' // 跳过eslint格式化，把格式化交给prittier
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      modules: true
    }
  },
  rules: {
    'prettier/prettier': 'error' // 启用 Prettier 规则
  }
};
