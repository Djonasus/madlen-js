import { Observable } from "rxjs";
import { ComponentPool } from "./component";
import { ModuleLoader } from "./module-loader";
export interface ComponentDefinition {
    type: string;
    moduleId?: string;
    version?: string;
    props?: Record<string, any>;
    children?: ComponentDefinition[];
    styles?: Record<string, any>;
}
export interface ComposerOptions {
    moduleLoader?: ModuleLoader;
    globalComponentPool?: ComponentPool;
    modulePathResolver?: (moduleId: string) => string;
}
export declare class SDUIComposer {
    private moduleLoader;
    private globalComponentPool;
    private modulePathResolver;
    constructor(options?: ComposerOptions);
    compose(json: ComponentDefinition): Observable<HTMLElement>;
    private createElementFromTemplate;
    private applyStyles;
    private applyProps;
    private interpolateProps;
    private isStandardAttribute;
    private createComponentInstance;
    composeMultiple(definitions: ComponentDefinition[], container?: HTMLElement): Observable<HTMLElement>;
}
export declare const composer: SDUIComposer;
//# sourceMappingURL=composer.d.ts.map