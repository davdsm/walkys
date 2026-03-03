import { useRef } from "react";

import type { Route } from "./+types/about";
import { createPocketBase } from "~/lib/pocketbase";
import { createImageService } from "~/lib/services";
import type { PageRecord } from "~/lib/services";
import { getLanguageFromRequest } from "~/lib/utils";
import { useLoaderData } from "react-router";
import { useTranslatedContent } from "~/hooks";
import { useLanguage } from "~/contexts";
import { SmallCTA } from "~/components/SmallCTA";
import { AboutHero, AboutValues } from "~/components/AboutPage";

const ABOUT_COLLECTION = "AboutPage";

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  getLanguageFromRequest(request);

  try {
    const rawRecords = (await pb.collection(ABOUT_COLLECTION).getFullList()) as PageRecord[];
    const imageService = createImageService(pb, ABOUT_COLLECTION, rawRecords);
    const images = {
      entryImg: imageService.getImageBySectionName({ sectionId: "intro_img" }),
      WhatAboutCard1img: imageService.getImageBySectionName({
        sectionId: "what_about_card_1_image",
      }),
      WhatAboutCard2img: imageService.getImageBySectionName({
        sectionId: "what_about_card_2_image",
      }),
      MoldImage: imageService.getImageBySectionName({ sectionId: "mold" }),
      ShapeImage: imageService.getImageBySectionName({ sectionId: "shapping" }),
      TabulatedImage: imageService.getImageBySectionName({ sectionId: "tabulated" }),
      QualityImage: imageService.getImageBySectionName({ sectionId: "quality" }),
    };
    return { aboutPageData: rawRecords, images };
  } catch (error) {
    console.error("Error loading about page:", error);
    const emptyImages = {
      entryImg: [] as string[],
      WhatAboutCard1img: [] as string[],
      WhatAboutCard2img: [] as string[],
      MoldImage: [] as string[],
      ShapeImage: [] as string[],
      TabulatedImage: [] as string[],
      QualityImage: [] as string[],
    };
    return { aboutPageData: [], images: emptyImages };
  }
}

export default function About() {
  const data = useLoaderData<typeof loader>();
  const lastDataRef = useRef(data);

  if (data) lastDataRef.current = data;
  const effectiveData = data || lastDataRef.current;
  if (!effectiveData) return null;

  const { aboutPageData, images } = effectiveData;
  const { getContent } = useTranslatedContent(aboutPageData);
  const { t } = useLanguage();

  const heroImage = images?.entryImg?.[0] ?? "/cover.jpg";
  const heroTitle = getContent("intro_title");
  const heroSubtitle = getContent("intro_text");

  const values = [
    {
      image: images?.WhatAboutCard1img?.[0] ?? "",
      title: getContent("what_about_card_1_title"),
      description: getContent("what_about_card_1_text"),
    },
    {
      image: images?.WhatAboutCard2img?.[0] ?? "",
      title: getContent("what_about_card_2_title"),
      description: getContent("what_about_card_2_text"),
    },
  ].filter((v) => v.image);

  return (
    <main className="w-full min-h-screen flex flex-col bg-[#f1f1f1]">
      <AboutHero
        image={heroImage}
        eyebrow={t.about.our_story}
        title={heroTitle}
        subtitle={heroSubtitle}
      />

      {values.length > 0 && (
        <AboutValues
          sectionTitle={t.about.what_about_title}
          values={values}
        />
      )}

      <section className="w-full px-6 md:px-16 pt-16">
        <SmallCTA />
      </section>
    </main>
  );
}
