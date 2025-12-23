var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { throwError } from "rxjs";
import { catchError, switchMap, map } from "rxjs/operators";
import { composer, SDUIComposer, } from "./composer";
import { inject } from "./di";
import { HttpService } from "./http";
import { createDefaultModuleResolver } from "../utils/module-resolvers";
export class Bootstrap {
    constructor(apiUrl, containerId, options) {
        this.apiUrl = apiUrl;
        this.containerId = containerId;
        if (options?.composerOptions) {
            this.composer = new SDUIComposer(options.composerOptions);
        }
        else if (options?.autoDetectEnvironment !== false) {
            const autoOptions = this.detectEnvironment();
            if (autoOptions) {
                this.composer = new SDUIComposer(autoOptions);
            }
            else {
                this.composer = composer;
            }
        }
        else {
            this.composer = composer;
        }
    }
    /**
     * Рендерит компонент и возвращает Observable для обработки результата и ошибок
     * @returns Observable<HTMLElement> - поток с готовым элементом
     */
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            return throwError(() => new Error(`Container with id ${this.containerId} not found`));
        }
        return this.httpService
            .get(`${this.apiUrl}`)
            .pipe(catchError((error) => {
            return throwError(() => new Error(`Failed to fetch layout: ${error.message}`));
        }), map((response) => {
            if (!response || !response.entryPoint) {
                throw new Error(`Invalid layout response: missing 'entryPoint' field. Received: ${JSON.stringify(response)}`);
            }
            return response.entryPoint;
        }), switchMap((layout) => {
            if (!layout || !layout.type) {
                return throwError(() => new Error(`Invalid layout data: missing 'type' field. Received: ${JSON.stringify(layout)}`));
            }
            return this.composer.compose(layout);
        }), map((element) => {
            container.appendChild(element);
            return element;
        }), catchError((error) => {
            return throwError(() => error);
        }));
    }
    /**
     * Рендерит компонент с автоматической подпиской (старый способ для обратной совместимости)
     * @deprecated Используйте render() и подписывайтесь вручную для лучшего контроля
     */
    renderSync() {
        this.render().subscribe({
            next: () => { },
            error: (error) => {
                console.error("Failed to render layout:", error);
            },
        });
    }
    /**
     * Автоматически определяет окружение и возвращает соответствующие опции composer
     */
    detectEnvironment() {
        try {
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            const hasVite = new Function('try { return typeof import !== "undefined" && typeof import.meta !== "undefined" && import.meta.env !== undefined; } catch { return false; }')();
            if (hasVite) {
                return {
                    modulePathResolver: createDefaultModuleResolver({
                        basePath: "/src/modules",
                        extension: ".ts",
                    }),
                };
            }
        }
        catch { }
        if (typeof window !== "undefined" && window.__webpack_require__) {
            return {
                modulePathResolver: createDefaultModuleResolver({
                    basePath: "./modules",
                    extension: ".ts",
                }),
            };
        }
        return null;
    }
}
__decorate([
    inject(),
    __metadata("design:type", HttpService)
], Bootstrap.prototype, "httpService", void 0);
//# sourceMappingURL=bootstrap.js.map