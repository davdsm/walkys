import { Link, useLoaderData, useFetcher } from "react-router";
import {
  FileText,
  Package,
  FolderOpen,
  Layers,
  Languages,
  ArrowRight,
  Edit3,
  Globe,
  MessageSquare,
  Ruler,
} from "lucide-react";
import type { Route } from "./+types/backoffice.index";
import { createPocketBase } from "~/lib/pocketbase";

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  let productsCount = 0;
  let categoriesCount = 0;
  let collectionsCount = 0;
  let contactRepliesCount = 0;
  try {
    const [productsRes, categoriesRes, collectionsRes, contactRes] = await Promise.all([
      pb.collection("products").getList(1, 1, { filter: "enabled=true" }).catch(() => ({ totalItems: 0 })),
      pb.collection("category").getList(1, 1, { filter: "enable=true" }).catch(() => ({ totalItems: 0 })),
      pb.collection("collection").getList(1, 1).catch(() => ({ totalItems: 0 })),
      pb.collection("ContactFormReplies").getList(1, 1).catch(() => ({ totalItems: 0 })),
    ]);
    productsCount = productsRes.totalItems ?? 0;
    categoriesCount = categoriesRes.totalItems ?? 0;
    collectionsCount = collectionsRes.totalItems ?? 0;
    contactRepliesCount = contactRes.totalItems ?? 0;
  } catch {
    // ignore
  }
  return { productsCount, categoriesCount, collectionsCount, contactRepliesCount };
}

export function meta() {
  return [{ title: "Painel – Walkys Backoffice" }];
}

const sections = [
  { to: "/backoffice/pages/Homepage", label: "Conteúdo da página inicial", icon: FileText, desc: "Hero, slider, secções" },
  { to: "/backoffice/pages/AboutPage", label: "Página Sobre", icon: FileText, desc: "Intro, galeria, passos" },
  { to: "/backoffice/products", label: "Produtos", icon: Package, desc: "Nomes, descrições (PT / EN)" },
  { to: "/backoffice/categories", label: "Categorias", icon: FolderOpen, desc: "Nomes, slugs, imagem (PT / EN)" },
  { to: "/backoffice/collections", label: "Coleções", icon: Layers, desc: "Nomes, slugs, imagem (PT / EN)" },
  { to: "/backoffice/contact-replies", label: "Mensagens de contacto", icon: MessageSquare, desc: "Formulário de contacto" },
  { to: "/backoffice/translations", label: "Traduções", icon: Languages, desc: "Textos da interface (PT / EN)" },
];

