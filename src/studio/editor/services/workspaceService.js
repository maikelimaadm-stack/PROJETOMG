/** Workspace Service — center editor workspace slot (Program 2.2.7) */

export function createWorkspaceService(deps = {}) {
  const { hub } = deps;

  const activate = ({ designerId, moduleId }) => {
    hub?.publish?.("editor.workspace.activate", { designerId, moduleId });
    return Object.freeze({ designerId, moduleId, active: true });
  };

  const configure = ({ title, subtitle, children, placeholder }) =>
    Object.freeze({ title, subtitle, children, placeholder });

  return Object.freeze({ activate, configure });
}

export default createWorkspaceService;
