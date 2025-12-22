import { component } from "../../../libs/component";
import { module1 } from "../module";

@component({
  selector: "app-button",
  templateUrl: "./button.html",
  styleUrl: "./button.css",
  version: "1.0.0",
  module: module1,
})
export class ButtonComponent {}
