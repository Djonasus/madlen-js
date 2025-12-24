import { Observable } from "rxjs";
import { IInterpreter } from "./interpreter/iinterpreter";
interface BootstrapOptions {
    apiUrl: string;
    containerId: string;
    interpreter: IInterpreter;
}
export declare class Bootstrap {
    private apiUrl;
    private containerId;
    private interpreter;
    private composer;
    private httpService;
    constructor(options: BootstrapOptions);
    render(): Observable<HTMLElement>;
}
export {};
//# sourceMappingURL=bootstrap.d.ts.map