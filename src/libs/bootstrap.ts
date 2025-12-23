import { catchError, take, switchMap, map } from "rxjs/operators";
import { ComponentDefinition, composer } from "./composer";
import { inject } from "./di";
import { HttpService } from "./http";

export class Bootstrap {
  private apiUrl: string;
  private containerId: string;

  @inject()
  private httpService!: HttpService;

  constructor(apiUrl: string, containerId: string) {
    this.apiUrl = apiUrl;
    this.containerId = containerId;
  }

  public render() {
    const container = document.getElementById(this.containerId);

    if (!container) {
      throw new Error(`Container with id ${this.containerId} not found`);
    }

    this.httpService
      .get<{ component: ComponentDefinition }>(`${this.apiUrl}/layout`)
      .pipe(
        catchError((error: Error) => {
          throw new Error(`Failed to fetch layout: ${error}`);
        }),
        take(1),
        map((response) => {
          console.log(response);
          // #region agent log
          fetch(
            "http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "bootstrap.ts:32",
                message: "layout received from server",
                data: {
                  response: response,
                  hasComponent: "component" in (response || {}),
                  component: response?.component,
                  componentType: response?.component?.type,
                  responseKeys: response ? Object.keys(response) : [],
                },
                timestamp: Date.now(),
                sessionId: "debug-session",
                runId: "run1",
                hypothesisId: "A",
              }),
            }
          ).catch(() => {});
          // #endregion
          if (!response || !response.component) {
            throw new Error(
              `Invalid layout response: missing 'component' field. Received: ${JSON.stringify(
                response
              )}`
            );
          }
          return response.component;
        }),
        switchMap((layout) => {
          // #region agent log
          fetch(
            "http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "bootstrap.ts:60",
                message: "extracted component",
                data: {
                  layout: layout,
                  layoutType: typeof layout,
                  hasType: "type" in (layout || {}),
                  typeValue: layout?.type,
                  layoutKeys: layout ? Object.keys(layout) : [],
                },
                timestamp: Date.now(),
                sessionId: "debug-session",
                runId: "run1",
                hypothesisId: "A",
              }),
            }
          ).catch(() => {});
          // #endregion
          if (!layout || !layout.type) {
            throw new Error(
              `Invalid layout data: missing 'type' field. Received: ${JSON.stringify(
                layout
              )}`
            );
          }
          return composer.compose(layout);
        })
      )
      .subscribe({
        next: (element) => {
          container.appendChild(element);
        },
        error: (error) => {
          // #region agent log
          fetch(
            "http://127.0.0.1:7242/ingest/56b6cbd4-937e-49c5-bfa8-a789eb16c032",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "bootstrap.ts:subscribe-error",
                message: "subscribe error",
                data: {
                  errorMessage: error?.message,
                  errorName: error?.name,
                  errorStack: error?.stack,
                },
                timestamp: Date.now(),
                sessionId: "debug-session",
                runId: "run1",
                hypothesisId: "A",
              }),
            }
          ).catch(() => {});
          // #endregion
          console.error("Failed to render layout:", error);
        },
      });
  }
}
