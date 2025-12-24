import { globalComponentPool } from "../component";
import jss from "jss";
export class BasicInterpreter {
    interpret(input) {
        const component = globalComponentPool.get(input.selector);
        if (!component) {
            throw new Error(`Component ${input.selector} not found`);
        }
        const componentMetadata = Reflect.getMetadata("component", component);
        if (!componentMetadata) {
            throw new Error(`Component metadata not found for ${input.selector}`);
        }
        const element = document.createDocumentFragment();
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = componentMetadata.template;
        const childrenContainer = tempContainer.querySelector("[madlen-children]");
        while (tempContainer.firstChild) {
            element.appendChild(tempContainer.firstChild);
        }
        if (input.styles && Object.keys(input.styles).length > 0) {
            const rootElement = element.firstElementChild;
            if (rootElement) {
                this.applyStyles(rootElement, input.styles);
            }
        }
        if (input.children && input.children.length > 0) {
            const targetContainer = childrenContainer || element;
            this.createElementRecursive(targetContainer, input.children);
        }
        return element;
    }
    createElementRecursive(parent, children) {
        for (const child of children) {
            const element = this.interpret(child);
            parent.append(element);
        }
    }
    applyStyles(element, styles) {
        if (!styles || Object.keys(styles).length === 0) {
            return;
        }
        const className = `madlen-style-${Math.random().toString(36).substr(2, 9)}`;
        const sheet = jss.createStyleSheet({
            [className]: styles,
        });
        sheet.attach();
        element.classList.add(className);
    }
}
//# sourceMappingURL=basic-interpreter.js.map