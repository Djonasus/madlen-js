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
exports.globalComponentPool = exports.ComponentPool = void 0;
exports.component = component;
class ComponentPool {
    constructor() {
        this.components = new Map();
        this.metadata = new Map();
    }
    register(selector, component, metadata) {
        this.components.set(selector, component);
        this.metadata.set(selector, metadata);
    }
    loadTemplate(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            const metadata = this.metadata.get(selector);
            if (!metadata) {
                throw new Error(`Component ${selector} not found`);
            }
            if (metadata.templateContent) {
                return metadata.templateContent;
            }
            if (metadata.template) {
                return metadata.template;
            }
            if (metadata.templateUrl) {
                const templateUrl = this.resolveTemplateUrl(selector, metadata.templateUrl);
                const response = yield fetch(templateUrl);
                if (!response.ok) {
                    throw new Error(`Failed to load template: ${templateUrl}`);
                }
                const content = yield response.text();
                metadata.templateContent = content;
                return content;
            }
            throw new Error(`No template found for component ${selector}`);
        });
    }
    resolveTemplateUrl(selector, templateUrl) {
        if (templateUrl.startsWith("http://") ||
            templateUrl.startsWith("https://")) {
            return templateUrl;
        }
        const metadata = this.metadata.get(selector);
        if (metadata === null || metadata === void 0 ? void 0 : metadata.moduleUrl) {
            const baseUrl = metadata.moduleUrl.substring(0, metadata.moduleUrl.lastIndexOf("/"));
            return new URL(templateUrl, baseUrl + "/").href;
        }
        return templateUrl;
    }
    get(selector) {
        return this.components.get(selector);
    }
    getMetadata(selector) {
        return this.metadata.get(selector);
    }
}
exports.ComponentPool = ComponentPool;
exports.globalComponentPool = new ComponentPool();
function component(options) {
    return (target) => {
        const metadata = Object.assign(Object.assign({}, options), { moduleUrl: undefined });
        Reflect.defineMetadata("component", metadata, target);
        const targetPool = options.module
            ? options.module.componentPool
            : exports.globalComponentPool;
        targetPool.register(options.selector, target, metadata);
    };
}
//# sourceMappingURL=component.js.map