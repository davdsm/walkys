import { Welcome } from "~/welcome/welcome";
import type { Route } from "./+types/home";
import { createPocketBase } from "~/lib/pocketbase";
import { createPageService } from "~/lib/services";
import { useLoaderData } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "AskNicely - The Boilerplate" },
    { name: "description", content: "Welcome to AskNicely!" },
  ];
}

// Loader: Fetch data on the server/route level
export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  const pageService = createPageService(pb, "Homepage");

  try {
    const homepageData = await pageService.getAll();
    return { homepageData };
  } catch (error) {
    console.error("Error loading homepage:", error);
    return { homepageData: [] };
  }
}

import { useRef } from "react";

export const Home = () => {
  const data = useLoaderData<typeof loader>();
  const lastDataRef = useRef(data);

  // Update ref if we have new data
  if (data) {
    lastDataRef.current = data;
  }

  // Use current data or fallback to last known data
  const effectiveData = data || lastDataRef.current;

  if (!effectiveData) return null;

  const { homepageData } = effectiveData;

  // Pass data to Welcome component as props
  return <Welcome homepageData={homepageData} />;
}

export default Home