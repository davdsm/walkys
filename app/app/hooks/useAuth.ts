import { useRouteLoaderData } from "react-router";

/**
 * User model interface from PocketBase
 */
export interface User {
    id: string;
    email: string;
    name?: string;
    username?: string;
    avatar?: string;
    birthDate?: string;
    created?: string;
    updated?: string;
    [key: string]: any; // Allow for additional custom fields
}

/**
 * Authentication hook return type
 */
export interface UseAuthReturn {
    /**
     * The current authenticated user, or null if not logged in
     */
    user: User | null;

    /**
     * Whether the user is authenticated
     */
    isAuthenticated: boolean;

    /**
     * Whether the user is a guest (not authenticated)
     */
    isGuest: boolean;
}

/**
 * Custom hook to access the current user's authentication state
 * 
 * @returns {UseAuthReturn} Object containing user data and authentication status
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, isGuest } = useAuth();
 *   
 *   if (isGuest) {
 *     return <div>Please log in</div>;
 *   }
 *   
 *   return <div>Welcome, {user.name}!</div>;
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
    // Get the root loader data which contains the user
    const data = useRouteLoaderData("root") as { user: User | null } | undefined;

    const user = data?.user ?? null;
    const isAuthenticated = user !== null;
    const isGuest = !isAuthenticated;

    return {
        user,
        isAuthenticated,
        isGuest,
    };
}
