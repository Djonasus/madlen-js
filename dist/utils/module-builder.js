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
//# sourceMappingURL=module-builder.js.map