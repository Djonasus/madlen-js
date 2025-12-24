import { ComponentMetadata, globalComponentPool } from "../component";
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

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = componentMetadata.template;

    const childrenContainer = tempContainer.querySelector(
      "[madlen-children]"
    ) as HTMLElement | null;

    while (tempContainer.firstChild) {
      element.appendChild(tempContainer.firstChild);
    }

    if (input.styles && Object.keys(input.styles).length > 0) {
      const rootElement = element.firstElementChild as HTMLElement;
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

  private applyStyles(
    element: HTMLElement,
    styles: Record<string, string>
  ): void {
    if (!styles || Object.keys(styles).length === 0) {
      return;
    }

    const className = `madlen-style-${Math.random().toString(36).substr(2, 9)}`;

    const sheet = jss.createStyleSheet(
      {
        [className]: styles,
      },
      {
        link: true,
      }
    );

    sheet.attach();

    element.classList.add(sheet.classes[className]);
  }
}
