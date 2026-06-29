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
import { useStudioShell } from "./StudioShellProvider.jsx";

export function StudioCommandPalette() {
  const { commandOpen, setCommandOpen, sdk } = useStudioShell();

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandOpen]);

  const commands = sdk.command.list();

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Buscar comandos, entradas, navegação…" />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>
        {["Navigation", "View", "Edit"].map((category) => {
          const items = commands.filter((c) => c.category === category);
          if (!items.length) return null;
          return (
            <CommandGroup key={category} heading={category}>
              {items.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => {
                    sdk.command.run(cmd.id);
                    setCommandOpen(false);
                  }}
                >
                  {cmd.label}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
        <CommandSeparator />
        <CommandGroup heading="Entradas (mock)">
          <CommandItem onSelect={() => setCommandOpen(false)}>layout-main — Layout Principal</CommandItem>
          <CommandItem onSelect={() => setCommandOpen(false)}>panel-form — Formulário</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export default StudioCommandPalette;
