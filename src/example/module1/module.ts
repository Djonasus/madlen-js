import { ComponentPool } from "../../libs/component";
import { DIPool } from "../../libs/di";
import { ModuleDefinition } from "../../libs/module-loader";

const moduleDIPool = new DIPool();
const moduleComponentPool = new ComponentPool();

export const module1: ModuleDefinition = {
  id: "module1",
  version: "1.0.0",
  diPool: moduleDIPool,
  componentPool: moduleComponentPool,
  async init() {
    console.log("Module 1 initialized");
  },
};
