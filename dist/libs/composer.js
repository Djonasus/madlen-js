"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composer = exports.SDUIComposer = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const component_1 = require("./component");
const module_loader_1 = require("./module-loader");
class SDUIComposer {
    constructor(options = {}) {
        this.moduleLoader = options.moduleLoader || module_loader_1.moduleLoader;
        this.globalComponentPool =
            options.globalComponentPool || component_1.globalComponentPool;
        this.modulePathResolver =
            options.modulePathResolver ||
                ((moduleId) => `/modules/${moduleId}/index.js`);
    }
    compose(json) {
        if (!json || !json.type) {
            return (0, rxjs_1.throwError)(() => new Error(`Invalid ComponentDefinition: 'type' is required. Received: ${JSON.stringify(json)}`));
        }
        const module$ = json.moduleId
            ? (0, rxjs_1.from)(this.moduleLoader.loadModule(json.moduleId, this.modulePathResolver(json.moduleId)))
            : (0, rxjs_1.of)(undefined);
        return module$.pipe((0, operators_1.switchMap)((module) => {
            const componentPool = module
                ? module.componentPool
                : this.globalComponentPool;
            const ComponentClass = componentPool.get(json.type);
            if (!ComponentClass) {
                const poolName = module ? `module ${json.moduleId}` : "global";
                return (0, rxjs_1.throwError)(() => new Error(`Component ${json.type} not found in ${poolName} component pool`));
            }
            const componentMetadata = componentPool.getMetadata(json.type);
            const componentVersion = json.version || (componentMetadata === null || componentMetadata === void 0 ? void 0 : componentMetadata.version);
            return (0, rxjs_1.from)(componentPool.loadTemplate(json.type)).pipe((0, operators_1.map)((template) => {
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
            }), (0, operators_1.switchMap)(({ element, children }) => {
                if (children && children.length > 0) {
                    const children$ = children.map((child) => this.compose(child));
                    return (0, rxjs_1.forkJoin)(children$).pipe((0, operators_1.map)((childElements) => {
                        childElements.forEach((childElement) => {
                            element.appendChild(childElement);
                        });
                        return element;
                    }));
                }
                return (0, rxjs_1.of)(element);
            }));
        }), (0, operators_1.catchError)((error) => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return (0, rxjs_1.throwError)(() => new Error(`Failed to compose component: ${errorMessage}`));
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
    composeMultiple(definitions, container) {
        const root = container || document.createElement("div");
        if (definitions.length === 0) {
            return (0, rxjs_1.of)(root);
        }
        const elements$ = definitions.map((definition) => this.compose(definition));
        return (0, rxjs_1.forkJoin)(elements$).pipe((0, operators_1.map)((elements) => {
            elements.forEach((element) => {
                root.appendChild(element);
            });
            return root;
        }));
    }
}
exports.SDUIComposer = SDUIComposer;
exports.composer = new SDUIComposer();
//# sourceMappingURL=composer.js.map