import { moduleLoader } from "./module-loader";
export class ModuleRouter {
    constructor(options) {
        this.currentModuleId = null;
        this.modulePathResolver = options.modulePathResolver;
        this.basePath =
            options.basePath || (options.useHash !== false ? "#/" : "/");
        this.useHash = options.useHash !== false;
        this.onModuleLoaded = options.onModuleLoaded;
        this.onModuleError = options.onModuleError;
    }
    /**
     * Запускает роутер и начинает слушать изменения URL
     */
    start() {
        this.handleRoute();
        if (this.useHash) {
            window.addEventListener("hashchange", () => this.handleRoute());
        }
        else {
            window.addEventListener("popstate", () => this.handleRoute());
        }
    }
    /**
     * Останавливает роутер
     */
    stop() {
        if (this.useHash) {
            window.removeEventListener("hashchange", () => this.handleRoute());
        }
        else {
            window.removeEventListener("popstate", () => this.handleRoute());
        }
    }
    /**
     * Навигация к модулю программно
     */
    navigate(moduleId) {
        const path = this.buildPath(moduleId);
        if (this.useHash) {
            window.location.hash = path;
        }
        else {
            window.history.pushState({ moduleId }, "", path);
            this.handleRoute();
        }
    }
    /**
     * Получает текущий moduleId из URL
     */
    getCurrentModuleId() {
        return this.currentModuleId;
    }
    /**
     * Обрабатывает текущий маршрут
     */
    handleRoute() {
        const moduleId = this.extractModuleIdFromUrl();
        if (!moduleId) {
            return;
        }
        if (this.currentModuleId === moduleId) {
            return;
        }
        this.currentModuleId = moduleId;
        this.loadModule(moduleId);
    }
    /**
     * Извлекает moduleId из текущего URL
     */
    extractModuleIdFromUrl() {
        let path;
        if (this.useHash) {
            path = window.location.hash.slice(1);
        }
        else {
            path = window.location.pathname;
        }
        if (this.basePath && path.startsWith(this.basePath)) {
            path = path.slice(this.basePath.length);
        }
        path = path.replace(/^\/+|\/+$/g, "");
        const parts = path.split("/");
        const moduleId = parts[0] || null;
        return moduleId || null;
    }
    /**
     * Загружает модуль по его ID
     */
    async loadModule(moduleId) {
        try {
            const modulePath = this.modulePathResolver(moduleId);
            console.log(`Загрузка модуля ${moduleId} из ${modulePath}`);
            const module = await moduleLoader.loadModule(moduleId, modulePath);
            console.log(`Модуль ${moduleId} успешно загружен`, module);
            if (this.onModuleLoaded) {
                this.onModuleLoaded(module, moduleId);
            }
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            console.error(`Ошибка загрузки модуля ${moduleId}:`, err);
            if (this.onModuleError) {
                this.onModuleError(err, moduleId);
            }
        }
    }
    /**
     * Строит путь для навигации
     */
    buildPath(moduleId) {
        if (this.useHash) {
            return `#/${moduleId}`;
        }
        else {
            return `/${moduleId}`;
        }
    }
}
//# sourceMappingURL=router.js.map