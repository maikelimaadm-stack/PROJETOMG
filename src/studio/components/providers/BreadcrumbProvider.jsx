import { createStudioProvider } from "./createStudioProvider.jsx";

const { Provider, useProvider } = createStudioProvider("useBreadcrumbProvider");

export const BreadcrumbProvider = Provider;
export const useBreadcrumbProvider = useProvider;
export default BreadcrumbProvider;
