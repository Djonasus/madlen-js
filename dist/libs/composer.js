"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.composer = exports.SDUIComposer = void 0;
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
        return __awaiter(this, void 0, void 0, function* () {
            let module;
            if (json.moduleId) {
                const modulePath = this.modulePathResolver(json.moduleId);
                module = yield this.moduleLoader.loadModule(json.moduleId, modulePath);
            }
            const componentPool = module
                ? module.componentPool
                : this.globalComponentPool;
            const ComponentClass = componentPool.get(json.type);
            if (!ComponentClass) {
                const poolName = module ? `module ${json.moduleId}` : "global";
                throw new Error(`Component ${json.type} not found in ${poolName} component pool`);
            }
            const componentMetadata = componentPool.getMetadata(json.type);
            const componentVersion = json.version || (componentMetadata === null || componentMetadata === void 0 ? void 0 : componentMetadata.version);
            const template = yield componentPool.loadTemplate(json.type);
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
            if (json.children && json.children.length > 0) {
                for (const child of json.children) {
                    const childElement = yield this.compose(child);
                    element.appendChild(childElement);
                }
            }
            return element;
        });
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
        return __awaiter(this, void 0, void 0, function* () {
            const root = container || document.createElement("div");
            for (const definition of definitions) {
                const element = yield this.compose(definition);
                root.appendChild(element);
            }
            return root;
        });
    }
}
exports.SDUIComposer = SDUIComposer;
exports.composer = new SDUIComposer();
//# sourceMappingURL=composer.js.map