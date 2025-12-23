import { Observable, throwError } from "rxjs";
import { catchError, switchMap, map } from "rxjs/operators";
import {
  ComponentDefinition,
  composer,
  ComposerOptions,
  SDUIComposer,
} from "./composer";
import { inject } from "./di";
import { HttpService } from "./http";
import { createDefaultModuleResolver } from "../utils/module-resolvers";

export interface BootstrapOptions {
  composerOptions?: ComposerOptions;
  autoDetectEnvironment?: boolean;
}

export class Bootstrap {
  private apiUrl: string;
  private containerId: string;
  private composer: SDUIComposer;

  @inject()
  private httpService!: HttpService;

  constructor(apiUrl: string, containerId: string, options?: BootstrapOptions) {
    this.apiUrl = apiUrl;
    this.containerId = containerId;

    if (options?.composerOptions) {
      this.composer = new SDUIComposer(options.composerOptions);
    } else if (options?.autoDetectEnvironment !== false) {
      const autoOptions = this.detectEnvironment();
      if (autoOptions) {
        this.composer = new SDUIComposer(autoOptions);
      } else {
        this.composer = composer;
      }
    } else {
      this.composer = composer;
    }
  }

  /**
   * Рендерит компонент и возвращает Observable для обработки результата и ошибок
   * @returns Observable<HTMLElement> - поток с готовым элементом
   */
  public render(): Observable<HTMLElement> {
    const container = document.getElementById(this.containerId);

    if (!container) {
      return throwError(
        () => new Error(`Container with id ${this.containerId} not found`)
      );
    }

    return this.httpService
      .get<{ component: ComponentDefinition }>(`${this.apiUrl}`)
      .pipe(
        catchError((error: Error) => {
          return throwError(
            () => new Error(`Failed to fetch layout: ${error.message}`)
          );
        }),
        map((response) => {
          if (!response || !response.component) {
            throw new Error(
              `Invalid layout response: missing 'component' field. Received: ${JSON.stringify(
                response
              )}`
            );
          }
          return response.component;
        }),
        switchMap((layout) => {
          if (!layout || !layout.type) {
            return throwError(
              () =>
                new Error(
                  `Invalid layout data: missing 'type' field. Received: ${JSON.stringify(
                    layout
                  )}`
                )
            );
          }
          return this.composer.compose(layout);
        }),
        map((element) => {
          container.appendChild(element);
          return element;
        }),
        catchError((error: Error) => {
          return throwError(() => error);
        })
      );
  }

  /**
   * Рендерит компонент с автоматической подпиской (старый способ для обратной совместимости)
   * @deprecated Используйте render() и подписывайтесь вручную для лучшего контроля
   */
  public renderSync(): void {
    this.render().subscribe({
      next: () => {},
      error: (error) => {
        console.error("Failed to render layout:", error);
      },
    });
  }

  /**
   * Автоматически определяет окружение и возвращает соответствующие опции composer
   */
  private detectEnvironment(): ComposerOptions | null {
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const hasVite = new Function(
        'try { return typeof import !== "undefined" && typeof import.meta !== "undefined" && import.meta.env !== undefined; } catch { return false; }'
      )();
      if (hasVite) {
        return {
          modulePathResolver: createDefaultModuleResolver({
            basePath: "/src/modules",
            extension: ".ts",
          }),
        };
      }
    } catch {}

    if (typeof window !== "undefined" && (window as any).__webpack_require__) {
      return {
        modulePathResolver: createDefaultModuleResolver({
          basePath: "./modules",
          extension: ".ts",
        }),
      };
    }

    return null;
  }
}
