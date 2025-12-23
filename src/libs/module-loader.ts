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
    try {
      const dynamicImport = new Function(
        "specifier",
        "return import(specifier)"
      );
      const module = await dynamicImport(modulePath);

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
    } catch (error: any) {
      throw new Error(
        `Failed to load module ${moduleId} from ${modulePath}: ${
          error?.message || error
        }`
      );
    }
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
