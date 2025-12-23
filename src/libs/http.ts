import { catchError, from, map, Observable, switchMap, throwError } from "rxjs";
import { provide } from "./di";

function errorHandler<T>(response$: Observable<Response>): Observable<T> {
  return response$.pipe(
    switchMap((response: Response) => {
      if (!response.ok) {
        return throwError(
          () => new Error(`HTTP ${response.status}: ${response.statusText}`)
        );
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return throwError(() => new Error("Response is not JSON"));
      }
      return from(response.json()) as Observable<T>;
    }),
    catchError((error: Error) => {
      if (error instanceof SyntaxError) {
        return throwError(() => new Error("Failed to parse JSON response"));
      }
      return throwError(() => error);
    })
  );
}

@provide()
export class HttpService {
  public get<T>(url: string): Observable<T> {
    return from(fetch(url)).pipe(errorHandler<T>);
  }

  public post<T>(url: string, data: any): Observable<T> {
    return from(
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).pipe(errorHandler<T>);
  }

  public put<T>(url: string, data: any): Observable<T> {
    return from(
      fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    ).pipe(errorHandler<T>);
  }

  public delete<T>(url: string): Observable<T | void> {
    return from(fetch(url, { method: "DELETE" })).pipe(
      map((response: Response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        if (response.status === 204) {
          return undefined as T;
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json() as T;
        }
        return undefined as T;
      }),
      catchError((error: Error) => throwError(() => error))
    );
  }
}
