import { createViteModuleResolver } from "../utils/module-resolvers";
/**
 * Возвращает готовые опции composer для Vite
 */
export function getViteComposerOptions() {
    return {
        modulePathResolver: createViteModuleResolver({
            basePath: "/src/modules",
            extension: ".ts",
        }),
    };
}
/**
 * Возвращает готовые опции composer для Vite с кастомной конфигурацией
 */
export function getViteComposerOptionsCustom(basePath, extension) {
    return {
        modulePathResolver: createViteModuleResolver({
            basePath,
            extension,
        }),
    };
}
//# sourceMappingURL=vite.js.map