import { useMemo } from "react";
import { createPocketBase } from "~/lib/pocketbase";
import { createPageService, type PageRecord } from "~/lib/services";

/**
 * Hook to use PageService in components
 * Automatically creates PocketBase instance on the client side
 * 
 * @param collectionName - Name of the PocketBase collection
 * @returns PageService instance
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const pageService = usePageService("Homepage");
 *   
 *   useEffect(() => {
 *     pageService.getAll().then(setData);
 *   }, []);
 * }
 * ```
 */
export function usePageService<T extends PageRecord = PageRecord>(collectionName: string) {
    return useMemo(() => {
        const pb = createPocketBase();
        return createPageService<T>(pb, collectionName);
    }, [collectionName]);
}
