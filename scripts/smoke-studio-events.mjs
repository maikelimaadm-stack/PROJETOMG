#!/usr/bin/env node
/**
 * Smoke test — MAK Studio Event Architecture (Program 2.0.7)
 */
import { bootstrapStudioRegistries } from "../src/studio/registry/bootstrapStudioRegistries.js";
import { bootstrapDesignSystem } from "../src/studio/designSystem/bootstrapDesignSystem.js";
import {
  bootstrapStudioEvents,
  getStudioEventHub,
  getStudioEventsSnapshot,
} from "../src/studio/events/bootstrapStudioEvents.js";
import { getBusEvent, listBusEvents, validateBusEventIntegrity } from "../src/studio/events/registry/eventBusRegistry.js";
import { createPluginEventBridge } from "../src/studio/events/integration/pluginEventIntegration.js";
import { createDesignerEventBridge } from "../src/studio/events/integration/designerEventIntegration.js";
import { createHistoryApi } from "../src/studio/sdk/contracts/historyApi.js";
import { wireHistoryToEventHub } from "../src/studio/events/integration/historyEventIntegration.js";
import { createStudioEventHub } from "../src/studio/events/hub/studioEventHub.js";
import { registerBusEvent } from "../src/studio/events/registry/eventBusRegistry.js";

const run = () => {
  bootstrapStudioRegistries();
  bootstrapDesignSystem();
  const snapshot = bootstrapStudioEvents();

  if (!snapshot.bootstrapped) throw new Error("Event Architecture failed to bootstrap.");
  if (snapshot.counts.officialEvents < 17) throw new Error("Official event catalog under-populated.");
  if (!snapshot.hubReady) throw new Error("Event Hub not initialized.");

  const hub = getStudioEventHub();
  const selectionEvent = getBusEvent("selection.changed");
  if (!selectionEvent || selectionEvent.category !== "workspace") {
    throw new Error("Event Registry invalid.");
  }

  const integrity = validateBusEventIntegrity("layout.changed");
  if (!integrity.valid) throw new Error(`Event manifest invalid: ${integrity.errors.join(" ")}`);

  let received = false;
  const subId = hub.subscribe("selection.changed", (envelope) => {
    if (envelope.payload.entryId === "entry-1") received = true;
  });

  hub.publish("selection.changed", {
    selectionId: "sel-1",
    entryId: "entry-1",
    entryType: "layout",
    source: "explorer",
  });

  if (!received) throw new Error("Event Hub subscribe/publish failed.");
  hub.unsubscribe(subId);

  let onceCount = 0;
  hub.once("dock.changed", () => {
    onceCount += 1;
  });
  hub.publish("dock.changed", { panelId: "explorer", zone: "left", visible: true, source: "dock" });
  hub.publish("dock.changed", { panelId: "explorer", zone: "left", visible: false, source: "dock" });
  if (onceCount !== 1) throw new Error("Event Hub once() failed.");

  hub.broadcast("workspace", "workspace.changed", {
    workspaceId: "ws-1",
    moduleId: "empresas",
    source: "shell",
  });

  const pluginBridge = createPluginEventBridge(hub, { pluginId: "test-panel", designerId: "layout" });
  pluginBridge.registerExtensionEvent("plugin.test-panel.custom", {
    name: "PluginCustom",
    category: "plugin",
    description: "Test plugin extension event.",
    payload: { value: "string" },
    origin: "plugin:test-panel",
    consumers: ["shell"],
    priority: "low",
    version: "1.0.0",
  });

  const designerBridge = createDesignerEventBridge(hub, { designerId: "layout" });
  if (!designerBridge.isOfficialDesigner) throw new Error("Layout designer must be official.");

  const historyApi = createHistoryApi();
  wireHistoryToEventHub(hub, historyApi);

  const isolatedHub = createStudioEventHub({ strictPayload: true });
  listBusEvents().forEach((def) => registerBusEvent(def.eventId, def, { official: false }));
  if (!isolatedHub.getScope) throw new Error("Isolated hub missing scope API.");

  console.log("[smoke-studio-events] OK —", JSON.stringify(getStudioEventsSnapshot().counts));
};

try {
  run();
} catch (error) {
  console.error("[smoke-studio-events] FATAL:", error.message);
  process.exit(1);
}
