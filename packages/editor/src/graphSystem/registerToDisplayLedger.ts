import { InputDisplayManager } from "./display/inputDisplayManager.js";
import { OutputDisplayManager } from "./display/outputDisplayManager.js";
import { DisplayLedger } from "@babylonjs/shared-ui-components/nodeGraphSystem/displayLedger.js";

export const RegisterToDisplayManagers = () => {
    DisplayLedger.RegisteredControls["InputBlock"] = InputDisplayManager;
    DisplayLedger.RegisteredControls["OutputBlock"] = OutputDisplayManager;
};
