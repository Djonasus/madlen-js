import "reflect-metadata";
import { ComponentPool } from "../libs/component";
import { DIPool } from "../libs/di";
/**
 * Создает определение модуля с пулами для компонентов и DI
 */
export function createModule(options) {
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
export function module(options) {
    return (target) => {
        const diPool = new DIPool();
        const componentPool = new ComponentPool();
        const moduleDefinition = {
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
//# sourceMappingURL=module-builder.js.map