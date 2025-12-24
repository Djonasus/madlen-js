import "reflect-metadata";

export type Constructor<T = any> = new (...args: any[]) => T;

interface InjectableOptions {
  inject?: Constructor;
  pool?: DIPool;
}

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

export function provide(options: InjectableOptions = {}) {
  return (constructor: Constructor) => {
    if (!options.pool) {
      options.pool = globalDIPool;
    }
    if (!options.inject) {
      options.inject = constructor;
    }
    const injectionToken = options.inject;
    options.pool.register(injectionToken, () => new constructor());
  };
}

export function inject(options: InjectableOptions = {}) {
  return (target: any, propertyKey: string) => {
    if (!options.pool) {
      options.pool = globalDIPool;
    }

    const injectionToken =
      options.inject ??
      (Reflect.getMetadata("design:type", target, propertyKey) as Constructor);

    if (!injectionToken) {
      throw new Error(`Injection token for ${propertyKey} not found`);
    }

    Object.defineProperty(target, propertyKey, {
      get: () => options.pool!.get(injectionToken),
      set: () => {
        throw new Error(`Property ${propertyKey} is read-only`);
      },
      enumerable: true,
      configurable: false,
    });
  };
}
