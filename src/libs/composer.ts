import { ComponentPool, globalComponentPool } from "./component";
import { ModuleLoader, ModuleDefinition, moduleLoader } from "./module-loader";

export interface ComponentDefinition {
  type: string;
  moduleId?: string;
  version?: string;
  props?: Record<string, any>;
  children?: ComponentDefinition[];
  styles?: Record<string, any>;
}

export interface ComposerOptions {
  moduleLoader?: ModuleLoader;
  globalComponentPool?: ComponentPool;
  modulePathResolver?: (moduleId: string) => string;
}

export class SDUIComposer {
  private moduleLoader: ModuleLoader;
  private globalComponentPool: ComponentPool;
  private modulePathResolver: (moduleId: string) => string;

  constructor(options: ComposerOptions = {}) {
    this.moduleLoader = options.moduleLoader || moduleLoader;
    this.globalComponentPool =
      options.globalComponentPool || globalComponentPool;
    this.modulePathResolver =
      options.modulePathResolver ||
      ((moduleId: string) => `/modules/${moduleId}/index.js`);
  }

  async compose(json: ComponentDefinition): Promise<HTMLElement> {
    let module: ModuleDefinition | undefined;
    if (json.moduleId) {
      const modulePath = this.modulePathResolver(json.moduleId);
      module = await this.moduleLoader.loadModule(json.moduleId, modulePath);
    }

    const componentPool = module
      ? module.componentPool
      : this.globalComponentPool;

    const ComponentClass = componentPool.get(json.type);
    if (!ComponentClass) {
      const poolName = module ? `module ${json.moduleId}` : "global";
      throw new Error(
        `Component ${json.type} not found in ${poolName} component pool`
      );
    }

    const componentMetadata = componentPool.getMetadata(json.type);
    const componentVersion = json.version || componentMetadata?.version;

    const template = await componentPool.loadTemplate(json.type);

    const element = this.createElementFromTemplate(template);

    if (componentVersion) {
      element.setAttribute("data-component-version", componentVersion);
      element.setAttribute("data-component-type", json.type);
      if (json.moduleId) {
        element.setAttribute("data-component-module", json.moduleId);
      }
    }

    if (json.styles) {
      this.applyStyles(element, json.styles, componentVersion);
    }

    if (json.props) {
      this.applyProps(element, json.props);
    }

    if (json.children && json.children.length > 0) {
      for (const child of json.children) {
        const childElement = await this.compose(child);
        element.appendChild(childElement);
      }
    }

    return element;
  }

  private createElementFromTemplate(template: string): HTMLElement {
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = template.trim();

    if (tempContainer.children.length === 1) {
      return tempContainer.firstElementChild as HTMLElement;
    }

    if (tempContainer.children.length > 1) {
      const wrapper = document.createElement("div");
      while (tempContainer.firstChild) {
        wrapper.appendChild(tempContainer.firstChild);
      }
      return wrapper;
    }

    return document.createElement("div");
  }

  private applyStyles(
    element: HTMLElement,
    styles: Record<string, any>,
    version?: string
  ): void {
    Object.entries(styles).forEach(([key, value]) => {
      const cssProperty = key.replace(/([A-Z])/g, "-$1").toLowerCase();

      (element.style as any)[cssProperty] = value;
    });
  }

  private applyProps(element: HTMLElement, props: Record<string, any>): void {
    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith("data-")) {
        element.setAttribute(key, String(value));
      } else if (key.startsWith("aria-")) {
        element.setAttribute(key, String(value));
      } else if (this.isStandardAttribute(key)) {
        element.setAttribute(key, String(value));
      } else {
        element.setAttribute(`data-${key}`, String(value));
      }
    });
  }

  private isStandardAttribute(key: string): boolean {
    const standardAttributes = [
      "id",
      "class",
      "title",
      "alt",
      "src",
      "href",
      "target",
      "type",
      "value",
      "name",
      "placeholder",
      "disabled",
      "readonly",
      "checked",
      "selected",
      "role",
    ];
    return standardAttributes.includes(key.toLowerCase());
  }

  async composeMultiple(
    definitions: ComponentDefinition[],
    container?: HTMLElement
  ): Promise<HTMLElement> {
    const root = container || document.createElement("div");

    for (const definition of definitions) {
      const element = await this.compose(definition);
      root.appendChild(element);
    }

    return root;
  }
}

export const composer = new SDUIComposer();
