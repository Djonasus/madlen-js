import { ModuleDefinition, moduleLoader } from "./module-loader";

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

export class ModuleRouter {
  private modulePathResolver: (moduleId: string) => string;
  private basePath: string;
  private useHash: boolean;
  private onModuleLoaded?: (module: ModuleDefinition, moduleId: string) => void;
  private onModuleError?: (error: Error, moduleId: string) => void;
  private currentModuleId: string | null = null;

  constructor(options: RouterOptions) {
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
  start(): void {
    this.handleRoute();

    if (this.useHash) {
      window.addEventListener("hashchange", () => this.handleRoute());
    } else {
      window.addEventListener("popstate", () => this.handleRoute());
    }
  }

  /**
   * Останавливает роутер
   */
  stop(): void {
    if (this.useHash) {
      window.removeEventListener("hashchange", () => this.handleRoute());
    } else {
      window.removeEventListener("popstate", () => this.handleRoute());
    }
  }

  /**
   * Навигация к модулю программно
   */
  navigate(moduleId: string): void {
    const path = this.buildPath(moduleId);

    if (this.useHash) {
      window.location.hash = path;
    } else {
      window.history.pushState({ moduleId }, "", path);
      this.handleRoute();
    }
  }

  /**
   * Получает текущий moduleId из URL
   */
  getCurrentModuleId(): string | null {
    return this.currentModuleId;
  }

  /**
   * Обрабатывает текущий маршрут
   */
  private handleRoute(): void {
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
  private extractModuleIdFromUrl(): string | null {
    let path: string;

    if (this.useHash) {
      path = window.location.hash.slice(1);
    } else {
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
  private async loadModule(moduleId: string): Promise<void> {
    try {
      const modulePath = this.modulePathResolver(moduleId);
      console.log(`Загрузка модуля ${moduleId} из ${modulePath}`);

      const module = await moduleLoader.loadModule(moduleId, modulePath);

      console.log(`Модуль ${moduleId} успешно загружен`, module);

      if (this.onModuleLoaded) {
        this.onModuleLoaded(module, moduleId);
      }
    } catch (error) {
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
  private buildPath(moduleId: string): string {
    if (this.useHash) {
      return `#/${moduleId}`;
    } else {
      return `/${moduleId}`;
    }
  }
}
