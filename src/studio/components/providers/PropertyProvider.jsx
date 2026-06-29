import { createStudioProvider } from "./createStudioProvider.jsx";

const { Provider, useProvider } = createStudioProvider("usePropertyProvider");

export const PropertyProvider = Provider;
export const usePropertyProvider = useProvider;
export default PropertyProvider;
