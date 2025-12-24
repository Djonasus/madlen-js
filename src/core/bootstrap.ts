import { map, Observable, take } from "rxjs";
import { Composer } from "./composer";
import { IInterpreter } from "./interpreter/iinterpreter";
import { HttpService } from "./http";
import { inject } from "./di";

interface BootstrapOptions {
  apiUrl: string;
  containerId: string;
  interpreter: IInterpreter;
}

export class Bootstrap {
  private apiUrl: string;
  private containerId: string;
  private interpreter: IInterpreter;
  private composer: Composer;

  @inject()
  private httpService!: HttpService;

  constructor(options: BootstrapOptions) {
    this.apiUrl = options.apiUrl;
    this.containerId = options.containerId;
    this.interpreter = options.interpreter;

    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container with id "${this.containerId}" not found`);
    }

    this.composer = new Composer(this.interpreter, container);
  }

  public render(): Observable<HTMLElement> {
    return this.httpService.get<unknown>(`${this.apiUrl}`).pipe(
      take(1),
      map((response) => {
        this.composer.compose(response);
        const container = document.getElementById(this.containerId);
        if (!container) {
          throw new Error(`Container with id "${this.containerId}" not found`);
        }
        return container;
      })
    );
  }
}
