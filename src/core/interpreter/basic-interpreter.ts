import { ComponentMetadata, globalComponentPool } from "../component";
import { Constructor } from "../di";
import { IInterpreter } from "./iinterpreter";
import jss from "jss";

interface BasicComponentSchema {
  selector: string;
  children?: BasicComponentSchema[];
  props?: Record<string, any>;
  styles?: Record<string, string>;
}

export class BasicInterpreter implements IInterpreter<BasicComponentSchema> {
  interpret(input: BasicComponentSchema): HTMLElement | DocumentFragment {
    const component = globalComponentPool.get(input.selector);

    if (!component) {
      throw new Error(`Component ${input.selector} not found`);
    }

    const componentMetadata = Reflect.getMetadata(
      "component",
      component
    ) as ComponentMetadata;

    if (!componentMetadata) {
      throw new Error(`Component metadata not found for ${input.selector}`);
    }

    const element = document.createDocumentFragment();

    let template = componentMetadata.template;
    if (input.props && Object.keys(input.props).length > 0) {
      template = this.interpolateTemplate(template, input.props);
    }

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = template;

    const childrenContainer = tempContainer.querySelector(
      "[madlen-children]"
    ) as HTMLElement | null;

    while (tempContainer.firstChild) {
      element.appendChild(tempContainer.firstChild);
    }

    const rootElement = element.firstElementChild as HTMLElement;

    if (rootElement && component) {
      const componentInstance = this.createComponentInstance(
        component,
        input.props,
        rootElement
      );
      (rootElement as any).__componentInstance = componentInstance;
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

  private createElementRecursive(
    parent: DocumentFragment | HTMLElement,
    children: BasicComponentSchema[]
  ) {
    for (const child of children) {
      const element = this.interpret(child) as DocumentFragment;
      parent.append(element);
    }
  }

  private interpolateTemplate(
    template: string,
    props?: Record<string, any>
  ): string {
    if (!props || Object.keys(props).length === 0) {
      return template;
    }

    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, propName) => {
      return props[propName] !== undefined ? String(props[propName]) : match;
    });
  }

  private createComponentInstance(
    ComponentClass: Constructor,
    props?: Record<string, any>,
    element?: HTMLElement
  ): any {
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

  private applyStyles(
    element: HTMLElement,
    styles: Record<string, string>
  ): void {
    if (!styles || Object.keys(styles).length === 0) {
      return;
    }

    const convertedStyles: Record<string, string> = {};
    Object.entries(styles).forEach(([key, value]) => {
      const cssProperty = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      convertedStyles[cssProperty] = value;
    });

    const className = `madlen-style-${Math.random().toString(36).substr(2, 9)}`;

    const sheet = jss.createStyleSheet(
      {
        [className]: convertedStyles,
      },
      {
        link: true,
      }
    );

    sheet.attach();

    element.classList.add(sheet.classes[className]);
  }
}
