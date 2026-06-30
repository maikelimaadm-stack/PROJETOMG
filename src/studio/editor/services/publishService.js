/** Publish Service — publish center integration (Program 2.2.7) */

export function createPublishService(deps = {}) {
  const { sdk, hub } = deps;

  const publish = async (payload = {}) => {
    const result = await sdk?.publish?.({ ...payload });
    hub?.publish?.("editor.publish.completed", { ok: true, result });
    return result;
  };

  const validate = async () => sdk?.validatePublish?.() ?? { ok: true };

  return Object.freeze({ publish, validate });
}

export default createPublishService;
