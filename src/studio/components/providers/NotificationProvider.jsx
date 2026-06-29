import { createStudioProvider } from "./createStudioProvider.jsx";

const { Provider, useProvider } = createStudioProvider("useNotificationProvider");

export const NotificationProvider = Provider;
export const useNotificationProvider = useProvider;
export default NotificationProvider;
