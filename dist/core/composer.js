export class Composer {
    constructor(interpreter, rootElement) {
        this.interpreter = interpreter;
        this.rootElement = rootElement;
    }
    compose(input) {
        const element = this.interpreter.interpret(input);
        if (element instanceof DocumentFragment) {
            this.rootElement.append(element);
        }
        else {
            this.rootElement.appendChild(element);
        }
    }
}
//# sourceMappingURL=composer.js.map