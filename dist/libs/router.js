import { moduleLoader } from "./module-loader";
import { from } from "rxjs";
import { switchMap, catchError } from "rxjs/operators";
export class ModuleRouter {
    constructor(options) {
        this.modulePathResolver = options.modulePathResolver;
        this.routingMap = options.routingMap;
        this.onModuleLoaded = options.onModuleLoaded;
        this.onModuleError = options.onModuleError;
    }
    /**
     * Получает путь к модулю из карты маршрутизации или использует resolver
     */
    getModulePath(moduleId) {
        if (this.routingMap) {
            if (this.routingMap instanceof Map) {
                const path = this.routingMap.get(moduleId);
                if (path) {
                    return path;
                }
            }
            else if (typeof this.routingMap === "function") {
                return this.routingMap(moduleId);
            }
        }
        return this.modulePathResolver(moduleId);
    }
    /**
     * Извлекает все уникальные moduleId из дерева компонентов рекурсивно
     */
    extractModuleIds(layout) {
        const moduleIds = new Set();
        const traverse = (component) => {
            if (component.moduleId) {
                moduleIds.add(component.moduleId);
            }
            if (component.children && Array.isArray(component.children)) {
                component.children.forEach((child) => traverse(child));
            }
        };
        traverse(layout);
        return moduleIds;
    }
    /**
     * Предзагружает все модули, необходимые для раскладки
     * @param layout - раскладка страницы с бэкенда
     * @returns Promise, который резолвится когда все модули загружены
     */
    async preloadModulesFromLayout(layout) {
        const moduleIds = this.extractModuleIds(layout);
        const loadPromises = [];
        for (const moduleId of moduleIds) {
            const modulePath = this.getModulePath(moduleId);
            const loadPromise = moduleLoader
                .loadModule(moduleId, modulePath)
                .then((module) => {
                if (this.onModuleLoaded) {
                    this.onModuleLoaded(module, moduleId);
                }
                return module;
            })
                .catch((error) => {
                const err = error instanceof Error ? error : new Error(String(error));
                console.error(`Ошибка загрузки модуля ${moduleId}:`, err);
                if (this.onModuleError) {
                    this.onModuleError(err, moduleId);
                }
                throw err;
            });
            loadPromises.push(loadPromise);
        }
        return Promise.all(loadPromises);
    }
    /**
     * Предзагружает модули из раскладки и возвращает Observable с раскладкой
     * Используется для интеграции с Bootstrap.render()
     * @param layout$ - Observable с раскладкой страницы
     * @returns Observable с той же раскладкой, но после предзагрузки модулей
     */
    preloadModulesFromLayout$(layout$) {
        return layout$.pipe(switchMap((layout) => {
            return from(this.preloadModulesFromLayout(layout)).pipe(catchError((error) => {
                console.warn("Не удалось предзагрузить некоторые модули, будет попытка загрузки при рендеринге:", error);
                return from([]);
            }), switchMap(() => {
                return from([layout]);
            }));
        }));
    }
}
//# sourceMappingURL=router.js.map