import { ModuleDefinition } from "./module-loader";
export interface RouterOptions {
    /**
     * Функция для преобразования moduleId в путь к файлу модуля
     */
    modulePathResolver: (moduleId: string) => string;
    /**
     * Базовый путь для роутинга (например, "/module" или "#/module")
     * По умолчанию используется hash-based роутинг: "#/"
     */
    basePath?: string;
    /**
     * Использовать ли hash-based роутинг (true) или pathname-based (false)
     * По умолчанию: true
     */
    useHash?: boolean;
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
    private basePath;
    private useHash;
    private onModuleLoaded?;
    private onModuleError?;
    private currentModuleId;
    constructor(options: RouterOptions);
    /**
     * Запускает роутер и начинает слушать изменения URL
     */
    start(): void;
    /**
     * Останавливает роутер
     */
    stop(): void;
    /**
     * Навигация к модулю программно
     */
    navigate(moduleId: string): void;
    /**
     * Получает текущий moduleId из URL
     */
    getCurrentModuleId(): string | null;
    /**
     * Обрабатывает текущий маршрут
     */
    private handleRoute;
    /**
     * Извлекает moduleId из текущего URL
     */
    private extractModuleIdFromUrl;
    /**
     * Загружает модуль по его ID
     */
    private loadModule;
    /**
     * Строит путь для навигации
     */
    private buildPath;
}
//# sourceMappingURL=router.d.ts.map