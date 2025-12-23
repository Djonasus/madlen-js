import { ModuleDefinition } from "./module-loader";

type Constructor<T = any> = new (...args: any[]) => T;

export interface ComponentProps {
  [key: string]: any;
}

export interface ComponentInstance {
  props?: ComponentProps;
  element?: HTMLElement;
  onInit?: () => void;
  onDestroy?: () => void;
  onPropsChange?: (props: ComponentProps) => void;
}

interface ComponentOptions {
  selector: string;
  templateUrl?: string;
  template?: string;
  styleUrl?: string;
  version?: string;
  module?: ModuleDefinition;
}

interface ComponentMetadata extends ComponentOptions {
  templateContent?: string;
  styleContent?: string;
  moduleUrl?: string;
}

export class ComponentPool {
  private components = new Map<string, Constructor>();
  private metadata = new Map<string, ComponentMetadata>();

  public register<T>(
    selector: string,
    component: Constructor<T>,
    metadata: ComponentMetadata
  ): void {
    this.components.set(selector, component);
    this.metadata.set(selector, metadata);
  }

  public async loadTemplate(selector: string): Promise<string> {
    const metadata = this.metadata.get(selector);
    if (!metadata) {
      throw new Error(`Component ${selector} not found`);
    }

    if (metadata.templateContent) {
      return metadata.templateContent;
    }

    if (metadata.template) {
      return metadata.template;
    }

    if (metadata.templateUrl) {
      const templateUrl = this.resolveTemplateUrl(
        selector,
        metadata.templateUrl
      );
      const response = await fetch(templateUrl);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${templateUrl}`);
      }
      const content = await response.text();
      metadata.templateContent = content;
      return content;
    }

    throw new Error(`No template found for component ${selector}`);
  }

  private resolveTemplateUrl(selector: string, templateUrl: string): string {
    if (
      templateUrl.startsWith("http://") ||
      templateUrl.startsWith("https://")
    ) {
      return templateUrl;
    }

    const metadata = this.metadata.get(selector);
    if (metadata?.moduleUrl) {
      if (templateUrl.startsWith("/")) {
        return templateUrl;
      }
      return new URL(templateUrl, metadata.moduleUrl + "/").href;
    }

    if (templateUrl.startsWith("./") || templateUrl.startsWith("../")) {
      try {
        const baseUrl = window.location.origin + "/src/modules/";
        return new URL(templateUrl, baseUrl).href;
      } catch {
        return templateUrl;
      }
    }

    return templateUrl;
  }

  public get<T>(selector: string): T {
    return this.components.get(selector) as T;
  }

  public getMetadata(selector: string): ComponentMetadata | undefined {
    return this.metadata.get(selector);
  }
}

export const globalComponentPool = new ComponentPool();

export function component(options: ComponentOptions) {
  return (target: Constructor) => {
    const metadata: ComponentMetadata = {
      ...options,
      moduleUrl: undefined,
    };

    Reflect.defineMetadata("component", metadata, target);

    const targetPool = options.module
      ? options.module.componentPool
      : globalComponentPool;

    targetPool.register(options.selector, target, metadata);
  };
}
