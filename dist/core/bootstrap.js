var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { map, take } from "rxjs";
import { Composer } from "./composer";
import { HttpService } from "./http";
import { inject } from "./di";
export class Bootstrap {
    constructor(options) {
        this.apiUrl = options.apiUrl;
        this.containerId = options.containerId;
        this.interpreter = options.interpreter;
        const container = document.getElementById(this.containerId);
        if (!container) {
            throw new Error(`Container with id "${this.containerId}" not found`);
        }
        this.composer = new Composer(this.interpreter, container);
    }
    render() {
        return this.httpService.get(`${this.apiUrl}`).pipe(take(1), map((response) => {
            this.composer.compose(response);
            const container = document.getElementById(this.containerId);
            if (!container) {
                throw new Error(`Container with id "${this.containerId}" not found`);
            }
            return container;
        }));
    }
}
__decorate([
    inject(),
    __metadata("design:type", HttpService)
], Bootstrap.prototype, "httpService", void 0);
//# sourceMappingURL=bootstrap.js.map