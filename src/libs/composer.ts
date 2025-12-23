import { Observable, from, forkJoin, of, throwError } from "rxjs";
import { switchMap, map, catchError } from "rxjs/operators";
import {
  ComponentPool,
  globalComponentPool,
  ComponentInstance,
  ComponentProps,
} from "./component";
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
        const componentPool = module
          ? module.componentPool
          : this.globalComponentPool;

        const ComponentClass = componentPool.get(json.type);
        if (!ComponentClass) {
          const poolName = module ? `module ${json.moduleId}` : "global";
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

            // Создаем экземпляр компонента и инициализируем его
            const componentInstance = this.createComponentInstance(
              ComponentClass,
              json.props,
              element
            );

            // Сохраняем экземпляр компонента в элементе для доступа
            (element as any).__componentInstance = componentInstance;

            return { element, children: json.children };
          }),
          switchMap(({ element, children }) => {
            if (children && children.length > 0) {
              const children$ = children.map((child) => this.compose(child));
              return forkJoin(children$).pipe(
                map((childElements) => {
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
    element.setAttribute("data-props", JSON.stringify(props));

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

    this.interpolateProps(element, props);
  }

  private interpolateProps(
    element: HTMLElement,
    props: Record<string, any>
  ): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent) {
        let text = node.textContent;
        text = text.replace(/\{\{(\w+)\}\}/g, (match, propName) => {
          return props[propName] !== undefined
            ? String(props[propName])
            : match;
        });
        if (text !== node.textContent) {
          node.textContent = text;
        }
      }
    }

    Array.from(element.attributes).forEach((attr) => {
      if (attr.value.includes("{{")) {
        let value = attr.value;
        value = value.replace(/\{\{(\w+)\}\}/g, (match, propName) => {
          return props[propName] !== undefined
            ? String(props[propName])
            : match;
        });
        element.setAttribute(attr.name, value);
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

  private createComponentInstance(
    ComponentClass: any,
    props?: ComponentProps,
    element?: HTMLElement
  ): ComponentInstance {
    const instance = new ComponentClass();

    if (props) {
      instance.props = props;
    }
    if (element) {
      instance.element = element;
    }

    if (typeof instance.onInit === "function") {
      instance.onInit();
    }

    return instance;
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
