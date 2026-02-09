import { useEffect } from "react";
import { Link, redirect, useLoaderData, useSearchParams } from "react-router";
import type { Route } from "../+types/root";
import { createPocketBase, createPocketBaseAsAdmin } from "~/lib/pocketbase";
import { getOrdersByUser } from "~/lib/services";
import { useCart } from "~/contexts/CartContext";
import { useLanguage } from "~/contexts";
import OrdersPage from "~/components/Backoffice/OrdersPage/OrdersPage";

export async function loader({ request }: Route.LoaderArgs) {
    const pb = createPocketBase(request);
    if (!pb.authStore.isValid) {
        return redirect("/auth/login");
    }
    const user = pb.authStore.model as { id?: string } | null;
    if (!user?.id) return { user: null, orders: [] };

    try {
        const adminPb = await createPocketBaseAsAdmin();
        const client = adminPb ?? pb;
        const orders = await getOrdersByUser(client, user.id);
        return { user, orders };
    } catch {
        return { user, orders: [] };
    }
}

export function meta() {
    return [{ title: "Walkys - Orders" }];
}

export default function Orders() {
    const { orders } = useLoaderData<typeof loader>();
    const [searchParams, setSearchParams] = useSearchParams();
    const { clearCart } = useCart();

    useEffect(() => {
        if (searchParams.get("placed") === "1") {
            clearCart();
        }
    }, [searchParams, clearCart]);

    const showSuccessModal = searchParams.get("placed") === "1";
    const { t } = useLanguage();

    return (
        <div className="w-full min-h-screen bg-white flex flex-col items-center gap-8">
            <OrdersPage orders={orders ?? []} />
            {showSuccessModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="order-success-title"
                >
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center relative">
                        <button
                            type="button"
                            onClick={() => setSearchParams({}, { replace: true })}
                            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                            aria-label="Fechar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-8 h-8 text-green-600"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 id="order-success-title" className="text-xl font-semibold text-slate-900 mb-2">
                            {t.userBackoffice.orderSuccessTitle}
                        </h2>
                        <p className="text-slate-600 mb-6">{t.userBackoffice.orderSuccessMessage}</p>
                        <Link
                            to="/orders"
                            className="inline-block w-full py-3 px-4 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            {t.userBackoffice.goToOrders}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}