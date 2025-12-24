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
    /**
     * Карта маршрутизации: маппинг moduleId -> путь к модулю
     * Если указана, имеет приоритет над modulePathResolver
     */
    routingMap?: Map<string, string> | ((moduleId: string) => string);
}
export declare class SDUIComposer {
    private moduleLoader;
    private globalComponentPool;
    private modulePathResolver;
    private routingMap?;
    constructor(options?: ComposerOptions);
    /**
     * Получает путь к модулю из карты маршрутизации или использует resolver
     */
    private getModulePath;
    compose(json: ComponentDefinition): Observable<HTMLElement>;
    private createElementFromTemplate;
    private findChildrenContainer;
    private applyStyles;
    private applyProps;
    private interpolateProps;
    private isStandardAttribute;
    private createComponentInstance;
    composeMultiple(definitions: ComponentDefinition[], container?: HTMLElement): Observable<HTMLElement>;
}
export declare const composer: SDUIComposer;
//# sourceMappingURL=composer.d.ts.map