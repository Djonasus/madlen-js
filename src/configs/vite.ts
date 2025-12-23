import { ComposerOptions } from "../libs/composer";
import { createViteModuleResolver } from "../utils/module-resolvers";

/**
 * Возвращает готовые опции composer для Vite
 */
export function getViteComposerOptions(): ComposerOptions {
  return {
    modulePathResolver: createViteModuleResolver({
      basePath: "/src/modules",
      extension: ".ts",
    }),
  };
}

/**
 * Возвращает готовые опции composer для Vite с кастомной конфигурацией
 */
export function getViteComposerOptionsCustom(
  basePath?: string,
  extension?: string
): ComposerOptions {
  return {
    modulePathResolver: createViteModuleResolver({
      basePath,
      extension,
    }),
  };
}
