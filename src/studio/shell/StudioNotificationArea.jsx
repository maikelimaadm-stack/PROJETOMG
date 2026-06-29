import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { Bell } from "lucide-react";
import { useStudioShell } from "./StudioShellProvider.jsx";

export function StudioNotificationArea() {
  const { notifications } = useStudioShell();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-3 py-2 text-xs font-semibold uppercase tracking-wide">
          Notificações
        </div>
        <ul className="max-h-64 overflow-auto">
          {notifications.map((n) => (
            <li key={n.id} className="border-b px-3 py-2 text-xs last:border-0">
              <span className="font-medium capitalize text-foreground">{n.severity}</span>
              <p className="mt-0.5 text-muted-foreground">{n.message}</p>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export default StudioNotificationArea;
