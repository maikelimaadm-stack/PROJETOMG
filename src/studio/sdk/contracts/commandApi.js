/**
 * Command API — command palette registry contract.
 */
export function createCommandApi() {
  const commands = new Map();

  return Object.freeze({
    register: (command) => {
      if (!command?.id || typeof command.run !== "function") {
        throw new Error("Command requires id and run().");
      }
      commands.set(command.id, Object.freeze({ ...command }));
      return command.id;
    },
    unregister: (commandId) => commands.delete(commandId),
    get: (commandId) => commands.get(commandId) ?? null,
    list: (query = "") => {
      const normalized = query.trim().toLowerCase();
      const all = [...commands.values()];
      if (!normalized) return all;
      return all.filter(
        (cmd) =>
          cmd.id.toLowerCase().includes(normalized) ||
          (cmd.label ?? "").toLowerCase().includes(normalized) ||
          (cmd.category ?? "").toLowerCase().includes(normalized)
      );
    },
    run: async (commandId, context = {}) => {
      const command = commands.get(commandId);
      if (!command) throw new Error(`Command not found: ${commandId}`);
      return command.run(context);
    },
  });
}

export default createCommandApi;
