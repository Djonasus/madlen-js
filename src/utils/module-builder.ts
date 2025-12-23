import "reflect-metadata";
import type { ModuleDefinition } from "../libs/module-loader";
import { ComponentPool } from "../libs/component";
import { DIPool } from "../libs/di";

type Constructor<T = any> = new (...args: any[]) => T;

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

/**
 * Декоратор для создания модуля
 * Применяется к классу и создает ModuleDefinition с пулами
 */
export function module(options: ModuleBuilderOptions) {
  return (target: Constructor) => {
    const diPool = new DIPool();
    const componentPool = new ComponentPool();

    const moduleDefinition: ModuleDefinition = {
      id: options.id,
      version: options.version,
      diPool,
      componentPool,
    };

    // Сохраняем определение модуля в метаданных класса
    Reflect.defineMetadata("module", moduleDefinition, target);

    // Добавляем статическое свойство для доступа к определению модуля
    Object.defineProperty(target, "moduleDefinition", {
      value: moduleDefinition,
      writable: false,
      enumerable: true,
      configurable: false,
    });

    return target;
  };
}
