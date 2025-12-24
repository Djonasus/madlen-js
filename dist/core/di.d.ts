import "reflect-metadata";
export type Constructor<T = any> = new (...args: any[]) => T;
interface InjectableOptions {
    inject?: Constructor;
    pool?: DIPool;
}
export declare class DIPool {
    private providers;
    private instances;
    register<T>(injectionToken: Constructor<T> | string, useClass: () => T): void;
    get<T>(injectionToken: Constructor<T> | string): T;
}
export declare function provide(options?: InjectableOptions): (constructor: Constructor) => void;
export declare function inject(options?: InjectableOptions): (target: any, propertyKey: string) => void;
export {};
//# sourceMappingURL=di.d.ts.map