import { useEffect, useMemo, useState } from "react";
import { Link, useFetcher } from "react-router";
import { Bell } from "lucide-react";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  read?: boolean;
  created?: string;
  /** When set, clicking the notification navigates to this URL */
  href?: string;
};

interface NotificationBellProps {
  items: NotificationItem[];
  /** Action URL to persist read state (e.g. /dashboard or /backoffice) */
  markReadAction?: string;
}

export function NotificationBell({ items, markReadAction }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [localItems, setLocalItems] = useState<NotificationItem[]>(items);
  const fetcher = useFetcher();

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const unreadCount = useMemo(
    () => localItems.filter((n) => !n.read).length,
    [localItems]
  );
  const hasUnread = unreadCount > 0;

  const handleToggle = () => setOpen((v) => !v);

  const persistMarkRead = (ids: string[]) => {
    if (markReadAction && ids.length > 0) {
      const formData = new FormData();
      formData.set("intent", "markRead");
      ids.forEach((id) => formData.append("ids", id));
      fetcher.submit(formData, { method: "post", action: markReadAction });
    }
  };

  const handleReadAll = () => {
    const ids = localItems.map((n) => n.id);
    setLocalItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setOpen(false);
    persistMarkRead(ids);
  };

  const handleItemClick = (item: NotificationItem) => {
    setLocalItems((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setOpen(false);
    persistMarkRead([item.id]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex items-center justify-center w-9 h-9 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5" aria-hidden />
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Notificações
              </h2>
              {hasUnread && (
                <button
                  type="button"
                  onClick={handleReadAll}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {localItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">Sem notificações.</p>
            ) : (
              <ul className="max-h-56 overflow-y-auto space-y-2 text-left">
                {localItems.map((n) => {
                  const content = (
                    <>
                      <p className="font-semibold">{n.title}</p>
                      {n.message && (
                        <p className="mt-0.5">{n.message}</p>
                      )}
                    </>
                  );
                  const baseClass = `block w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
                    n.read
                      ? "bg-slate-50 text-slate-600"
                      : "bg-slate-100 text-slate-800"
                  }`;
                  const interactiveClass = n.href
                    ? "hover:bg-slate-200 cursor-pointer"
                    : "";

                  return (
                    <li key={n.id}>
                      {n.href ? (
                        <Link
                          to={n.href}
                          onClick={() => handleItemClick(n)}
                          className={`${baseClass} ${interactiveClass}`}
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className={baseClass}>{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
        </div>
      )}
    </div>
  );
}

