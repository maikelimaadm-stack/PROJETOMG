/** Public contracts for Universal Studio Components — Program 2.1A.5 */

export const UNIVERSAL_COMPONENTS_VERSION = "mak-universal-components-v1";

/**
 * @typedef {object} ExplorerTreeNode
 * @property {string} entryId
 * @property {string} entryType
 * @property {string} label
 * @property {ExplorerTreeNode[]} [children]
 */

/**
 * @typedef {object} ExplorerProviderContract
 * @property {ExplorerTreeNode[]} tree
 * @property {string|null} selectedId
 * @property {(node: ExplorerTreeNode) => void} onSelect
 * @property {string} [footerLabel]
 * @property {import("react").ReactNode} [emptyState]
 */

/**
 * @typedef {object} InspectorField
 * @property {string} label
 * @property {import("react").ReactNode} value
 */

/**
 * @typedef {object} InspectorProviderContract
 * @property {import("react").ReactNode} [emptyState]
 * @property {InspectorField[]} [fields]
 */

/**
 * @typedef {object} PropertyField
 * @property {string} propertyId
 * @property {string} label
 * @property {"string"|"number"|"boolean"} type
 * @property {unknown} value
 * @property {string} group
 */

/**
 * @typedef {object} PropertyProviderContract
 * @property {boolean} hasSelection
 * @property {PropertyField[]} fields
 * @property {(propertyId: string, nextValue: unknown) => void} onFieldChange
 * @property {import("react").ReactNode} [emptyState]
 * @property {string} [title]
 */

/**
 * @typedef {object} WorkspaceProviderContract
 * @property {string} [title]
 * @property {string} [subtitle]
 * @property {import("react").ReactNode} [children]
 * @property {import("react").ReactNode} [placeholder]
 * @property {import("react").ReactNode} [emptyState]
 */

/**
 * @typedef {object} DockTab
 * @property {string} id
 * @property {string} label
 */

/**
 * @typedef {object} DockPanelSlot
 * @property {DockTab[]} tabs
 * @property {string} activeTab
 * @property {(tabId: string) => void} onTabChange
 * @property {(tabId: string) => import("react").ReactNode} renderContent
 */

/**
 * @typedef {object} DockProviderContract
 * @property {{ left: boolean, right: boolean, bottom: boolean }} visibility
 * @property {DockPanelSlot} [left]
 * @property {DockPanelSlot} [right]
 * @property {DockPanelSlot} [bottom]
 * @property {() => import("react").ReactNode} renderCenter
 */

/**
 * @typedef {object} TabsProviderContract
 * @property {DockTab[]} tabs
 * @property {string} activeTab
 * @property {(tabId: string) => void} onTabChange
 */

/**
 * @typedef {object} StatusBarItem
 * @property {string} id
 * @property {import("react").ReactNode} content
 */

/**
 * @typedef {object} StatusBarProviderContract
 * @property {StatusBarItem[]} leftItems
 * @property {StatusBarItem[]} rightItems
 */

/**
 * @typedef {object} NotificationItem
 * @property {string} id
 * @property {string} severity
 * @property {string} message
 * @property {string} [timestamp]
 */

/**
 * @typedef {object} NotificationProviderContract
 * @property {NotificationItem[]} notifications
 * @property {import("react").ReactNode} [emptyState]
 */

/**
 * @typedef {object} BreadcrumbProviderContract
 * @property {string[]} segments
 */

/**
 * @typedef {object} CommandItem
 * @property {string} id
 * @property {string} label
 * @property {string} [category]
 */

/**
 * @typedef {object} CommandGroup
 * @property {string} heading
 * @property {CommandItem[]} items
 * @property {(item: CommandItem) => void} onSelect
 */

/**
 * @typedef {object} CommandPaletteProviderContract
 * @property {boolean} open
 * @property {(open: boolean) => void} onOpenChange
 * @property {CommandItem[]} commands
 * @property {(commandId: string) => void} onRunCommand
 * @property {CommandGroup[]} [extraGroups]
 * @property {string} [placeholder]
 */

export function validateProviderContract(contract, requiredKeys) {
  const errors = [];
  if (!contract || typeof contract !== "object") {
    return { valid: false, errors: ["Provider contract must be an object."] };
  }
  requiredKeys.forEach((key) => {
    if (contract[key] === undefined) errors.push(`Missing required key: ${key}`);
  });
  return { valid: errors.length === 0, errors };
}
