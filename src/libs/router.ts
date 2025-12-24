import { ModuleDefinition, moduleLoader } from "./module-loader";
import { ComponentDefinition } from "./composer";
import { Observable, from, throwError } from "rxjs";
import { switchMap, catchError } from "rxjs/operators";

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

export class ModuleRouter {
  private modulePathResolver: (moduleId: string) => string;
  private routingMap?: RoutingMap;
  private onModuleLoaded?: (module: ModuleDefinition, moduleId: string) => void;
  private onModuleError?: (error: Error, moduleId: string) => void;

  constructor(options: RouterOptions) {
    this.modulePathResolver = options.modulePathResolver;
    this.routingMap = options.routingMap;
    this.onModuleLoaded = options.onModuleLoaded;
    this.onModuleError = options.onModuleError;
  }

  /**
   * Получает путь к модулю из карты маршрутизации или использует resolver
   */
  private getModulePath(moduleId: string): string {
    if (this.routingMap) {
      if (this.routingMap instanceof Map) {
        const path = this.routingMap.get(moduleId);
        if (path) {
          return path;
        }
      } else if (typeof this.routingMap === "function") {
        return this.routingMap(moduleId);
      }
    }
    return this.modulePathResolver(moduleId);
  }

  /**
   * Извлекает все уникальные moduleId из дерева компонентов рекурсивно
   */
  private extractModuleIds(layout: ComponentDefinition): Set<string> {
    const moduleIds = new Set<string>();

    const traverse = (component: ComponentDefinition) => {
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
  async preloadModulesFromLayout(
    layout: ComponentDefinition
  ): Promise<ModuleDefinition[]> {
    const moduleIds = this.extractModuleIds(layout);
    const loadPromises: Promise<ModuleDefinition>[] = [];

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
  preloadModulesFromLayout$(
    layout$: Observable<ComponentDefinition>
  ): Observable<ComponentDefinition> {
    return layout$.pipe(
      switchMap((layout: ComponentDefinition) => {
        return from(this.preloadModulesFromLayout(layout)).pipe(
          catchError((error: Error) => {
            console.warn(
              "Не удалось предзагрузить некоторые модули, будет попытка загрузки при рендеринге:",
              error
            );
            return from([]);
          }),
          switchMap(() => {
            return from([layout]);
          })
        );
      })
    );
  }
}
