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
          console.error("Failed to render layout:", error);
        },
      });
  }
}
