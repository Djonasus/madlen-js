export class ComponentPool {
    constructor() {
        this.components = new Map();
        this.metadata = new Map();
    }
    register(selector, component, metadata) {
        this.components.set(selector, component);
        this.metadata.set(selector, metadata);
    }
    async loadTemplate(selector) {
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
            console.log(`[ComponentPool] Loading template from: ${templateUrl}`);
            try {
                const response = await fetch(templateUrl);
                if (!response.ok) {
                    throw new Error(`Failed to load template from ${templateUrl}: ${response.status} ${response.statusText}`);
                }
                const content = await response.text();
                console.log(`[ComponentPool] Template content loaded:`, content);
                if (!content || content.trim() === "") {
                    throw new Error(`Template file ${templateUrl} is empty`);
                }
                metadata.templateContent = content;
                return content;
            }
            catch (error) {
                console.error(`[ComponentPool] Error loading template:`, error);
                throw new Error(`Failed to load template from ${templateUrl}: ${error.message}`);
            }
        }
        throw new Error(`No template found for component ${selector}`);
    }
    resolveTemplateUrl(selector, templateUrl) {
        if (templateUrl.startsWith("http://") ||
            templateUrl.startsWith("https://")) {
            return templateUrl;
        }
        const metadata = this.metadata.get(selector);
        if (metadata?.moduleUrl) {
            if (templateUrl.startsWith("/")) {
                return templateUrl;
            }
            return new URL(templateUrl, metadata.moduleUrl + "/").href;
        }
        if (templateUrl.startsWith("./") || templateUrl.startsWith("../")) {
            try {
                const baseUrl = window.location.origin + "/src/modules/";
                return new URL(templateUrl, baseUrl).href;
            }
            catch {
                return templateUrl;
            }
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
export const globalComponentPool = new ComponentPool();
export function component(options) {
    return (target) => {
        const metadata = {
            ...options,
            moduleUrl: undefined,
        };
        Reflect.defineMetadata("component", metadata, target);
        const targetPool = options.module
            ? options.module.componentPool
            : globalComponentPool;
        targetPool.register(options.selector, target, metadata);
    };
}
//# sourceMappingURL=component.js.map