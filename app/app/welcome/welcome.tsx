import { HomeHero } from "~/components/HomeHero";
import type { PageRecord } from "~/lib/services";
import CategoryCard from "~/components/Cards/CategoryCard/";
import ProductCard from "~/components/Cards/ProductCard/";
import BackofficeCards from "~/components/Backoffice/BackofficeCards";

interface WelcomeProps {
  homepageData: PageRecord[];
}

export const Welcome = ({ homepageData }: WelcomeProps) => {
  return (
    <main className="w-full min-h-screen bg-white flex flex-col items-center relative overflow-x-hidden">
      <HomeHero />

      <div className="flex flex-col items-center gap-12 py-20 px-6 max-w-[1400px] w-full">
        <CategoryCard
          name="CATEGORIA TESTE TIPO"
          description="DESCOBRE UMA NOVA CATEGORIA"
          media={{ image: "/images/shoe.png", hover: "/videos/login.mp4" }}
          link="/contact"
        />

        <ProductCard
          name="Sapato Que é Um Teste"
          media={{
            image: "/images/personWshoe.png",
            hover: "/videos/login.mp4",
          }}
          link="/about"
        />
      </div>
    </main>
  );
};