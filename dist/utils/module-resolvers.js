/**
 * Создает resolver для Vite
 * По умолчанию использует путь /src/modules с расширением .ts
 */
export function createViteModuleResolver(config) {
    const basePath = config?.basePath || "/src/modules";
    const extension = config?.extension || ".ts";
    return (moduleId) => `${basePath}/${moduleId}/index${extension}`;
}
/**
 * Создает resolver для Webpack
 * По умолчанию использует относительный путь ./modules
 */
export function createWebpackModuleResolver(config) {
    const basePath = config?.basePath || "./modules";
    const extension = config?.extension || ".ts";
    return (moduleId) => `${basePath}/${moduleId}/index${extension}`;
}
/**
 * Создает resolver для Rollup
 */
export function createRollupModuleResolver(config) {
    const basePath = config?.basePath || "/modules";
    const extension = config?.extension || ".js";
    return (moduleId) => `${basePath}/${moduleId}/index${extension}`;
}
/**
 * Создает resolver по умолчанию
 * Пытается автоматически определить окружение
 */
export function createDefaultModuleResolver(config) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const hasVite = new Function('try { return typeof import !== "undefined" && typeof import.meta !== "undefined" && import.meta.env !== undefined; } catch { return false; }')();
        if (hasVite) {
            return createViteModuleResolver(config);
        }
    }
    catch {
        // Игнорируем ошибки при проверке
    }
    if (typeof window !== "undefined" && window.__webpack_require__) {
        return createWebpackModuleResolver(config);
    }
    const basePath = config?.basePath || "/modules";
    const extension = config?.extension || ".js";
    return (moduleId) => `${basePath}/${moduleId}/index${extension}`;
}
//# sourceMappingURL=module-resolvers.js.map