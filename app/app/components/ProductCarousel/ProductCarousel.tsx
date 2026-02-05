import { ArrowUpRight } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import ProductCard from "~/components/Cards/ProductCard";
import { Button } from "~/components/Elements/Button/Button";

export interface ProductCarouselCard {
  id: string;
  name: string;
  media: { image: string; hover: string };
  link: string;
}

export interface ProductCarouselProps {
  title: string;
  subtitle: string;
  cards: ProductCarouselCard[];
  ctaText?: string;
  ctaLink?: string;
}

export function ProductCarousel({
  title,
  subtitle,
  cards,
  ctaText,
  ctaLink = "#",
}: Readonly<ProductCarouselProps>) {
  return (
    <section className="w-full">
      <div className="mb-6">
        <h5 className="text-4xl font-bold uppercase">{title}</h5>
        <p className="text-lg py-3">{subtitle}</p>
      </div>

      <div className="">
        <Carousel
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
        >
          <CarouselContent>
            {cards.map((card) => (
              <CarouselItem key={card.id} className="basis-1/2 lg:basis-1/5">
                <ProductCard
                  name={card.name}
                  media={card.media}
                  link={card.link}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* CTA Footer */}
        <div className="pt-8 md:pt-12 flex justify-center">
          <Button
            to={ctaLink}
            variant="primary"
            size="md"
            rightIcon={<ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />}
          >
            {ctaText}
          </Button>
        </div>
      </div>
    </section>
  );
}
