import { useState } from "react";
import { cn } from "@/shared/utils/utils";
import { useExplorerProvider } from "./providers/ExplorerProvider.jsx";

function TreeNode({ node, depth, selectedId, onSelect }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;
  const isSelected = selectedId === node.entryId;

  return (
    <div>
      <button
        type="button"
        className={cn(
          "studio-shell__tree-row flex w-full items-center gap-1 text-left",
          isSelected && "studio-shell__tree-row--selected"
        )}
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

function countNodes(nodes) {
  return nodes.reduce((acc, node) => acc + 1 + (node.children ? countNodes(node.children) : 0), 0);
}

export function UniversalExplorer() {
  const { tree, selectedId, onSelect, footerLabel, emptyState } = useExplorerProvider();

  if (!tree?.length) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground">
        {emptyState ?? "Nenhuma entrada"}
      </div>
    );
  }

  const entryCount = countNodes(tree);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-2 py-1.5 text-[10px] text-muted-foreground">
        {footerLabel ?? `${entryCount} entradas`}
      </div>
      <div className="flex-1 overflow-auto p-1">
        {tree.map((node) => (
          <TreeNode
            key={node.entryId}
            node={node}
            depth={0}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

export default UniversalExplorer;
