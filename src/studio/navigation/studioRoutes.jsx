import { lazy } from "react";

const StudioPrototypePage = lazy(() => import("../pages/StudioPrototypePage.jsx"));

export const studioRoutes = [
  {
    path: "/studio",
    Component: StudioPrototypePage,
    label: "MAK Studio (Prototype)",
  },
  {
    path: "/studio/prototype",
    Component: StudioPrototypePage,
    label: "MAK Studio Prototype",
  },
];

export default studioRoutes;
