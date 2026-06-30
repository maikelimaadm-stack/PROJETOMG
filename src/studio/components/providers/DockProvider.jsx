import { createStudioProvider } from "./createStudioProvider.jsx";

const { Provider, useProvider } = createStudioProvider("useDockProvider");

export const DockProvider = Provider;
export const useDockProvider = useProvider;
export default DockProvider;
