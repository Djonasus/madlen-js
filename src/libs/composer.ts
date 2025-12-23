import { Observable, from, forkJoin, of, throwError } from "rxjs";
import { switchMap, map, catchError } from "rxjs/operators";
import { ComponentPool, globalComponentPool } from "./component";
import { ModuleLoader, ModuleDefinition, moduleLoader } from "./module-loader";

export interface ComponentDefinition {
  type: string;
  moduleId?: string;
  version?: string;
  props?: Record<string, any>;
  children?: ComponentDefinition[];
  styles?: Record<string, any>;
}

export interface ComposerOptions {
  moduleLoader?: ModuleLoader;
  globalComponentPool?: ComponentPool;
  modulePathResolver?: (moduleId: string) => string;
}

export class SDUIComposer {
  private moduleLoader: ModuleLoader;
  private globalComponentPool: ComponentPool;
  private modulePathResolver: (moduleId: string) => string;

  constructor(options: ComposerOptions = {}) {
    this.moduleLoader = options.moduleLoader || moduleLoader;
    this.globalComponentPool =
      options.globalComponentPool || globalComponentPool;
    this.modulePathResolver =
      options.modulePathResolver ||
      ((moduleId: string) => `/modules/${moduleId}/index.js`);
  }

  compose(json: ComponentDefinition): Observable<HTMLElement> {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "composer.ts:35",
        message: "compose entry",
        data: {
          json: json,
          type: json?.type,
          typeIsUndefined: json?.type === undefined,
          typeIsNull: json?.type === null,
          typeIsEmpty: json?.type === "",
          moduleId: json?.moduleId,
          hasChildren: !!json?.children,
          childrenCount: json?.children?.length || 0,
          jsonKeys: json ? Object.keys(json) : [],
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        runId: "run1",
        hypothesisId: "A",
      }),
    }).catch(() => {});
    // #endregion

    if (!json || !json.type) {
      return throwError(
        () =>
          new Error(
            `Invalid ComponentDefinition: 'type' is required. Received: ${JSON.stringify(
              json
            )}`
          )
      );
    }
    const module$: Observable<ModuleDefinition | undefined> = json.moduleId
      ? from(
          this.moduleLoader.loadModule(
            json.moduleId,
            this.modulePathResolver(json.moduleId)
          )
        )
      : of(undefined);

    return module$.pipe(
      switchMap((module: ModuleDefinition | undefined) => {
        // #region agent log
        fetch(
          "http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "composer.ts:46",
              message: "after module load",
              data: {
                hasModule: !!module,
                moduleId: json.moduleId,
                componentType: json.type,
              },
              timestamp: Date.now(),
              sessionId: "debug-session",
              runId: "run1",
              hypothesisId: "D",
            }),
          }
        ).catch(() => {});
        // #endregion
        const componentPool = module
          ? module.componentPool
          : this.globalComponentPool;

        const ComponentClass = componentPool.get(json.type);
        if (!ComponentClass) {
          const poolName = module ? `module ${json.moduleId}` : "global";
          // #region agent log
          fetch(
            "http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "composer.ts:52",
                message: "component not found error",
                data: { type: json.type, poolName, moduleId: json.moduleId },
                timestamp: Date.now(),
                sessionId: "debug-session",
                runId: "run1",
                hypothesisId: "A",
              }),
            }
          ).catch(() => {});
          // #endregion
          return throwError(
            () =>
              new Error(
                `Component ${json.type} not found in ${poolName} component pool`
              )
          );
        }

        const componentMetadata = componentPool.getMetadata(json.type);
        const componentVersion = json.version || componentMetadata?.version;

        return from(componentPool.loadTemplate(json.type)).pipe(
          map((template) => {
            // #region agent log
            fetch(
              "http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  location: "composer.ts:63",
                  message: "template loaded",
                  data: {
                    type: json.type,
                    templateLength: template.length,
                    hasChildren: !!json.children,
                    childrenCount: json.children?.length || 0,
                  },
                  timestamp: Date.now(),
                  sessionId: "debug-session",
                  runId: "run1",
                  hypothesisId: "C",
                }),
              }
            ).catch(() => {});
            // #endregion
            const element = this.createElementFromTemplate(template);

            if (componentVersion) {
              element.setAttribute("data-component-version", componentVersion);
              element.setAttribute("data-component-type", json.type);
              if (json.moduleId) {
                element.setAttribute("data-component-module", json.moduleId);
              }
            }

            if (json.styles) {
              this.applyStyles(element, json.styles, componentVersion);
            }

            if (json.props) {
              this.applyProps(element, json.props);
            }

            return { element, children: json.children };
          }),
          switchMap(({ element, children }) => {
            // #region agent log
            fetch(
              "http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  location: "composer.ts:84",
                  message: "processing children",
                  data: {
                    hasChildren: !!children,
                    childrenLength: children?.length || 0,
                    childrenIsArray: Array.isArray(children),
                  },
                  timestamp: Date.now(),
                  sessionId: "debug-session",
                  runId: "run1",
                  hypothesisId: "C",
                }),
              }
            ).catch(() => {});
            // #endregion
            if (children && children.length > 0) {
              const children$ = children.map((child) => this.compose(child));
              // #region agent log
              fetch(
                "http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    location: "composer.ts:86",
                    message: "forkJoin children",
                    data: { childrenCount: children$.length },
                    timestamp: Date.now(),
                    sessionId: "debug-session",
                    runId: "run1",
                    hypothesisId: "C",
                  }),
                }
              ).catch(() => {});
              // #endregion
              return forkJoin(children$).pipe(
                map((childElements) => {
                  // #region agent log
                  fetch(
                    "http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        location: "composer.ts:88",
                        message: "children composed",
                        data: { childElementsCount: childElements.length },
                        timestamp: Date.now(),
                        sessionId: "debug-session",
                        runId: "run1",
                        hypothesisId: "D",
                      }),
                    }
                  ).catch(() => {});
                  // #endregion
                  childElements.forEach((childElement) => {
                    element.appendChild(childElement);
                  });
                  return element;
                })
              );
            }
            return of(element);
          })
        );
      }),
      catchError((error: any) => {
        // #region agent log
        fetch(
          "http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: "composer.ts:100",
              message: "catchError triggered",
              data: {
                errorType: typeof error,
                errorMessage: error?.message,
                errorName: error?.name,
                isError: error instanceof Error,
                componentType: json.type,
              },
              timestamp: Date.now(),
              sessionId: "debug-session",
              runId: "run1",
              hypothesisId: "A",
            }),
          }
        ).catch(() => {});
        // #endregion
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return throwError(
          () => new Error(`Failed to compose component: ${errorMessage}`)
        );
      })
    );
  }

  private createElementFromTemplate(template: string): HTMLElement {
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = template.trim();

    if (tempContainer.children.length === 1) {
      return tempContainer.firstElementChild as HTMLElement;
    }

    if (tempContainer.children.length > 1) {
      const wrapper = document.createElement("div");
      while (tempContainer.firstChild) {
        wrapper.appendChild(tempContainer.firstChild);
      }
      return wrapper;
    }

    return document.createElement("div");
  }

  private applyStyles(
    element: HTMLElement,
    styles: Record<string, any>,
    version?: string
  ): void {
    Object.entries(styles).forEach(([key, value]) => {
      const cssProperty = key.replace(/([A-Z])/g, "-$1").toLowerCase();

      (element.style as any)[cssProperty] = value;
    });
  }

  private applyProps(element: HTMLElement, props: Record<string, any>): void {
    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith("data-")) {
        element.setAttribute(key, String(value));
      } else if (key.startsWith("aria-")) {
        element.setAttribute(key, String(value));
      } else if (this.isStandardAttribute(key)) {
        element.setAttribute(key, String(value));
      } else {
        element.setAttribute(`data-${key}`, String(value));
      }
    });
  }

  private isStandardAttribute(key: string): boolean {
    const standardAttributes = [
      "id",
      "class",
      "title",
      "alt",
      "src",
      "href",
      "target",
      "type",
      "value",
      "name",
      "placeholder",
      "disabled",
      "readonly",
      "checked",
      "selected",
      "role",
    ];
    return standardAttributes.includes(key.toLowerCase());
  }

  composeMultiple(
    definitions: ComponentDefinition[],
    container?: HTMLElement
  ): Observable<HTMLElement> {
    const root = container || document.createElement("div");

    if (definitions.length === 0) {
      return of(root);
    }

    const elements$ = definitions.map((definition) => this.compose(definition));
    return forkJoin(elements$).pipe(
      map((elements) => {
        elements.forEach((element) => {
          root.appendChild(element);
        });
        return root;
      })
    );
  }
}

export const composer = new SDUIComposer();
