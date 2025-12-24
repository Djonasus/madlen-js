import { provide } from "./di";
import { IInterpreter } from "./interpreter/iinterpreter";

export class Composer {
  private interpreter: IInterpreter;
  private rootElement: HTMLElement | DocumentFragment;

  constructor(
    interpreter: IInterpreter,
    rootElement: HTMLElement | DocumentFragment
  ) {
    this.interpreter = interpreter;
    this.rootElement = rootElement;
  }

  compose<T>(input: T): void {
    const element = this.interpreter.interpret(input);
    if (element instanceof DocumentFragment) {
      this.rootElement.append(element);
    } else {
      this.rootElement.appendChild(element);
    }
  }
}
