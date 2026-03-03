import { redirect, useLoaderData, useNavigation, Form, useSearchParams } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/checkout";
import { createPocketBase, createPocketBaseAsAdmin, canAccessUserBackoffice, getUserBlockedStatus } from "~/lib/pocketbase";
import { createUserService, createOrder, createNotification, type OrderItem } from "~/lib/services";
import {
  getAdminEmail,
  getLanguageFromRequest,
  sendEmail,
  buildOrderReceivedUser,
  buildNewOrderAdmin,
} from "~/lib/email";
import { useCart } from "~/contexts/CartContext";
import { useLanguage } from "~/contexts";

const PROFILE_FIELDS = "id,email,name,address,postal_code,nif,city,country";

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) {
    return redirect("/auth/login");
  }
  const user = pb.authStore.model as { id?: string; admin?: boolean } | null;
  if (!user?.id) return redirect("/auth/login");
  if (await getUserBlockedStatus(pb, user)) return redirect("/blocked");
  if (!(await canAccessUserBackoffice(pb, user))) return redirect("/pending-approval");

  try {
    const adminPb = await createPocketBaseAsAdmin();
    const client = adminPb ?? pb;
    const record = await client.collection("users").getOne(user.id, {
      fields: PROFILE_FIELDS,
    });
    return { user: record as Record<string, unknown> };
  } catch {
    return { user: null };
  }
}

export async function action({ request }: Route.ActionArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) {
    return redirect("/auth/login");
  }
  const authUser = pb.authStore.model as { id?: string; admin?: boolean } | null;
  if (!authUser?.id) return redirect("/auth/login");
  if (await getUserBlockedStatus(pb, authUser)) return redirect("/blocked");
  if (!(await canAccessUserBackoffice(pb, authUser))) return redirect("/pending-approval");

  const formData = await request.formData();
  const name = (formData.get("name") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim() ?? "";
  const address = (formData.get("address") as string)?.trim() ?? "";
  const postal_code = (formData.get("postal_code") as string)?.trim() ?? "";
  const nif = (formData.get("nif") as string)?.trim() ?? "";
  const city = (formData.get("city") as string)?.trim() ?? "";
  const country = (formData.get("country") as string)?.trim() ?? "";

  const cartRaw = formData.get("cart") as string | null;
  let items: OrderItem[] = [];
  if (cartRaw) {
    try {
      const parsed = JSON.parse(cartRaw) as Array<{
        productId: string;
        name?: string;
        productName?: string;
        size: string | null;
        quantity: number;
      }>;
      items = parsed.map((p) => ({
        productId: p.productId,
        productName: (p.productName ?? p.name ?? "").trim(),
        size: p.size ?? null,
        quantity: Number(p.quantity) || 1,
      })).filter((p) => p.productId && p.quantity > 0);
    } catch {
      // ignore invalid cart
    }
  }

  if (items.length === 0) {
    return redirect("/checkout?error=empty");
  }

  // Use admin client so user profile update and order create bypass API rules
  const adminPb = await createPocketBaseAsAdmin();
  const client = adminPb ?? pb;

  try {
    const userService = createUserService(client);
    await userService.update(authUser.id, {
      name: name || undefined,
      email: email || undefined,
      address: address || undefined,
      postal_code: postal_code || undefined,
      nif: nif || undefined,
      city: city || undefined,
      country: country || undefined,
    });

    const order = await createOrder(client, authUser.id, items);
    await createNotification(client, {
      type: "order_new",
      user: null,
      payload: { orderId: order.id },
    });

    const lang = getLanguageFromRequest(request);
    const userRecord = await client.collection("users").getOne(authUser.id, { fields: "email,name" }) as { email?: string; name?: string };
    const userEmail = userRecord?.email ?? email;
    const userName = userRecord?.name ?? (name || userEmail || "—");

    const { subject: userSubject, html: userHtml } = buildOrderReceivedUser(lang, order.id, userName);
    await sendEmail(userEmail, userSubject, userHtml);

    const adminTo = getAdminEmail();
    if (adminTo) {
      const { subject: adminSubject, html: adminHtml } = buildNewOrderAdmin(lang, order.id);
      await sendEmail(adminTo, adminSubject, adminHtml);
    }

    return redirect("/orders?placed=1");
  } catch (err) {
    console.error("Checkout error:", err);
    return redirect("/checkout?error=submit");
  }
}

