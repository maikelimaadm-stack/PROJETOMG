import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/ui/command";
import { useCommandPaletteProvider } from "./providers/CommandPaletteProvider.jsx";

export function UniversalCommandPalette() {
  const { open, onOpenChange, commands, onRunCommand, extraGroups, placeholder } =
    useCommandPaletteProvider();

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange]);

  const categories = [...new Set(commands.map((c) => c.category).filter(Boolean))];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={placeholder ?? "Buscar comandos…"} />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>
        {categories.map((category) => {
          const items = commands.filter((c) => c.category === category);
          if (!items.length) return null;
          return (
            <CommandGroup key={category} heading={category}>
              {items.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => {
                    onRunCommand(cmd.id);
                    onOpenChange(false);
                  }}
                >
                  {cmd.label}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
        {extraGroups?.map((group) => (
          <div key={group.heading}>
            <CommandSeparator />
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    group.onSelect(item);
                    onOpenChange(false);
                  }}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

export default UniversalCommandPalette;
