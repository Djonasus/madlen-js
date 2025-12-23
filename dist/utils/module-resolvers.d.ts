export interface ModuleResolverConfig {
    basePath?: string;
    extension?: string;
    useAlias?: boolean;
}
/**
 * Создает resolver для Vite
 * По умолчанию использует путь /src/modules с расширением .ts
 */
export declare function createViteModuleResolver(config?: ModuleResolverConfig): (moduleId: string) => string;
/**
 * Создает resolver для Webpack
 * По умолчанию использует относительный путь ./modules
 */
export declare function createWebpackModuleResolver(config?: ModuleResolverConfig): (moduleId: string) => string;
/**
 * Создает resolver для Rollup
 */
export declare function createRollupModuleResolver(config?: ModuleResolverConfig): (moduleId: string) => string;
/**
 * Создает resolver по умолчанию
 * Пытается автоматически определить окружение
 */
export declare function createDefaultModuleResolver(config?: ModuleResolverConfig): (moduleId: string) => string;
//# sourceMappingURL=module-resolvers.d.ts.map