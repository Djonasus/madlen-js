export * from "./libs/di";
export * from "./libs/component";
export * from "./libs/http";
export * from "./libs/module-loader";
export * from "./libs/composer";
export * from "./libs/bootstrap";
export * from "./utils/module-resolvers";
export * from "./configs";
// Явные реэкспорты для лучшей совместимости с bundler'ами
export { getViteComposerOptions, getViteComposerOptionsCustom, } from "./configs/vite";
export { getWebpackComposerOptions, getWebpackComposerOptionsCustom, } from "./configs/webpack";
//# sourceMappingURL=index.js.map