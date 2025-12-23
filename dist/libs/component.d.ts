import { ModuleDefinition } from "./module-loader";
type Constructor<T = any> = new (...args: any[]) => T;
export interface ComponentProps {
    [key: string]: any;
}
export interface ComponentInstance<TProps extends ComponentProps = ComponentProps> {
    props?: TProps;
    element?: HTMLElement;
    onInit?: () => void;
    onDestroy?: () => void;
    onPropsChange?: (props: TProps) => void;
}
interface ComponentOptions {
    selector: string;
    templateUrl?: string;
    template?: string;
    styleUrl?: string;
    version?: string;
    module?: ModuleDefinition;
}
interface ComponentMetadata extends ComponentOptions {
    templateContent?: string;
    styleContent?: string;
    moduleUrl?: string;
}
export declare class ComponentPool {
    private components;
    private metadata;
    register<T>(selector: string, component: Constructor<T>, metadata: ComponentMetadata): void;
    loadTemplate(selector: string): Promise<string>;
    private resolveTemplateUrl;
    get<T>(selector: string): T;
    getMetadata(selector: string): ComponentMetadata | undefined;
}
export declare const globalComponentPool: ComponentPool;
export declare function component(options: ComponentOptions): (target: Constructor) => void;
export {};
//# sourceMappingURL=component.d.ts.map