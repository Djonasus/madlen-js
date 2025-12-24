import { catchError, from, switchMap, take } from "rxjs";
export class ComponentPool {
    constructor() {
        this.components = new Map();
    }
    register(selector, component) {
        this.components.set(selector, component.constructor);
        Reflect.defineMetadata("component", component, component.constructor);
    }
    get(selector) {
        return this.components.get(selector);
    }
}
export const globalComponentPool = new ComponentPool();
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
export function component(options) {
    return (target) => {
        if (!options.pool) {
            options.pool = globalComponentPool;
        }
        let finalTemplate;
        if (options.template) {
            finalTemplate = options.template;
            options.pool.register(options.selector, {
                component: options,
                template: finalTemplate,
                constructor: target,
            });
        }
        else if (options.templateUrl) {
            loadTemplate(options.templateUrl)
                .pipe(take(1), catchError((error) => {
                throw new Error(`Failed to load template from ${options.templateUrl}: ${error.message}`);
            }))
                .subscribe((template) => {
                finalTemplate = template;
                if (finalTemplate) {
                    options.pool.register(options.selector, {
                        component: options,
                        template: finalTemplate,
                        constructor: target,
                    });
                }
                else {
                    throw new Error(`Failed to load template from ${options.templateUrl}: Template is empty`);
                }
            });
        }
        return target;
    };
}
function loadTemplate(templateUrl) {
    return from(fetch(templateUrl)).pipe(switchMap((response) => {
        if (!response.ok) {
            throw new Error(`Failed to load template from ${templateUrl}: ${response.status} ${response.statusText}`);
        }
        return response.text();
    }));
}
//# sourceMappingURL=component.js.map