import { createWebpackModuleResolver } from "../utils/module-resolvers";
/**
 * Возвращает готовые опции composer для Webpack
 */
export function getWebpackComposerOptions() {
    return {
        modulePathResolver: createWebpackModuleResolver({
            basePath: "./modules",
            extension: ".ts",
        }),
    };
}
/**
 * Возвращает готовые опции composer для Webpack с кастомной конфигурацией
 */
export function getWebpackComposerOptionsCustom(basePath, extension) {
    return {
        modulePathResolver: createWebpackModuleResolver({
            basePath,
            extension,
        }),
    };
}
//# sourceMappingURL=webpack.js.map