import { IInterpreter } from "./iinterpreter";
interface BasicComponentSchema {
    selector: string;
    children?: BasicComponentSchema[];
    props?: Record<string, any>;
    styles?: Record<string, string>;
}
export declare class BasicInterpreter implements IInterpreter<BasicComponentSchema> {
    interpret(input: BasicComponentSchema): HTMLElement | DocumentFragment;
    private createElementRecursive;
    private applyStyles;
}
export {};
//# sourceMappingURL=basic-interpreter.d.ts.map