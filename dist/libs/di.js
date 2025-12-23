import "reflect-metadata";
export class DIPool {
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
const globalDIPool = new DIPool();
export function provide(customInjectionToken, customDIPool = globalDIPool) {
    return (constructor) => {
        const injectionToken = customInjectionToken ?? constructor;
        customDIPool.register(injectionToken, () => new constructor());
    };
}
export function inject(customInjectionToken, customDIPool = globalDIPool) {
    return (target, propertyKey) => {
        const injectionToken = customInjectionToken ??
            Reflect.getMetadata("design:type", target, propertyKey);
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