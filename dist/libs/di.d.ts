import "reflect-metadata";
type Constructor<T = any> = new (...args: any[]) => T;
export declare class DIPool {
    private providers;
    private instances;
    register<T>(injectionToken: Constructor<T> | string, useClass: () => T): void;
    get<T>(injectionToken: Constructor<T> | string): T;
}
export declare function provide(customInjectionToken?: string, customDIPool?: DIPool): (constructor: Constructor) => void;
export declare function inject(customInjectionToken?: string, customDIPool?: DIPool): (target: any, propertyKey: string) => void;
export {};
//# sourceMappingURL=di.d.ts.map