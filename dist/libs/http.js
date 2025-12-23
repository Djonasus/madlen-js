"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpService = void 0;
const rxjs_1 = require("rxjs");
const di_1 = require("./di");
function errorHandler(response$) {
    return response$.pipe((0, rxjs_1.switchMap)((response) => {
        if (!response.ok) {
            return (0, rxjs_1.throwError)(() => new Error(`HTTP ${response.status}: ${response.statusText}`));
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return (0, rxjs_1.throwError)(() => new Error("Response is not JSON"));
        }
        return (0, rxjs_1.from)(response.json());
    }), (0, rxjs_1.catchError)((error) => {
        if (error instanceof SyntaxError) {
            return (0, rxjs_1.throwError)(() => new Error("Failed to parse JSON response"));
        }
        return (0, rxjs_1.throwError)(() => error);
    }));
}
let HttpService = class HttpService {
    get(url) {
        return (0, rxjs_1.from)(fetch(url)).pipe((errorHandler));
    }
    post(url, data) {
        return (0, rxjs_1.from)(fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })).pipe((errorHandler));
    }
    put(url, data) {
        return (0, rxjs_1.from)(fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })).pipe((errorHandler));
    }
    delete(url) {
        return (0, rxjs_1.from)(fetch(url, { method: "DELETE" })).pipe((0, rxjs_1.map)((response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            if (response.status === 204) {
                return undefined;
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return response.json();
            }
            return undefined;
        }), (0, rxjs_1.catchError)((error) => (0, rxjs_1.throwError)(() => error)));
    }
};
exports.HttpService = HttpService;
exports.HttpService = HttpService = __decorate([
    (0, di_1.provide)()
], HttpService);
//# sourceMappingURL=http.js.map