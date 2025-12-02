import { redirect, Form, Link } from "react-router";
import type { Route } from "../+types/root";
import { createPocketBase } from "~/lib/pocketbase";
import { Button } from "~/components/Elements/Button/Button";

export async function loader({ request }: Route.LoaderArgs) {
    const pb = createPocketBase(request);
    if (!pb.authStore.isValid) {
        return redirect("/auth/login");
    }
    return null;
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "AskNicely - Dashboard" },
    ];
}

export default function Dashboard() {
    return (
        <div className="w-full h-screen bg-white flex flex-col items-center justify-center gap-8">
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>

            <div className="flex items-center gap-8">
                <Form action="/logout" method="post">
                    <Button type="submit" variant="primary">
                        Logout
                    </Button>
                </Form>

                <Link to="/">
                    Home
                </Link>
            </div>
        </div>
    );
}