export default function BackofficeIndex() {
  const { productsCount, categoriesCount, collectionsCount, contactRepliesCount } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ seedSizes?: boolean; created?: number }>();
  const actionData = fetcher.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Painel</h1>
        <p className="text-slate-600 mt-1">Edite o conteúdo do site em português e inglês.</p>
      </div>

      {/* Two-column layout like TWISTY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - wider (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content overview card - like Income Tracker */}
          <section
            className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8"
            aria-labelledby="overview-title"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-11 h-11 rounded-sm bg-slate-200 text-slate-800">
                  <Edit3 className="w-5 h-5" aria-hidden />
                </span>
                <div>
                  <h2 id="overview-title" className="text-lg font-bold text-slate-900">
                    Resumo do conteúdo
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Itens ativos no site (editáveis em PT e EN).
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-sm bg-slate-50/80 p-4 border border-slate-100">
                <p className="text-2xl font-bold text-slate-900">{productsCount}</p>
                <p className="text-sm text-slate-500 mt-0.5">Produtos</p>
                <Link
                  to="/backoffice/products"
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-800 hover:text-slate-600 mt-2"
                >
                  Editar <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Link>
              </div>
              <div className="rounded-sm bg-slate-50/80 p-4 border border-slate-100">
                <p className="text-2xl font-bold text-slate-900">{categoriesCount}</p>
                <p className="text-sm text-slate-500 mt-0.5">Categorias</p>
                <Link
                  to="/backoffice/categories"
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-800 hover:text-slate-600 mt-2"
                >
                  Editar <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Link>
              </div>
              <div className="rounded-sm bg-slate-50/80 p-4 border border-slate-100">
                <p className="text-2xl font-bold text-slate-900">{collectionsCount}</p>
                <p className="text-sm text-slate-500 mt-0.5">Coleções</p>
                <Link
                  to="/backoffice/collections"
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-800 hover:text-slate-600 mt-2"
                >
                  Editar <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Link>
              </div>
              <div className="rounded-sm bg-slate-50/80 p-4 border border-slate-100">
                <p className="text-2xl font-bold text-slate-900">{contactRepliesCount}</p>
                <p className="text-sm text-slate-500 mt-0.5">Mensagens</p>
                <Link
                  to="/backoffice/contact-replies"
                  className="inline-flex items-center gap-1 text-sm font-medium text-slate-800 hover:text-slate-600 mt-2"
                >
                  Ver <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </section>

          {/* Quick edit - like Let's Connect */}
          <section
            className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8"
            aria-labelledby="quick-edit-title"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 id="quick-edit-title" className="text-lg font-bold text-slate-900">
                Edição rápida
              </h2>
              <Link
                to="/backoffice/products"
                className="text-sm font-medium text-slate-800 hover:text-slate-600"
              >
                Ver tudo
              </Link>
            </div>
            <ul className="space-y-3" role="list">
              {sections.map(({ to, label, icon: Icon, desc }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-4 p-4 rounded-sm border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-transparent group"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-sm bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-800 shrink-0">
                      <Icon className="w-5 h-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{label}</p>
                      <p className="text-sm text-slate-500 truncate">{desc}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right column - narrower (1/3) */}
        <div className="space-y-6">
          {/* Recent / Quick links card - like Your Recent Projects */}
          <section
            className="bg-white rounded-sm border border-slate-200 shadow-sm p-6"
            aria-labelledby="sections-title"
          >
            <h2 id="sections-title" className="text-lg font-bold text-slate-900 mb-4">
              Secções de conteúdo
            </h2>
            <nav aria-label="Atalhos das secções">
              <ul className="space-y-2" role="list">
                {sections.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:ring-2 focus:ring-slate-500/50"
                    >
                      <Icon className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </section>

          {/* Shoe sizes card - seed sizes 35 to 47 */}
          <section
            className="bg-white rounded-sm border border-slate-200 shadow-sm p-6"
            aria-labelledby="sizes-title"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-sm bg-slate-200 text-slate-800 mb-4">
              <Ruler className="w-5 h-5" aria-hidden />
            </span>
            <h2 id="sizes-title" className="text-lg font-bold text-slate-900">
              Tamanhos de calçado
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Crie os tamanhos de produto (35 a 47) na base de dados. Só são criados os que faltam.
            </p>
            <fetcher.Form method="post" className="mt-4">
              <input type="hidden" name="intent" value="seedSizes" />
              <button
                type="submit"
                disabled={fetcher.state !== "idle"}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {fetcher.state !== "idle" ? "A criar…" : "Criar tamanhos 35–47"}
              </button>
            </fetcher.Form>
            {actionData?.seedSizes === true && (
              <p className="mt-3 text-sm text-slate-600">
                {actionData.created === 0
                  ? "Todos os tamanhos 35–47 já existem."
                  : `${actionData.created} tamanho(s) criado(s).`}
              </p>
            )}
          </section>

          {/* CTA / Tips card - like Unlock Premium */}
          <section
            className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 relative overflow-hidden"
            aria-labelledby="tips-title"
          >
            <div className="absolute inset-0 opacity-[0.03]" aria-hidden>
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                  backgroundSize: "20px 20px",
                }}
              />
            </div>
            <div className="relative">
              <span className="flex items-center justify-center w-10 h-10 rounded-sm bg-slate-200 text-slate-800 mb-4">
                <Globe className="w-5 h-5" aria-hidden />
              </span>
              <h2 id="tips-title" className="text-lg font-bold text-slate-900">
                Conteúdo bilingue
              </h2>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                Todas as secções suportam português (PT) e inglês (EN). As alterações aplicam-se ao site em direto.
              </p>
              <Link
                to="/backoffice/pages/Homepage"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-sm bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
              >
                Editar página inicial <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
