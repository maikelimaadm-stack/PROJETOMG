import { createStudioProvider } from "./createStudioProvider.jsx";

const { Provider, useProvider } = createStudioProvider("useExplorerProvider");

export const ExplorerProvider = Provider;
export const useExplorerProvider = useProvider;
export default ExplorerProvider;
