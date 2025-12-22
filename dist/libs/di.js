"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIPool = void 0;
exports.provide = provide;
exports.inject = inject;
require("reflect-metadata");
class DIPool {
    constructor() {
        this.providers = new Map();
        this.instances = new Map();
    }
    register(injectionToken, useClass) {
        this.providers.set(injectionToken, { injectionToken, useClass });
    }
    get(injectionToken) {
        if (this.instances.has(injectionToken)) {
            return this.instances.get(injectionToken);
        }
        const provider = this.providers.get(injectionToken);
        if (!provider) {
            throw new Error(`Provider for ${injectionToken} not found`);
        }
        const instance = provider.useClass();
        this.instances.set(injectionToken, instance);
        return instance;
    }
}
exports.DIPool = DIPool;
const globalDIPool = new DIPool();
function provide(customInjectionToken, customDIPool = globalDIPool) {
    return (constructor) => {
        const injectionToken = customInjectionToken !== null && customInjectionToken !== void 0 ? customInjectionToken : constructor;
        customDIPool.register(injectionToken, () => new constructor());
    };
}
function inject(customInjectionToken, customDIPool = globalDIPool) {
    return (target, propertyKey) => {
        const injectionToken = customInjectionToken !== null && customInjectionToken !== void 0 ? customInjectionToken : Reflect.getMetadata("design:type", target, propertyKey);
        if (!injectionToken) {
            throw new Error(`Injection token for ${propertyKey} not found`);
        }
        Object.defineProperty(target, propertyKey, {
            get: () => customDIPool.get(injectionToken),
            set: () => {
                throw new Error(`Property ${propertyKey} is read-only`);
            },
            enumerable: true,
            configurable: false,
        });
    };
}
//# sourceMappingURL=di.js.map