import { Constructor } from "./di";
export interface ComponentOptions {
    selector: string;
    template?: string;
    templateUrl?: string;
    pool?: ComponentPool;
}
export interface ComponentMetadata {
    component: ComponentOptions;
    template: string;
    constructor: Constructor;
}
export declare class ComponentPool {
    private components;
    register(selector: string, component: ComponentMetadata): void;
    get(selector: string): Constructor | undefined;
}
export declare const globalComponentPool: ComponentPool;
/**
 * Декоратор компонента для регистрации класса как компонента с заданным селектором и шаблоном.
 *
 * При использовании, декоратор добавляет метаданные о шаблоне и регистрирует компонент
 * в указанном пуле компонентов (или в глобальном пуле, если пул не передан вручную).
 *
 * Можно указать шаблон непосредственно в виде строки (`template`) либо ссылку на файл шаблона (`templateUrl`).
 * Если шаблон загружается по ссылке, шаблон будет асинхронно получен и применён к компоненту.
 *
 * @param options Объект с опциями для компонента:
 *   - selector: строка-селектор компонента (обязателен)
 *   - template: строка шаблона (необязателен)
 *   - templateUrl: URL файла шаблона (необязателен)
 *   - basePath: базовый путь для resolve шаблона (необязателен)
 *   - pool: пул, куда будет зарегистрирован компонент (необязателен)
 *
 * @example
 * @component({
 *   selector: "my-component",
 *   templateUrl: "my-component.html"
 * })
 * export class MyComponent { ... }
 */
export declare function component(options: ComponentOptions): (target: Constructor) => Constructor;
//# sourceMappingURL=component.d.ts.map