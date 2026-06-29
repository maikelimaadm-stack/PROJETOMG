import { useEffect, useState } from "react";
import { cn } from "@/shared/utils/utils";
import { useStudioShell } from "../shell/StudioShellProvider.jsx";
import { flattenExplorerTree } from "../mock/studioMockData.js";

function TreeNode({ node, depth, selectedId, onSelect }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;
  const isSelected = selectedId === node.entryId;

  return (
    <div>
      <button
        type="button"
        className={cn("studio-shell__tree-row flex w-full items-center gap-1 text-left", isSelected && "studio-shell__tree-row--selected")}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          onSelect(node);
          if (hasChildren) setOpen((v) => !v);
        }}
      >
        {hasChildren && (
          <span className="w-3 text-[10px] text-muted-foreground">{open ? "▼" : "▶"}</span>
        )}
        {!hasChildren && <span className="w-3" />}
        <span className="truncate">{node.label}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{node.entryType}</span>
      </button>
      {open &&
        hasChildren &&
        node.children.map((child) => (
          <TreeNode
            key={child.entryId}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

export function ExplorerPanel() {
  const { explorerTree, publishSelection, sdk } = useStudioShell();
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    return sdk.selection.subscribe((sel) => setSelectedId(sel.entryId));
  }, [sdk.selection]);

  const flat = flattenExplorerTree(explorerTree);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-2 py-1.5 text-[10px] text-muted-foreground">
        {flat.length} entradas (mock)
      </div>
      <div className="flex-1 overflow-auto p-1">
        {explorerTree.map((node) => (
          <TreeNode
            key={node.entryId}
            node={node}
            depth={0}
            selectedId={selectedId}
            onSelect={publishSelection}
          />
        ))}
      </div>
    </div>
  );
}

export default ExplorerPanel;
