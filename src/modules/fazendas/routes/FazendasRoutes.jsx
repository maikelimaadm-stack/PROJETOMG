import React from "react";
import { Route } from "react-router-dom";
import PAGFazendas from "../pages/PAGFazendas";

export const FazendasRoutes = () => (
  <>
    <Route path="/Fazendas" element={<PAGFazendas />} />
  </>
);

