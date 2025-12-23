import { Observable } from "rxjs";
import { ComposerOptions } from "./composer";
import { ModuleDefinition } from "./module-loader";
export interface BootstrapOptions {
    composerOptions?: ComposerOptions;
    autoDetectEnvironment?: boolean;
    preloadModules?: ModuleDefinition[];
}
export declare class Bootstrap {
    private apiUrl;
    private containerId;
    private composer;
    private httpService;
    constructor(apiUrl: string, containerId: string, options?: BootstrapOptions);
    /**
     * Рендерит компонент и возвращает Observable для обработки результата и ошибок
     * @returns Observable<HTMLElement> - поток с готовым элементом
     */
    render(): Observable<HTMLElement>;
    /**
     * Рендерит компонент с автоматической подпиской (старый способ для обратной совместимости)
     * @deprecated Используйте render() и подписывайтесь вручную для лучшего контроля
     */
    renderSync(): void;
    /**
     * Автоматически определяет окружение и возвращает соответствующие опции composer
     */
    private detectEnvironment;
}
//# sourceMappingURL=bootstrap.d.ts.map