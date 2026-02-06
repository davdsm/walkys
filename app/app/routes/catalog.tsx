import { redirect, useLoaderData } from "react-router";
import type { Route } from "../+types/root";
import { createPocketBase, createPocketBaseAsAdmin } from "~/lib/pocketbase";
import { getLanguageFromRequest } from "~/lib/utils";
import { createProductService, createCategoryService } from "~/lib/services";
import CatalogPage from "~/components/Backoffice/CatalogPage";

function normalizeCatalogProductIds(raw: unknown): string[] {
    if (raw == null) return [];
    if (Array.isArray(raw)) {
        return raw
            .map((item) => (typeof item === "string" ? item : (item as { id?: string })?.id))
            .filter((id): id is string => typeof id === "string" && id.length > 0);
    }
    return [];
}

export async function loader({ request }: Route.LoaderArgs) {
    const pb = createPocketBase(request);
    if (!pb.authStore.isValid) {
        return redirect("/auth/login");
    }

    const currentUser = pb.authStore.model as { id?: string } | null;
    const userId = currentUser?.id;
    let productIds: string[] = [];
    let noProductsAssigned = false;

    // Prefer admin client so we can read catalog_products and list products even when
    // API rules restrict listing to admins. Fall back to user client.
    const adminPb = await createPocketBaseAsAdmin();
    const client = adminPb ?? pb;

    if (userId) {
        try {
            const userRecord = await client.collection("users").getOne(userId, { fields: "catalog_products" });
            const raw = (userRecord as { catalog_products?: unknown }).catalog_products;
            productIds = normalizeCatalogProductIds(raw);
        } catch {
            noProductsAssigned = true;
        }
    } else {
        noProductsAssigned = true;
    }

    const language = getLanguageFromRequest(request);
    const productService = createProductService(client, language);
    const categoryService = createCategoryService(client, language);

    const products =
        productIds.length > 0 ? await productService.getByIds(productIds) : [];
    if (productIds.length === 0) {
        noProductsAssigned = true;
    }
    const categories = categoryService.getCategoriesFromProducts(products);

    return {
        user: pb.authStore.model,
        products,
        categories,
        language,
        noProductsAssigned,
    };
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Walkys - Catalog" },
    ];
}

export default function Catalog() {
    const data = useLoaderData<typeof loader>();
    return (
        <div className="w-full h-screen bg-white flex flex-col items-center justify-center gap-8">
            <CatalogPage 
                products={data.products}
                categories={data.categories}
                language={data.language}
                noProductsAssigned={data.noProductsAssigned}
            />
        </div>
    );
}