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
        var _a;
        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                location: "composer.ts:35",
                message: "compose entry",
                data: {
                    json: json,
                    type: json === null || json === void 0 ? void 0 : json.type,
                    typeIsUndefined: (json === null || json === void 0 ? void 0 : json.type) === undefined,
                    typeIsNull: (json === null || json === void 0 ? void 0 : json.type) === null,
                    typeIsEmpty: (json === null || json === void 0 ? void 0 : json.type) === "",
                    moduleId: json === null || json === void 0 ? void 0 : json.moduleId,
                    hasChildren: !!(json === null || json === void 0 ? void 0 : json.children),
                    childrenCount: ((_a = json === null || json === void 0 ? void 0 : json.children) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    jsonKeys: json ? Object.keys(json) : [],
                },
                timestamp: Date.now(),
                sessionId: "debug-session",
                runId: "run1",
                hypothesisId: "A",
            }),
        }).catch(() => { });
        // #endregion
        if (!json || !json.type) {
            return (0, rxjs_1.throwError)(() => new Error(`Invalid ComponentDefinition: 'type' is required. Received: ${JSON.stringify(json)}`));
        }
        const module$ = json.moduleId
            ? (0, rxjs_1.from)(this.moduleLoader.loadModule(json.moduleId, this.modulePathResolver(json.moduleId)))
            : (0, rxjs_1.of)(undefined);
        return module$.pipe((0, operators_1.switchMap)((module) => {
            // #region agent log
            fetch("http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032", {
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
            }).catch(() => { });
            // #endregion
            const componentPool = module
                ? module.componentPool
                : this.globalComponentPool;
            const ComponentClass = componentPool.get(json.type);
            if (!ComponentClass) {
                const poolName = module ? `module ${json.moduleId}` : "global";
                // #region agent log
                fetch("http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032", {
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
                }).catch(() => { });
                // #endregion
                return (0, rxjs_1.throwError)(() => new Error(`Component ${json.type} not found in ${poolName} component pool`));
            }
            const componentMetadata = componentPool.getMetadata(json.type);
            const componentVersion = json.version || (componentMetadata === null || componentMetadata === void 0 ? void 0 : componentMetadata.version);
            return (0, rxjs_1.from)(componentPool.loadTemplate(json.type)).pipe((0, operators_1.map)((template) => {
                var _a;
                // #region agent log
                fetch("http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        location: "composer.ts:63",
                        message: "template loaded",
                        data: {
                            type: json.type,
                            templateLength: template.length,
                            hasChildren: !!json.children,
                            childrenCount: ((_a = json.children) === null || _a === void 0 ? void 0 : _a.length) || 0,
                        },
                        timestamp: Date.now(),
                        sessionId: "debug-session",
                        runId: "run1",
                        hypothesisId: "C",
                    }),
                }).catch(() => { });
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
            }), (0, operators_1.switchMap)(({ element, children }) => {
                // #region agent log
                fetch("http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        location: "composer.ts:84",
                        message: "processing children",
                        data: {
                            hasChildren: !!children,
                            childrenLength: (children === null || children === void 0 ? void 0 : children.length) || 0,
                            childrenIsArray: Array.isArray(children),
                        },
                        timestamp: Date.now(),
                        sessionId: "debug-session",
                        runId: "run1",
                        hypothesisId: "C",
                    }),
                }).catch(() => { });
                // #endregion
                if (children && children.length > 0) {
                    const children$ = children.map((child) => this.compose(child));
                    // #region agent log
                    fetch("http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032", {
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
                    }).catch(() => { });
                    // #endregion
                    return (0, rxjs_1.forkJoin)(children$).pipe((0, operators_1.map)((childElements) => {
                        // #region agent log
                        fetch("http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032", {
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
                        }).catch(() => { });
                        // #endregion
                        childElements.forEach((childElement) => {
                            element.appendChild(childElement);
                        });
                        return element;
                    }));
                }
                return (0, rxjs_1.of)(element);
            }));
        }), (0, operators_1.catchError)((error) => {
            // #region agent log
            fetch("http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    location: "composer.ts:100",
                    message: "catchError triggered",
                    data: {
                        errorType: typeof error,
                        errorMessage: error === null || error === void 0 ? void 0 : error.message,
                        errorName: error === null || error === void 0 ? void 0 : error.name,
                        isError: error instanceof Error,
                        componentType: json.type,
                    },
                    timestamp: Date.now(),
                    sessionId: "debug-session",
                    runId: "run1",
                    hypothesisId: "A",
                }),
            }).catch(() => { });
            // #endregion
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