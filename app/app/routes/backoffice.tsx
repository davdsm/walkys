import { redirect, Outlet, Link, useLocation, Form, useLoaderData } from "react-router";
import type { Route } from "./+types/backoffice";
import { createPocketBase, createPocketBaseAsAdmin } from "~/lib/pocketbase";
import {
  LayoutDashboard,
  FileText,
  Package,
  FolderOpen,
  Layers,
  Languages,
  LogOut,
  ExternalLink,
  MessageSquare,
  Menu,
  X,
  Layout,
  Users,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { NotificationBell, type NotificationItem } from "~/components/Backoffice/NotificationBell";
import { getAdminNotifications, markNotificationsAsRead, type NotificationRecord } from "~/lib/services";

export async function action({ request }: Route.ActionArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return null;
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return null;

  const formData = await request.formData();
  if (formData.get("intent") !== "markRead") return null;
  const ids = formData.getAll("ids").filter((v): v is string => typeof v === "string" && v.length > 0);
  if (ids.length === 0) return null;

  try {
    const adminPb = await createPocketBaseAsAdmin();
    const client = adminPb ?? pb;
    await markNotificationsAsRead(client, ids);
    return null;
  } catch {
    return null;
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) {
    return redirect("/auth/login");
  }
  const user = pb.authStore.model as { admin?: boolean; email?: string } | null;
  if (!user?.admin) {
    return redirect("/dashboard");
  }
  let notifications: NotificationRecord[] = [];
  try {
    const adminPb = await createPocketBaseAsAdmin();
    const client = adminPb ?? pb;
    notifications = await getAdminNotifications(client);
  } catch {
    notifications = [];
  }
  return { user, notifications };
}

export function meta() {
  return [{ title: "Walkys – Backoffice" }];
}

const navItems = [
  { to: "/backoffice", label: "Início", icon: LayoutDashboard, end: true },
  { to: "/backoffice/pages/Homepage", label: "Página inicial", icon: FileText, end: false },
  { to: "/backoffice/pages/AboutPage", label: "Sobre", icon: FileText, end: false },
  { to: "/backoffice/layout", label: "Layout", icon: Layout, end: false },
  { to: "/backoffice/products", label: "Produtos", icon: Package, end: false },
  { to: "/backoffice/categories", label: "Categorias", icon: FolderOpen, end: false },
  { to: "/backoffice/collections", label: "Coleções", icon: Layers, end: false },
  { to: "/backoffice/contact-replies", label: "Mensagens", icon: MessageSquare, end: false },
  { to: "/backoffice/orders", label: "Pedidos", icon: ClipboardList, end: false },
  { to: "/backoffice/users", label: "Utilizadores", icon: Users, end: false },
  { to: "/backoffice/translations", label: "Traduções", icon: Languages, end: false },
];

function SidebarNav({
  location,
  onNavClick,
}: {
  location: ReturnType<typeof useLocation>;
  onNavClick?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2" aria-label="Secções do backoffice">
      {navItems.map(({ to, label, icon: Icon, end }) => {
        const isActive = end ? location.pathname === to : location.pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
              isActive
                ? "bg-slate-200 text-slate-900 border-l-0"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="w-5 h-5 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function BackofficeLayout() {
  const location = useLocation();
  const { user, notifications } = useLoaderData<typeof loader>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNotifications: NotificationItem[] = (notifications ?? []).map(
    (n: NotificationRecord) => {
      let title = "";
      let message = "";
      let href: string | undefined;

      const payload = n.payload as Record<string, string> | undefined;

      switch (n.type) {
        case "order_new":
          title = "Novo pedido";
          message = "Foi registado um novo pedido.";
          href = payload?.orderId
            ? `/backoffice/orders/${payload.orderId}`
            : "/backoffice/orders";
          break;
        case "message_new":
          title = "Nova mensagem";
          message = "Recebeu uma nova mensagem de contacto.";
          href = payload?.messageId
            ? `/backoffice/contact-replies/${payload.messageId}`
            : "/backoffice/contact-replies";
          break;
        case "user_registered":
          title = "Novo utilizador";
          message = "Um novo utilizador registou-se.";
          href = payload?.userId
            ? `/backoffice/users/${payload.userId}`
            : "/backoffice/users";
          break;
        default:
          title = "Notificação";
          message =
            typeof n.payload === "string"
              ? n.payload
              : "";
      }

      return {
        id: n.id,
        title,
        message,
        read: n.read,
        created: n.created,
        href,
      };
    }
  );

  return (
    <div
      className="min-h-screen bg-slate-100 flex"
      role="application"
      aria-label="Backoffice"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-slate-800 focus:text-white focus:rounded-sm focus:shadow-lg"
      >
        Saltar para o conteúdo principal
      </a>

      {/* Sidebar - desktop: always visible; mobile: overlay when open */}
      <aside
        id="backoffice-sidebar"
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 shadow-sm
          flex flex-col
          transform transition-transform duration-200 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        aria-label="Menu lateral"
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 shrink-0">
          <Link
            to="/backoffice"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded-sm"
            aria-label="Walkys Backoffice início"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-sm bg-slate-800 text-white">
              <span className="font-bold text-lg leading-none">W</span>
            </span>
            <span className="font-bold text-xl text-slate-800 tracking-tight">Walkys</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav location={location} onNavClick={() => setSidebarOpen(false)} />
        </div>

        {/* Bottom: Ver site + user + logout */}
        <div className="border-t border-slate-200/80 p-3 space-y-1 shrink-0">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <ExternalLink className="w-5 h-5 shrink-0" aria-hidden />
            Ver site
          </Link>
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-sm text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
              aria-expanded="false"
              aria-haspopup="true"
              aria-label="Menu da conta"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-semibold text-sm shrink-0">
                {(user as any)?.email?.[0]?.toUpperCase() ?? "A"}
              </span>
              <span className="truncate">{(user as any)?.email ?? "Conta"}</span>
            </button>
            <div className="absolute left-0 bottom-full mb-1 w-full py-1 bg-white rounded-sm shadow-lg border border-slate-200 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible focus-within:opacity-100 focus-within:visible transition-all z-50">
              <Form action="/logout" method="post" className="block">
                <button
                  type="submit"
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-sm mx-0 text-left"
                  aria-label="Terminar sessão"
                >
                  <LogOut className="w-4 h-4 shrink-0" aria-hidden />
                  Terminar sessão
                </button>
              </Form>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay when sidebar open */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          aria-label="Fechar menu"
        />
      )}

      {/* Main content + top bar (mobile: menu button; desktop: optional search/user) */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Top bar - only for mobile menu + optional search on desktop */}
        <header className="sticky top-0 z-20 flex items-center h-14 px-4 gap-3 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shrink-0 md:h-12">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-sm text-slate-600 hover:bg-slate-100 focus:ring-2 focus:ring-slate-500/50"
            aria-label="Abrir menu"
            aria-expanded={sidebarOpen}
          >
            <Menu className="w-6 h-6" aria-hidden />
          </button>
          <span className="md:sr-only font-semibold text-slate-800">Backoffice</span>
          <div className="ml-auto flex items-center gap-2 relative">
            <NotificationBell items={adminNotifications} markReadAction="/backoffice" />
          </div>
        </header>

        <main
          id="main-content"
          className="flex-1 px-4 sm:px-6 py-6 md:py-8 overflow-auto focus:outline-none max-w-[1400px] w-full mx-auto"
          tabIndex={-1}
          role="main"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
