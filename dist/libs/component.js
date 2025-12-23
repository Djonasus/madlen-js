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
            const response = await fetch(templateUrl);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${templateUrl}`);
            }
            const content = await response.text();
            metadata.templateContent = content;
            return content;
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