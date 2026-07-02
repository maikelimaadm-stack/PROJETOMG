import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [
  {
    files: ["src/**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: globals.browser },
    ...pluginJs.configs.recommended,
  },
  {
    files: ["src/runtime/**/*.{js,mjs}"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["src/**/*.{js,mjs,cjs,jsx}"],
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
    },
    rules: {
      "no-unused-vars": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": [
        "error",
        { ignore: ["cmdk-input-wrapper", "toast-close"] },
      ],
      "react-hooks/rules-of-hooks": "error",
    },
  },
];
