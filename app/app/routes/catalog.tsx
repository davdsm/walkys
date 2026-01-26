import { redirect, useLoaderData } from "react-router";
import type { Route } from "../+types/root";
import { createPocketBase } from "~/lib/pocketbase";
import { getLanguageFromRequest } from "~/lib/utils";
import { createProductService, createCategoryService } from "~/lib/services";
import CatalogPage from "~/components/Backoffice/CatalogPage";

export async function loader({ request }: Route.LoaderArgs) {
    const pb = createPocketBase(request);
    if (!pb.authStore.isValid) {
        return redirect("/auth/login");
    }

    const language = getLanguageFromRequest(request);
    const productService = createProductService(pb, language);
    const categoryService = createCategoryService(pb, language);

    const products = await productService.getAll();
    const categories = categoryService.getCategoriesFromProducts(products);   

    return {
        user: pb.authStore.model,
        products,
        categories,
        language,
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
            />
        </div>
    );
}