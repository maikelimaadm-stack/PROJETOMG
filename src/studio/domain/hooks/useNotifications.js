import { useStudioDomain } from "../providers/StudioDomainProvider.jsx";

export function useNotifications() {
  const { state, actions } = useStudioDomain();
  return {
    notifications: state.notifications,
    add: actions.notifications.add,
    clear: actions.notifications.clear,
  };
}

export default useNotifications;
