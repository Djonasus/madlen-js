import "reflect-metadata";

type Constructor<T = any> = new (...args: any[]) => T;

interface Provider<T = any> {
  injectionToken: Constructor<T> | string;
  useClass: () => T;
}

export class DIPool {
  private providers = new Map<Constructor | string, Provider>();
  private instances = new Map<Constructor | string, any>();

  public register<T>(
    injectionToken: Constructor<T> | string,
    useClass: () => T
  ): void {
    this.providers.set(injectionToken, { injectionToken, useClass });
  }

  public get<T>(injectionToken: Constructor<T> | string): T {
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

export function provide(
  customInjectionToken?: string,
  customDIPool: DIPool = globalDIPool
) {
  return (constructor: Constructor) => {
    const injectionToken = customInjectionToken ?? constructor;
    customDIPool.register(injectionToken, () => new constructor());
  };
}

export function inject(
  customInjectionToken?: string,
  customDIPool: DIPool = globalDIPool
) {
  return (target: any, propertyKey: string) => {
    const injectionToken =
      customInjectionToken ??
      (Reflect.getMetadata("design:type", target, propertyKey) as Constructor);

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
