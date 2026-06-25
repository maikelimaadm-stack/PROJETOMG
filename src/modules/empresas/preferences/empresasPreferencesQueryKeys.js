export const USER_PREFERENCES_BOOTSTRAP_PREFIX = "user-screen-preferences";

export const empresasPreferencesBootstrapQueryKey = (clienteId, userId) => [
  USER_PREFERENCES_BOOTSTRAP_PREFIX,
  clienteId,
  userId,
  "bootstrap",
];
