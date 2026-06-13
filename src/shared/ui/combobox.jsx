import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { Button } from "@/shared/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/shared/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover"

export function Combobox({ options = [], value, onValueChange, placeholder = "Selecione...", searchPlaceholder = "Buscar...", className }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="erp-menu-panel p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command className="erp-menu-panel-inner">
          <CommandInput placeholder={searchPlaceholder} className="erp-menu-search-input h-7" />
          <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto erp-scroll-compact-y">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => {
                  onValueChange(option.value)
                  setOpen(false)
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}