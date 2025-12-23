var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { catchError, take, switchMap, map } from "rxjs/operators";
import { composer } from "./composer";
import { inject } from "./di";
import { HttpService } from "./http";
export class Bootstrap {
    constructor(apiUrl, containerId) {
        this.apiUrl = apiUrl;
        this.containerId = containerId;
    }
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            throw new Error(`Container with id ${this.containerId} not found`);
        }
        this.httpService
            .get(`${this.apiUrl}/layout`)
            .pipe(catchError((error) => {
            throw new Error(`Failed to fetch layout: ${error}`);
        }), take(1), map((response) => {
            if (!response || !response.component) {
                throw new Error(`Invalid layout response: missing 'component' field. Received: ${JSON.stringify(response)}`);
            }
            return response.component;
        }), switchMap((layout) => {
            if (!layout || !layout.type) {
                throw new Error(`Invalid layout data: missing 'type' field. Received: ${JSON.stringify(layout)}`);
            }
            return composer.compose(layout);
        }))
            .subscribe({
            next: (element) => {
                container.appendChild(element);
            },
            error: (error) => {
                console.error("Failed to render layout:", error);
            },
        });
    }
}
__decorate([
    inject(),
    __metadata("design:type", HttpService)
], Bootstrap.prototype, "httpService", void 0);
//# sourceMappingURL=bootstrap.js.map