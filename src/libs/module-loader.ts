import { ComponentPool } from "./component";
import { DIPool } from "./di";

export interface ModuleDefinition {
  id: string;
  version: string;
  diPool: DIPool;
  componentPool: ComponentPool;
  init?: () => void | Promise<void>;
  destroy?: () => void;
}

export class ModuleLoader {
  private loadedModules = new Map<string, ModuleDefinition>();
  private loadingPromises = new Map<string, Promise<ModuleDefinition>>();

  async loadModule(
    moduleId: string,
    modulePath: string
  ): Promise<ModuleDefinition> {
    if (this.loadedModules.has(moduleId)) {
      return this.loadedModules.get(moduleId)!;
    }

    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId)!;
    }

    const loadPromise = this.doLoadModule(moduleId, modulePath);
    this.loadingPromises.set(moduleId, loadPromise);

    try {
      const module = await loadPromise;
      this.loadedModules.set(moduleId, module);

      if (module.init) {
        await module.init();
      }

      return module;
    } finally {
      this.loadingPromises.delete(moduleId);
    }
  }

  private async doLoadModule(
    moduleId: string,
    modulePath: string
  ): Promise<ModuleDefinition> {
    const dynamicImport = new Function("specifier", "return import(specifier)");

    let lastError: any;
    try {
      const module = await dynamicImport(modulePath);
      return this.validateModule(moduleId, module, modulePath);
    } catch (error: any) {
      lastError = error;
      console.error(
        `Failed to load module ${moduleId} from ${modulePath}:`,
        error
      );
    }

    const alternatePath = this.getAlternateExtensionPath(modulePath);
    if (alternatePath && alternatePath !== modulePath) {
      try {
        const module = await dynamicImport(alternatePath);
        return this.validateModule(moduleId, module, alternatePath);
      } catch (error: any) {
        console.error(
          `Failed to load module ${moduleId} from alternate path ${alternatePath}:`,
          error
        );
      }
    }

    const errorMessage =
      lastError?.message || String(lastError) || "Unknown error";
    const errorStack = lastError?.stack ? `\nStack: ${lastError.stack}` : "";

    throw new Error(
      `Failed to load module ${moduleId} from ${modulePath}: ${errorMessage}${errorStack}`
    );
  }

  private validateModule(
    moduleId: string,
    module: any,
    modulePath: string
  ): ModuleDefinition {
    if (!module.moduleDefinition) {
      throw new Error(`Module ${moduleId} does not export moduleDefinition`);
    }

    const definition: ModuleDefinition = module.moduleDefinition;

    if (definition.id !== moduleId) {
      throw new Error(
        `Module ID mismatch: expected ${moduleId}, got ${definition.id}`
      );
    }

    return definition;
  }

  private getAlternateExtensionPath(modulePath: string): string | null {
    if (modulePath.endsWith(".ts")) {
      return modulePath.replace(/\.ts$/, ".js");
    }
    if (modulePath.endsWith(".js")) {
      return modulePath.replace(/\.js$/, ".ts");
    }
    return null;
  }

  getModule(moduleId: string): ModuleDefinition | undefined {
    return this.loadedModules.get(moduleId);
  }

  isLoaded(moduleId: string): boolean {
    return this.loadedModules.has(moduleId);
  }

  async unloadModule(moduleId: string): Promise<void> {
    const module = this.loadedModules.get(moduleId);
    if (module) {
      if (module.destroy) {
        await module.destroy();
      }
      this.loadedModules.delete(moduleId);
    }
  }
}

export const moduleLoader = new ModuleLoader();
