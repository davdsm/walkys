import { Link } from "react-router";
import { motion } from "framer-motion";
import OrdersCards from "../BackofficeCards/OrdersCards";
import { UserBackofficeLanguageSwitcher } from "~/components/Backoffice/UserBackofficeLanguageSwitcher";
import { useLanguage } from "~/contexts";
import type { OrderRecord, OrderItem, OrderStatus } from "~/lib/services";

function formatOrderLines(items: OrderItem[] | undefined): string[] {
    if (!Array.isArray(items) || items.length === 0) return [];
    return items.map((i) => {
        const name = (i as OrderItem & { product_name?: string }).productName
            ?? (i as OrderItem & { product_name?: string }).product_name
            ?? "";
        const sizePart = i.size != null ? ` (${i.size})` : "";
        return `${i.quantity}x ${name}${sizePart}`.trim() || `${i.quantity}x —`;
    });
}

function orderNumber(order: OrderRecord): string {
    return `#${order.id.slice(0, 8)}`;
}

function getOrderStatusLabel(
    status: OrderStatus | string | undefined,
    t: Record<string, string>
): string | undefined {
    if (!status) return undefined;
    const key = `orderStatus${status.charAt(0).toUpperCase()}${status.slice(1)}` as keyof typeof t;
    return t[key] ?? status;
}

function formatOrderDate(created: string | undefined, locale: string): string {
    if (!created) return "—";
    try {
        return new Date(created).toLocaleDateString(locale === "pt" ? "pt-PT" : "en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return created;
    }
}

interface OrdersPageProps {
    orders: OrderRecord[];
}

export default function OrdersPage({ orders }: OrdersPageProps) {
    const { t, language } = useLanguage();
    return (
        <div className="min-h-screen w-full bg-[#f1f1f1] flex flex-col md:pt-20">
            <motion.main
                className="pr-[45px] pl-[33px] flex flex-col gap-[20px] w-full max-w-[1200px] mx-auto"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <div className="flex flex-wrap items-center justify-between gap-4 pt-[48px] pb-[20px]">
                    <Link
                        className="md:text-[15px] text-lg font-semibold flex items-center gap-[12px]"
                        to="/dashboard"
                    >
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        className="h-[12px] w-[12px]"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                        />
                        </svg>

                        {t.userBackoffice.dashboard}
                    </Link>
                    <UserBackofficeLanguageSwitcher />
                </div>
                <section className="flex flex-wrap gap-6">
                    {orders.length === 0 ? (
                        <p className="text-slate-500 py-8">{t.userBackoffice.noOrdersYet}</p>
                    ) : (
                        orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                className="w-full md:w-[calc(50%-12px)]"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.08 * index, ease: "easeOut" }}
                            >
                                <OrdersCards
                                    title={orderNumber(order)}
                                    date={formatOrderDate(order.created, language)}
                                    info={formatOrderLines(order.items)}
                                    icon="clipboard"
                                    statusLabel={getOrderStatusLabel(order.status, t.userBackoffice as Record<string, string>)}
                                />
                            </motion.div>
                        ))
                    )}
                </section>
            </motion.main>
        </div>
    );
}