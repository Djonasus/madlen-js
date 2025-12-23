import { from, forkJoin, of, throwError } from "rxjs";
import { switchMap, map, catchError } from "rxjs/operators";
import { globalComponentPool, } from "./component";
import { moduleLoader } from "./module-loader";
export class SDUIComposer {
    constructor(options = {}) {
        this.moduleLoader = options.moduleLoader || moduleLoader;
        this.globalComponentPool =
            options.globalComponentPool || globalComponentPool;
        this.modulePathResolver =
            options.modulePathResolver ||
                ((moduleId) => `/modules/${moduleId}/index.js`);
    }
    compose(json) {
        if (!json || !json.type) {
            return throwError(() => new Error(`Invalid ComponentDefinition: 'type' is required. Received: ${JSON.stringify(json)}`));
        }
        const module$ = json.moduleId
            ? from(this.moduleLoader.loadModule(json.moduleId, this.modulePathResolver(json.moduleId)))
            : of(undefined);
        return module$.pipe(switchMap((module) => {
            const componentPool = module
                ? module.componentPool
                : this.globalComponentPool;
            const ComponentClass = componentPool.get(json.type);
            if (!ComponentClass) {
                const poolName = module ? `module ${json.moduleId}` : "global";
                return throwError(() => new Error(`Component ${json.type} not found in ${poolName} component pool`));
            }
            const componentMetadata = componentPool.getMetadata(json.type);
            const componentVersion = json.version || componentMetadata?.version;
            return from(componentPool.loadTemplate(json.type)).pipe(map((template) => {
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
                const componentInstance = this.createComponentInstance(ComponentClass, json.props, element);
                // Сохраняем экземпляр компонента в элементе для доступа
                element.__componentInstance = componentInstance;
                return { element, children: json.children };
            }), switchMap(({ element, children }) => {
                if (children && children.length > 0) {
                    const children$ = children.map((child) => this.compose(child));
                    return forkJoin(children$).pipe(map((childElements) => {
                        childElements.forEach((childElement) => {
                            element.appendChild(childElement);
                        });
                        return element;
                    }));
                }
                return of(element);
            }));
        }), catchError((error) => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return throwError(() => new Error(`Failed to compose component: ${errorMessage}`));
        }));
    }
    createElementFromTemplate(template) {
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = template.trim();
        if (tempContainer.children.length === 1) {
            return tempContainer.firstElementChild;
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
    applyStyles(element, styles, version) {
        Object.entries(styles).forEach(([key, value]) => {
            const cssProperty = key.replace(/([A-Z])/g, "-$1").toLowerCase();
            element.style[cssProperty] = value;
        });
    }
    applyProps(element, props) {
        element.setAttribute("data-props", JSON.stringify(props));
        Object.entries(props).forEach(([key, value]) => {
            if (key.startsWith("data-")) {
                element.setAttribute(key, String(value));
            }
            else if (key.startsWith("aria-")) {
                element.setAttribute(key, String(value));
            }
            else if (this.isStandardAttribute(key)) {
                element.setAttribute(key, String(value));
            }
            else {
                element.setAttribute(`data-${key}`, String(value));
            }
        });
        this.interpolateProps(element, props);
    }
    interpolateProps(element, props) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
        let node;
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
    isStandardAttribute(key) {
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
    createComponentInstance(ComponentClass, props, element) {
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
    composeMultiple(definitions, container) {
        const root = container || document.createElement("div");
        if (definitions.length === 0) {
            return of(root);
        }
        const elements$ = definitions.map((definition) => this.compose(definition));
        return forkJoin(elements$).pipe(map((elements) => {
            elements.forEach((element) => {
                root.appendChild(element);
            });
            return root;
        }));
    }
}
export const composer = new SDUIComposer();
//# sourceMappingURL=composer.js.map