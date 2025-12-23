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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./libs/di"), exports);
__exportStar(require("./libs/component"), exports);
__exportStar(require("./libs/http"), exports);
__exportStar(require("./libs/module-loader"), exports);
__exportStar(require("./libs/composer"), exports);
__exportStar(require("./libs/bootstrap"), exports);
// TEST EXAMPLE
// const layout = {
//   type: "app-button",
//   version: "2.0.0",
//   moduleId: "module1",
//   props: {
//     id: "my-button",
//   },
//   styles: {
//     backgroundColor: "#007bff",
//     color: "white",
//   },
// };
// const element = async () => await composer.compose(layout);
// console.log(async () => await element());
//# sourceMappingURL=index.js.map