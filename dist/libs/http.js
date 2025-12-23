var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { catchError, from, map, switchMap, throwError } from "rxjs";
import { provide } from "./di";
function errorHandler(response$) {
    return response$.pipe(switchMap((response) => {
        if (!response.ok) {
            return throwError(() => new Error(`HTTP ${response.status}: ${response.statusText}`));
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return throwError(() => new Error("Response is not JSON"));
        }
        return from(response.json());
    }), catchError((error) => {
        if (error instanceof SyntaxError) {
            return throwError(() => new Error("Failed to parse JSON response"));
        }
        return throwError(() => error);
    }));
}
let HttpService = class HttpService {
    get(url) {
        return from(fetch(url)).pipe((errorHandler));
    }
    post(url, data) {
        return from(fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })).pipe((errorHandler));
    }
    put(url, data) {
        return from(fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })).pipe((errorHandler));
    }
    delete(url) {
        return from(fetch(url, { method: "DELETE" })).pipe(map((response) => {
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
        }), catchError((error) => throwError(() => error)));
    }
};
HttpService = __decorate([
    provide()
], HttpService);
export { HttpService };
//# sourceMappingURL=http.js.map