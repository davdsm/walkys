import { useRef, useState, useEffect } from "react";

import type { Route } from "./+types/home";
import { createPocketBase } from "~/lib/pocketbase";
import { createImageService, createPageService } from "~/lib/services";
import { useLoaderData } from "react-router";
import { AboutEntry } from "~/components/AboutEntry";
import { useTranslatedContent } from "~/hooks";
import { useLanguage } from "~/contexts";
import { WhatAbout } from "~/components/WhatAbout";
import { SmallCTA } from "~/components/SmallCTA";
import { AnimatedGallery } from "~/components/AnimatedGallery";
import { motion } from "framer-motion";

// Loader: Fetch data on the server/route level
export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);

  try {
    const pageService = createPageService(pb, "AboutPage");
    const aboutPageData = await pageService.getAll();

    const imageService = createImageService(pb, "AboutPage", aboutPageData);
    const images = {
      entryImg: imageService.getImageBySectionName({
        sectionId: "intro_img",
      }),
      WhatAboutCard1img: imageService.getImageBySectionName({
        sectionId: "what_about_card_1_image",
      }),
      WhatAboutCard2img: imageService.getImageBySectionName({
        sectionId: "what_about_card_2_image",
      }),
      Gallery: imageService.getImageBySectionName({
        sectionId: "about_gallery",
      }),
      MoldImage: imageService.getImageBySectionName({
        sectionId: "mold",
      }),
      ShapeImage: imageService.getImageBySectionName({
        sectionId: "shapping",
      }),
      TabulatedImage: imageService.getImageBySectionName({
        sectionId: "tabulated",
      }),
      QualityImage: imageService.getImageBySectionName({
        sectionId: "quality",
      }),
    };
    return { aboutPageData, images };
  } catch (error) {
    console.error("Error loading aboutpage:", error);
    return { aboutPageData: [], baseUrl: "http://127.0.0.1:8090" };
  }
}

export const About = () => {
  const data = useLoaderData<typeof loader>();
  const lastDataRef = useRef(data);

  // Update ref if we have new data
  if (data) {
    lastDataRef.current = data;
  }

  // Use current data or fallback to last known data
  const effectiveData = data || lastDataRef.current;

  if (!effectiveData) return null;

  const { aboutPageData, images } = effectiveData;
  const { getContent } = useTranslatedContent(aboutPageData);
  const { t } = useLanguage();

  const WhatAboutCards = [
    {
      image: images!.WhatAboutCard1img[0],
      title: getContent("what_about_card_1_title"),
      description: getContent("what_about_card_1_text"),
    },
    {
      image: images!.WhatAboutCard2img[0],
      title: getContent("what_about_card_2_title"),
      description: getContent("what_about_card_2_text"),
    },
  ];

  const GalleryItems = images?.Gallery.map((image, index) => {
    return {
      id: `imageAboutGallery${index}`,
      img: image,
    };
  });

  const steps = [
    { title: t.about.mold_title, description: getContent("mold"), img: images!.MoldImage[0] },
    { title: t.about.shapping_title, description: getContent("shapping"), img: images!.ShapeImage[0] },
    { title: t.about.tabulated_title, description: getContent("tabulated"), img: images!.TabulatedImage[0] },
    { title: t.about.quality_title, description: getContent("quality"), img: images!.QualityImage[0] }
  ];

  // Pass data to Welcome component as props
  return (
    <section
      className="w-full min-h-screen flex flex-col bg-[#f1f1f1] justify-start items-start transition-colors duration-500"

    >
      <AboutEntry
        img={images!.entryImg[0]}
        title={getContent("intro_title")}
        text={getContent("intro_text")}
      />
      <article className="max-w-7xl px-8 mx-auto pt-8 w-full">
        <WhatAbout title={t.about.what_about_title} cards={WhatAboutCards} />
      </article>
      <motion.article initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.1, once: true }}
        transition={{
          duration: 1,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.2,
        }}
        className="w-full"
      >
        {GalleryItems && GalleryItems.length > 0 && (
          <AnimatedGallery gallery={GalleryItems} steps={steps} title={t.about.gallery_title} />
        )}
      </motion.article>

      <article className="-mt-4 w-full">
        <SmallCTA />
      </article>

    </section>
  );
};

export default About;
