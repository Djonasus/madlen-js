"use strict";
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
exports.module1 = void 0;
const component_1 = require("../../libs/component");
const di_1 = require("../../libs/di");
const moduleDIPool = new di_1.DIPool();
const moduleComponentPool = new component_1.ComponentPool();
exports.module1 = {
    id: "module1",
    version: "1.0.0",
    diPool: moduleDIPool,
    componentPool: moduleComponentPool,
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Module 1 initialized");
        });
    },
};
//# sourceMappingURL=module.js.map