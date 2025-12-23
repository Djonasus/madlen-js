export class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
    }
    async loadModule(moduleId, modulePath) {
        if (this.loadedModules.has(moduleId)) {
            return this.loadedModules.get(moduleId);
        }
        if (this.loadingPromises.has(moduleId)) {
            return this.loadingPromises.get(moduleId);
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
        }
        finally {
            this.loadingPromises.delete(moduleId);
        }
    }
    async doLoadModule(moduleId, modulePath) {
        const dynamicImport = new Function("specifier", "return import(specifier)");
        let lastError;
        try {
            const module = await dynamicImport(modulePath);
            return this.validateModule(moduleId, module, modulePath);
        }
        catch (error) {
            lastError = error;
            console.error(`Failed to load module ${moduleId} from ${modulePath}:`, error);
        }
        const alternatePath = this.getAlternateExtensionPath(modulePath);
        if (alternatePath && alternatePath !== modulePath) {
            try {
                const module = await dynamicImport(alternatePath);
                return this.validateModule(moduleId, module, alternatePath);
            }
            catch (error) {
                console.error(`Failed to load module ${moduleId} from alternate path ${alternatePath}:`, error);
            }
        }
        const errorMessage = lastError?.message || String(lastError) || "Unknown error";
        const errorStack = lastError?.stack ? `\nStack: ${lastError.stack}` : "";
        throw new Error(`Failed to load module ${moduleId} from ${modulePath}: ${errorMessage}${errorStack}`);
    }
    validateModule(moduleId, module, modulePath) {
        if (!module.moduleDefinition) {
            throw new Error(`Module ${moduleId} does not export moduleDefinition`);
        }
        const definition = module.moduleDefinition;
        if (definition.id !== moduleId) {
            throw new Error(`Module ID mismatch: expected ${moduleId}, got ${definition.id}`);
        }
        return definition;
    }
    getAlternateExtensionPath(modulePath) {
        if (modulePath.endsWith(".ts")) {
            return modulePath.replace(/\.ts$/, ".js");
        }
        if (modulePath.endsWith(".js")) {
            return modulePath.replace(/\.js$/, ".ts");
        }
        return null;
    }
    getModule(moduleId) {
        return this.loadedModules.get(moduleId);
    }
    isLoaded(moduleId) {
        return this.loadedModules.has(moduleId);
    }
    async unloadModule(moduleId) {
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
//# sourceMappingURL=module-loader.js.map