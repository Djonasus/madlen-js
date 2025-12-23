import "reflect-metadata";
import type { ModuleDefinition } from "../libs/module-loader";
type Constructor<T = any> = new (...args: any[]) => T;
export interface ModuleBuilderOptions {
    id: string;
    version: string;
}
/**
 * Создает определение модуля с пулами для компонентов и DI
 */
export declare function createModule(options: ModuleBuilderOptions): ModuleDefinition;
/**
 * Декоратор для создания модуля
 * Применяется к классу и создает ModuleDefinition с пулами
 */
export declare function module(options: ModuleBuilderOptions): (target: Constructor) => Constructor<any>;
export {};
//# sourceMappingURL=module-builder.d.ts.map