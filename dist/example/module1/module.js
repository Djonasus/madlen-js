import { ComponentPool } from "../../libs/component";
import { DIPool } from "../../libs/di";
const moduleDIPool = new DIPool();
const moduleComponentPool = new ComponentPool();
export const module1 = {
    id: "module1",
    version: "1.0.0",
    diPool: moduleDIPool,
    componentPool: moduleComponentPool,
    async init() {
        console.log("Module 1 initialized");
    },
};
//# sourceMappingURL=module.js.map