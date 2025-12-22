import { Observable } from "rxjs";
export declare class HttpService {
    get<T>(url: string): Observable<T>;
    post<T>(url: string, data: any): Observable<T>;
    put<T>(url: string, data: any): Observable<T>;
    delete<T>(url: string): Observable<T | void>;
}
//# sourceMappingURL=http.d.ts.map