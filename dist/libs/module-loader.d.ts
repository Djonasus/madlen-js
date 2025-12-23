import { ComponentPool } from "./component";
import { DIPool } from "./di";
export interface ModuleDefinition {
    id: string;
    version: string;
    diPool: DIPool;
    componentPool: ComponentPool;
    init?: () => void | Promise<void>;
    destroy?: () => void;
}
export declare class ModuleLoader {
    private loadedModules;
    private loadingPromises;
    loadModule(moduleId: string, modulePath: string): Promise<ModuleDefinition>;
    private doLoadModule;
    private validateModule;
    private getAlternateExtensionPath;
    /**
     * Предзагружает модуль без необходимости указывать путь
     * Используется когда модуль уже импортирован статически
     * Не блокирует ленивую загрузку - если модуль не предзагружен, он загрузится по требованию
     */
    preloadModule(module: ModuleDefinition): void;
    getModule(moduleId: string): ModuleDefinition | undefined;
    isLoaded(moduleId: string): boolean;
    unloadModule(moduleId: string): Promise<void>;
}
export declare const moduleLoader: ModuleLoader;
//# sourceMappingURL=module-loader.d.ts.map