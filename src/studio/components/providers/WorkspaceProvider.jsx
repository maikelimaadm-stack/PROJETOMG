import { createStudioProvider } from "./createStudioProvider.jsx";

const { Provider, useProvider } = createStudioProvider("useWorkspaceProvider");

export const WorkspaceProvider = Provider;
export const useWorkspaceProvider = useProvider;
export default WorkspaceProvider;
