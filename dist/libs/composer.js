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
            if (json.moduleId && module && componentMetadata) {
                const modulePath = this.modulePathResolver(json.moduleId).replace(/\\/g, "/");
                let moduleDir = modulePath.substring(0, modulePath.lastIndexOf("/"));
                if (moduleDir.endsWith("/index")) {
                    moduleDir = moduleDir.substring(0, moduleDir.length - "/index".length);
                }
                const moduleBaseUrl = new URL(moduleDir + "/", window.location.origin)
                    .href;
                componentMetadata.moduleUrl = moduleBaseUrl;
            }
            return from(componentPool.loadTemplate(json.type)).pipe(map((template) => {
                if (!template || template.trim() === "") {
                    throw new Error(`Template is empty for component ${json.type}. Check templateUrl or template property.`);
                }
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
                const componentInstance = this.createComponentInstance(ComponentClass, json.props, element);
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
        if (!template || template.trim() === "") {
            throw new Error("Template is empty");
        }
        let trimmedTemplate = template.trim();
        trimmedTemplate = trimmedTemplate.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
        trimmedTemplate = trimmedTemplate.replace(/<(link|meta|style)[^>]*\/?>/gi, "");
        trimmedTemplate = trimmedTemplate.trim();
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = trimmedTemplate;
        if (tempContainer.children.length === 1) {
            return tempContainer.firstElementChild;
        }
        if (tempContainer.children.length > 1) {
            const mainElement = Array.from(tempContainer.children).find((el) => el.tagName !== "SCRIPT" &&
                el.tagName !== "STYLE" &&
                el.tagName !== "LINK" &&
                el.tagName !== "META");
            if (mainElement) {
                return mainElement;
            }
            const wrapper = document.createElement("div");
            while (tempContainer.firstChild) {
                wrapper.appendChild(tempContainer.firstChild);
            }
            return wrapper;
        }
        throw new Error(`Template does not contain any HTML elements. Template content: "${template}"`);
    }
    applyStyles(element, styles, version) {
        const computedStyles = window.getComputedStyle(element);
        Object.entries(styles).forEach(([key, value]) => {
            const cssProperty = key.replace(/([A-Z])/g, "-$1").toLowerCase();
            const stringValue = String(value);
            const cssValue = computedStyles.getPropertyValue(cssProperty);
            const isSetInCSS = cssValue && cssValue.trim() !== "";
            if (!isSetInCSS || cssValue !== stringValue) {
                element.style[cssProperty] = stringValue;
            }
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