export function meta() {
  return [{ title: "Walkys - Checkout" }];
}

export default function Checkout() {
  const { user } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const { items } = useCart();
  const { t } = useLanguage();
  const checkoutT = (t as Record<string, Record<string, string>>).checkout ?? {};
  const isSubmitting = navigation.state === "submitting";
  const errorParam = searchParams.get("error");

  const orderItems: OrderItem[] = items.map((i) => ({
    productId: i.productId,
    productName: i.name,
    size: i.size,
    quantity: i.quantity,
  }));

  const profile = user as Record<string, unknown> | null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f1f1f1] flex flex-col items-center justify-center p-8">
        <p className="text-slate-600 text-lg mb-4">
          {checkoutT.cartEmpty ?? "Your cart is empty."}
        </p>
        <Link
          to="/"
          className="text-slate-900 font-medium underline hover:no-underline"
        >
          {checkoutT.backToCatalog ?? "Continue shopping"}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f1f1] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">
          {checkoutT.title ?? "Checkout"}
        </h1>

        {errorParam === "submit" && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            Ocorreu um erro ao processar o pedido. Tente novamente ou contacte-nos.
          </div>
        )}
        {errorParam === "empty" && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            O carrinho está vazio. Adicione produtos antes de finalizar.
          </div>
        )}

        <Form method="post" className="space-y-6">
          <input
            type="hidden"
            name="cart"
            value={JSON.stringify(orderItems)}
          />

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <label htmlFor="checkout-name" className="block text-sm font-medium text-slate-700 mb-1">
                {checkoutT.name ?? "Name"}
              </label>
              <input
                id="checkout-name"
                name="name"
                type="text"
                defaultValue={String(profile?.name ?? "")}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
              />
            </div>
            <div>
              <label htmlFor="checkout-email" className="block text-sm font-medium text-slate-700 mb-1">
                {checkoutT.email ?? "Email"}
              </label>
              <input
                id="checkout-email"
                name="email"
                type="email"
                defaultValue={String(profile?.email ?? "")}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
              />
            </div>
            <div>
              <label htmlFor="checkout-address" className="block text-sm font-medium text-slate-700 mb-1">
                {checkoutT.address ?? "Address"}
              </label>
              <input
                id="checkout-address"
                name="address"
                type="text"
                defaultValue={String(profile?.address ?? "")}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout-postal_code" className="block text-sm font-medium text-slate-700 mb-1">
                  {checkoutT.postalCode ?? "Postal code"}
                </label>
                <input
                  id="checkout-postal_code"
                  name="postal_code"
                  type="text"
                  defaultValue={String(profile?.postal_code ?? "")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
                />
              </div>
              <div>
                <label htmlFor="checkout-nif" className="block text-sm font-medium text-slate-700 mb-1">
                  {checkoutT.nif ?? "NIF"}
                </label>
                <input
                  id="checkout-nif"
                  name="nif"
                  type="text"
                  defaultValue={String(profile?.nif ?? "")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout-city" className="block text-sm font-medium text-slate-700 mb-1">
                  {checkoutT.city ?? "City"}
                </label>
                <input
                  id="checkout-city"
                  name="city"
                  type="text"
                  defaultValue={String(profile?.city ?? "")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
                />
              </div>
              <div>
                <label htmlFor="checkout-country" className="block text-sm font-medium text-slate-700 mb-1">
                  {checkoutT.country ?? "Country"}
                </label>
                <input
                  id="checkout-country"
                  name="country"
                  type="text"
                  defaultValue={String(profile?.country ?? "")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Resumo</h2>
            <ul className="space-y-2 text-slate-700">
              {items.map((i) => (
                <li key={`${i.productId}-${i.size ?? "n"}`}>
                  {i.quantity}x {i.name}
                  {i.size != null ? ` (${i.size})` : ""}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {isSubmitting
                ? "..."
                : (checkoutT.placeOrder ?? "Place order")}
            </button>
            <Link
              to="/"
              className="py-3 px-4 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 text-center"
            >
              {checkoutT.cancel ?? "Cancelar"}
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
