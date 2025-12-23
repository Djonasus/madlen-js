export interface ModuleResolverConfig {
  basePath?: string; // например "/src/modules" или "/modules"
  extension?: string; // ".ts", ".js", ".mjs"
  useAlias?: boolean; // использовать ли алиас "/modules"
}

/**
 * Создает resolver для Vite
 * По умолчанию использует путь /src/modules с расширением .ts
 */
export function createViteModuleResolver(
  config?: ModuleResolverConfig
): (moduleId: string) => string {
  const basePath = config?.basePath || "/src/modules";
  const extension = config?.extension || ".ts";
  return (moduleId: string) => `${basePath}/${moduleId}/index${extension}`;
}

/**
 * Создает resolver для Webpack
 * По умолчанию использует относительный путь ./modules
 */
export function createWebpackModuleResolver(
  config?: ModuleResolverConfig
): (moduleId: string) => string {
  const basePath = config?.basePath || "./modules";
  const extension = config?.extension || ".ts";
  return (moduleId: string) => `${basePath}/${moduleId}/index${extension}`;
}

/**
 * Создает resolver для Rollup
 */
export function createRollupModuleResolver(
  config?: ModuleResolverConfig
): (moduleId: string) => string {
  const basePath = config?.basePath || "/modules";
  const extension = config?.extension || ".js";
  return (moduleId: string) => `${basePath}/${moduleId}/index${extension}`;
}

/**
 * Создает resolver по умолчанию
 * Пытается автоматически определить окружение
 */
export function createDefaultModuleResolver(
  config?: ModuleResolverConfig
): (moduleId: string) => string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const hasVite = new Function(
      'try { return typeof import !== "undefined" && typeof import.meta !== "undefined" && import.meta.env !== undefined; } catch { return false; }'
    )();
    if (hasVite) {
      return createViteModuleResolver(config);
    }
  } catch {
    // Игнорируем ошибки при проверке
  }

  if (typeof window !== "undefined" && (window as any).__webpack_require__) {
    return createWebpackModuleResolver(config);
  }

  const basePath = config?.basePath || "/modules";
  const extension = config?.extension || ".js";
  return (moduleId: string) => `${basePath}/${moduleId}/index${extension}`;
}
