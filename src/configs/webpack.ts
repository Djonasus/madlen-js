import { ComposerOptions } from "../libs/composer";
import { createWebpackModuleResolver } from "../utils/module-resolvers";

/**
 * Возвращает готовые опции composer для Webpack
 */
export function getWebpackComposerOptions(): ComposerOptions {
  return {
    modulePathResolver: createWebpackModuleResolver({
      basePath: "./modules",
      extension: ".ts",
    }),
  };
}

/**
 * Возвращает готовые опции composer для Webpack с кастомной конфигурацией
 */
export function getWebpackComposerOptionsCustom(
  basePath?: string,
  extension?: string
): ComposerOptions {
  return {
    modulePathResolver: createWebpackModuleResolver({
      basePath,
      extension,
    }),
  };
}
