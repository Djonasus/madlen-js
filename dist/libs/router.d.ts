import { ModuleDefinition } from "./module-loader";
import { ComponentDefinition } from "./composer";
import { Observable } from "rxjs";
/**
 * Карта маршрутизации: маппинг moduleId -> путь к модулю.
 * Если не указана, используется modulePathResolver
 */
export type RoutingMap = Map<string, string> | ((moduleId: string) => string);
export interface RouterOptions {
    /**
     * Функция для преобразования moduleId в путь к файлу модуля
     * Используется, если routingMap не указан
     */
    modulePathResolver: (moduleId: string) => string;
    /**
     * Карта маршрутизации: явный маппинг moduleId -> путь к модулю
     * Если указана, имеет приоритет над modulePathResolver
     */
    routingMap?: RoutingMap;
    /**
     * Callback, вызываемый при успешной загрузке модуля
     */
    onModuleLoaded?: (module: ModuleDefinition, moduleId: string) => void;
    /**
     * Callback, вызываемый при ошибке загрузки модуля
     */
    onModuleError?: (error: Error, moduleId: string) => void;
}
export declare class ModuleRouter {
    private modulePathResolver;
    private routingMap?;
    private onModuleLoaded?;
    private onModuleError?;
    constructor(options: RouterOptions);
    /**
     * Получает путь к модулю из карты маршрутизации или использует resolver
     */
    private getModulePath;
    /**
     * Извлекает все уникальные moduleId из дерева компонентов рекурсивно
     */
    private extractModuleIds;
    /**
     * Предзагружает все модули, необходимые для раскладки
     * @param layout - раскладка страницы с бэкенда
     * @returns Promise, который резолвится когда все модули загружены
     */
    preloadModulesFromLayout(layout: ComponentDefinition): Promise<ModuleDefinition[]>;
    /**
     * Предзагружает модули из раскладки и возвращает Observable с раскладкой
     * Используется для интеграции с Bootstrap.render()
     * @param layout$ - Observable с раскладкой страницы
     * @returns Observable с той же раскладкой, но после предзагрузки модулей
     */
    preloadModulesFromLayout$(layout$: Observable<ComponentDefinition>): Observable<ComponentDefinition>;
}
//# sourceMappingURL=router.d.ts.map