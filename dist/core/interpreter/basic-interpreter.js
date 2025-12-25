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
        const interpolatedTemplate = this.interpolateTemplate(componentMetadata.template, input.props);
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = interpolatedTemplate;
        const childrenContainer = tempContainer.querySelector("[madlen-children]");
        while (tempContainer.firstChild) {
            element.appendChild(tempContainer.firstChild);
        }
        const rootElement = element.firstElementChild;
        if (rootElement && component) {
            const componentInstance = this.createComponentInstance(component, input.props, rootElement);
            rootElement.__componentInstance = componentInstance;
        }
        if (input.styles && Object.keys(input.styles).length > 0) {
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
    interpolateTemplate(template, props) {
        if (!props || Object.keys(props).length === 0) {
            return template;
        }
        return template.replace(/\{\{(\w+)\}\}/g, (match, propName) => {
            return props[propName] !== undefined ? String(props[propName]) : match;
        });
    }
    createComponentInstance(ComponentClass, props, element) {
        const instance = new ComponentClass();
        if (props) {
            instance.props = props;
        }
        if (element) {
            instance.element = element;
        }
        if (typeof instance.onInit === "function") {
            instance.onInit();
        }
        return instance;
    }
    applyStyles(element, styles) {
        if (!styles || Object.keys(styles).length === 0) {
            return;
        }
        const convertedStyles = {};
        Object.entries(styles).forEach(([key, value]) => {
            const cssProperty = key.replace(/([A-Z])/g, "-$1").toLowerCase();
            convertedStyles[cssProperty] = value;
        });
        const className = `madlen-style-${Math.random().toString(36).substr(2, 9)}`;
        const sheet = jss.createStyleSheet({
            [className]: convertedStyles,
        }, {
            link: true,
        });
        sheet.attach();
        element.classList.add(sheet.classes[className]);
    }
}
//# sourceMappingURL=basic-interpreter.js.map