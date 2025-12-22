"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleLoader = exports.ModuleLoader = void 0;
class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
    }
    loadModule(moduleId, modulePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.loadedModules.has(moduleId)) {
                return this.loadedModules.get(moduleId);
            }
            if (this.loadingPromises.has(moduleId)) {
                return this.loadingPromises.get(moduleId);
            }
            const loadPromise = this.doLoadModule(moduleId, modulePath);
            this.loadingPromises.set(moduleId, loadPromise);
            try {
                const module = yield loadPromise;
                this.loadedModules.set(moduleId, module);
                if (module.init) {
                    yield module.init();
                }
                return module;
            }
            finally {
                this.loadingPromises.delete(moduleId);
            }
        });
    }
    doLoadModule(moduleId, modulePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const module = yield Promise.resolve(`${modulePath}`).then(s => __importStar(require(s)));
                if (!module.moduleDefinition) {
                    throw new Error(`Module ${moduleId} does not export moduleDefinition`);
                }
                const definition = module.moduleDefinition;
                if (definition.id !== moduleId) {
                    throw new Error(`Module ID mismatch: expected ${moduleId}, got ${definition.id}`);
                }
                return definition;
            }
            catch (error) {
                throw new Error(`Failed to load module ${moduleId} from ${modulePath}: ${error}`);
            }
        });
    }
    getModule(moduleId) {
        return this.loadedModules.get(moduleId);
    }
    isLoaded(moduleId) {
        return this.loadedModules.has(moduleId);
    }
    unloadModule(moduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const module = this.loadedModules.get(moduleId);
            if (module) {
                if (module.destroy) {
                    yield module.destroy();
                }
                this.loadedModules.delete(moduleId);
            }
        });
    }
}
exports.ModuleLoader = ModuleLoader;
exports.moduleLoader = new ModuleLoader();
//# sourceMappingURL=module-loader.js.map