import globals from "globals";
import pluginJs from "@eslint/js";

// 缩进2行
export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  {
    rules: {
      "indent": ["error", 2],
    }}

];