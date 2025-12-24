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
  customInjectionToken?: string | Constructor,
  customDIPool: DIPool = globalDIPool
) {
  return (constructor: Constructor) => {
    const injectionToken = customInjectionToken ?? constructor;
    customDIPool.register(injectionToken, () => new constructor());
  };
}

export function inject(
  customInjectionToken?: string | Constructor,
  customDIPool: DIPool = globalDIPool
) {
  return (target: any, propertyKey: string) => {
    let injectionToken: string | Constructor | undefined = customInjectionToken;

    // Если токен не указан явно, пытаемся получить его из TypeScript metadata
    if (!injectionToken) {
      const metadataType = Reflect.getMetadata(
        "design:type",
        target,
        propertyKey
      ) as Constructor | undefined;

      if (metadataType && typeof metadataType === "function") {
        injectionToken = metadataType;
      } else {
        const propertyDescriptor = Object.getOwnPropertyDescriptor(
          target,
          propertyKey
        );
        if (propertyDescriptor && propertyDescriptor.value) {
        }
      }
    }

    if (!injectionToken) {
      throw new Error(
        `Injection token for ${propertyKey} not found. ` +
          `Please specify it explicitly: @inject(LoggerService) or @inject("LoggerService"). ` +
          `Make sure 'emitDecoratorMetadata' is enabled in tsconfig.json.`
      );
    }

    Object.defineProperty(target, propertyKey, {
      get: () => customDIPool.get(injectionToken!),
      set: () => {
        throw new Error(`Property ${propertyKey} is read-only`);
      },
      enumerable: true,
      configurable: false,
    });
  };
}
