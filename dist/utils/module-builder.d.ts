import type { ModuleDefinition } from "../libs/module-loader";
export interface ModuleBuilderOptions {
    id: string;
    version: string;
}
/**
 * Создает определение модуля с пулами для компонентов и DI
 */
export declare function createModule(options: ModuleBuilderOptions): ModuleDefinition;
//# sourceMappingURL=module-builder.d.ts.map