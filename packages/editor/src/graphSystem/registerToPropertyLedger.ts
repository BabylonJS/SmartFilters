import { PropertyLedger } from "@babylonjs/shared-ui-components/nodeGraphSystem/propertyLedger.js";
import { GenericPropertyComponent } from "./properties/genericNodePropertyComponent.js";
import { InputPropertyTabComponent } from "./properties/inputNodePropertyComponent.js";
// import { TexturePropertyTabComponent } from "./properties/texturePropertyTabComponent";

export const RegisterToPropertyTabManagers = () => {
    PropertyLedger.DefaultControl = GenericPropertyComponent;
    PropertyLedger.RegisteredControls["InputBlock"] = InputPropertyTabComponent;
    // PropertyLedger.RegisteredControls["TextureBlock"] = TexturePropertyTabComponent;
};
