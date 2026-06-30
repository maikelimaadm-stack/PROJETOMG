import { createStudioProvider } from "./createStudioProvider.jsx";

const { Provider, useProvider } = createStudioProvider("useStatusBarProvider");

export const StatusBarProvider = Provider;
export const useStatusBarProvider = useProvider;
export default StatusBarProvider;
