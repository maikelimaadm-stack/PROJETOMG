import { createStudioProvider } from "./createStudioProvider.jsx";

const { Provider, useProvider } = createStudioProvider("useCommandPaletteProvider");

export const CommandPaletteProvider = Provider;
export const useCommandPaletteProvider = useProvider;
export default CommandPaletteProvider;
