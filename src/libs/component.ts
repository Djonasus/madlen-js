import { ModuleDefinition } from "./module-loader";

type Constructor<T = any> = new (...args: any[]) => T;

export interface ComponentProps {
  [key: string]: any;
}

export interface ComponentInstance<
  TProps extends ComponentProps = ComponentProps
> {
  props?: TProps;
  element?: HTMLElement;
  onInit?: () => void;
  onDestroy?: () => void;
  onPropsChange?: (props: TProps) => void;
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
      try {
        const response = await fetch(templateUrl);
        if (!response.ok) {
          throw new Error(
            `Failed to load template from ${templateUrl}: ${response.status} ${response.statusText}`
          );
        }
        const content = await response.text();
        if (!content || content.trim() === "") {
          throw new Error(`Template file ${templateUrl} is empty`);
        }
        metadata.templateContent = content;
        return content;
      } catch (error: any) {
        throw new Error(
          `Failed to load template from ${templateUrl}: ${error.message}`
        );
      }
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

    if (templateUrl.startsWith("/")) {
      const needsRaw =
        templateUrl.endsWith(".html") && !templateUrl.includes("?");
      return needsRaw ? `${templateUrl}?raw` : templateUrl;
    }

    if (templateUrl.startsWith("./") || templateUrl.startsWith("../")) {
      if (!metadata?.moduleUrl) {
        throw new Error(
          `Cannot resolve template URL "${templateUrl}" for component "${selector}": ` +
            `moduleUrl is not set. Make sure the component is registered in a module ` +
            `or moduleUrl is set in component metadata.`
        );
      }

      const needsRaw =
        templateUrl.endsWith(".html") && !templateUrl.includes("?");
      const withRaw = needsRaw ? `${templateUrl}?raw` : templateUrl;
      return new URL(withRaw, metadata.moduleUrl + "/").href;
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
