import type { ModuleDefinition } from "../libs/module-loader";
import { ComponentPool } from "../libs/component";
import { DIPool } from "../libs/di";

export interface ModuleBuilderOptions {
  id: string;
  version: string;
}

/**
 * Создает определение модуля с пулами для компонентов и DI
 */
export function createModule(options: ModuleBuilderOptions): ModuleDefinition {
  const diPool = new DIPool();
  const componentPool = new ComponentPool();

  return {
    id: options.id,
    version: options.version,
    diPool,
    componentPool,
  };
}
