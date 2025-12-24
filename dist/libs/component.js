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
            try {
                const response = await fetch(templateUrl);
                if (!response.ok) {
                    throw new Error(`Failed to load template from ${templateUrl}: ${response.status} ${response.statusText}`);
                }
                const content = await response.text();
                if (!content || content.trim() === "") {
                    throw new Error(`Template file ${templateUrl} is empty`);
                }
                metadata.templateContent = content;
                return content;
            }
            catch (error) {
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
        if (templateUrl.startsWith("/")) {
            const needsRaw = templateUrl.endsWith(".html") && !templateUrl.includes("?");
            return needsRaw ? `${templateUrl}?raw` : templateUrl;
        }
        if (templateUrl.startsWith("./") || templateUrl.startsWith("../")) {
            if (!metadata?.moduleUrl) {
                throw new Error(`Cannot resolve template URL "${templateUrl}" for component "${selector}": ` +
                    `moduleUrl is not set. Make sure the component is registered in a module ` +
                    `or moduleUrl is set in component metadata.`);
            }
            const needsRaw = templateUrl.endsWith(".html") && !templateUrl.includes("?");
            const withRaw = needsRaw ? `${templateUrl}?raw` : templateUrl;
            return new URL(withRaw, metadata.moduleUrl + "/").href;
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