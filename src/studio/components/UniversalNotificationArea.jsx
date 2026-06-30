import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { Bell } from "lucide-react";
import { useNotificationProvider } from "./providers/NotificationProvider.jsx";

export function UniversalNotificationArea({ triggerClassName }) {
  const { notifications, emptyState } = useNotificationProvider();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={triggerClassName ?? "h-8 w-8 relative"}>
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-3 py-2 text-xs font-semibold uppercase tracking-wide">
          Notificações
        </div>
        <ul className="max-h-64 overflow-auto">
          {notifications.length === 0 && (
            <li className="px-3 py-4 text-xs text-muted-foreground">
              {emptyState ?? "Nenhuma notificação"}
            </li>
          )}
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

export default UniversalNotificationArea;
