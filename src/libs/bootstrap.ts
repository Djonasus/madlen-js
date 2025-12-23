import { catchError, take, switchMap } from "rxjs/operators";
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
      .get<ComponentDefinition>(`${this.apiUrl}/layout`)
      .pipe(
        catchError((error: Error) => {
          throw new Error(`Failed to fetch layout: ${error}`);
        }),
        take(1),
        switchMap((layout) => composer.compose(layout))
      )
      .subscribe((element) => {
        container.appendChild(element);
      });
  }
}
