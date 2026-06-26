import React, { createContext, useContext } from "react";
import { MakModuleProvider } from "@/framework/mak/runtime/MakModuleContext.jsx";

const ModeloBase1Context = createContext(null);

export function ModeloBase1Provider({ config, children }) {
  if (!config?.makModule) {
    throw new Error("ModeloBase1Provider: config.makModule é obrigatório");
  }
  return (
    <ModeloBase1Context.Provider value={config}>
      <MakModuleProvider module={config.makModule}>{children}</MakModuleProvider>
    </ModeloBase1Context.Provider>
  );
}

export function useModeloBase1Config() {
  const config = useContext(ModeloBase1Context);
  if (!config) {
    throw new Error("useModeloBase1Config deve ser usado dentro de ModeloBase1Provider");
  }
  return config;
}

export default ModeloBase1Context;
