import { IInterpreter } from "./interpreter/iinterpreter";
export declare class Composer {
    private interpreter;
    private rootElement;
    constructor(interpreter: IInterpreter, rootElement: HTMLElement | DocumentFragment);
    compose<T>(input: T): void;
}
//# sourceMappingURL=composer.d.ts.map