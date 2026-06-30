import { createStudioProvider } from "./createStudioProvider.jsx";

const { Provider, useProvider } = createStudioProvider("useInspectorProvider");

export const InspectorProvider = Provider;
export const useInspectorProvider = useProvider;
export default InspectorProvider;
