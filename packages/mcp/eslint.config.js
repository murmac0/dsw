import globals from "globals";
import { baseConfig } from "@dsw/eslint-config";

export default [...baseConfig, { languageOptions: { globals: globals.node } }];
