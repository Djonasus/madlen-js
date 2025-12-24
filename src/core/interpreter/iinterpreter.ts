export interface IInterpreter<T = unknown> {
  interpret(input: T): HTMLElement | DocumentFragment;
}
