
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ParallaxProvider, Parallax } from "react-scroll-parallax";

interface GalleryItem {
    id: string;
    img: string;
    height?: number;
}

interface AnimatedGalleryProps {
    gallery: GalleryItem[];
    steps: {
        title: string;
        description: string;
        img: string
    }[];
    title?: string;
}

export const AnimatedGallery = ({ gallery, steps, title = "HOW IT ALL STARTS" }: AnimatedGalleryProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    if (!gallery || gallery.length === 0) return null;

    // Configuration
    const heroIndex = Math.floor(gallery.length / 2);
    const heroItem = gallery[heroIndex];
    const othergallery = gallery.filter((_, i) => i !== heroIndex);

    const stepImages = [
        heroItem.img, // Step 1 uses hero
        steps[1]?.img || heroItem.img,
        steps[2]?.img || heroItem.img,
        steps[3]?.img || heroItem.img
    ];

    // --- Animations ---

    // 1. Zoom
    // We want "almost full screen" with margins.
    // Desktop: Start 30vw -> Target ~90vw.
    // Mobile: Start 80vw -> Target ~95vw.
    // Let's approximate scales.
    const targetScale = isMobile ? 2 : 2.2;
    const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, targetScale]);

    // Others fade out
    const othersOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

    // 2. Card Appearance
    // The "Info Card" should fade in after the zoom is mostly done.
    const cardOpacity = useTransform(scrollYProgress, [0.15, 0.20], [0, 1]);

    // 3. Steps Content Fading
    const useStepOpacity = (index: number) => {
        const start = 0.25 + (index * 0.18);
        const end = start + 0.18;
        // Fade in, Stay, Fade out
        return useTransform(scrollYProgress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
    };

    // Tighter Masonry Layout for background items
    const layout = [
        { top: "10%", left: "20%", width: "20vw", height: "30vh", speed: -10 },
        { top: "5%", left: "41%", width: "35vw", height: "25vh", speed: -5 },
        { top: "35%", left: "65%", width: "15vw", height: "30vh", speed: 5 },
        { top: "45%", left: "15%", width: "25vw", height: "40vh", speed: 10 },
        { top: "42%", left: "42%", width: "22vw", height: "30vh", speed: 15 },
        { top: "50%", left: "68%", width: "15vw", height: "20vh", speed: 20 },
    ];

    return (
        <ParallaxProvider>
            <div ref={containerRef} className="relative h-[600vh] w-full md:pt-40 md:pb-12">
                <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">

                    {/* --- LAYER 2: Initial Masonry (Fades out) --- */}
                    <motion.div style={{ opacity: othersOpacity }} className="absolute inset-0 w-full h-full z-10 pointer-events-none hidden md:block">
                        {othergallery.slice(0, 6).map((item, i) => {
                            const pos = layout[i % layout.length];
                            return (
                                <div
                                    key={item.id}
                                    className="absolute"
                                    style={{
                                        top: pos.top,
                                        left: pos.left,
                                        width: pos.width,
                                        height: pos.height,
                                    }}
                                >
                                    <Parallax speed={pos.speed} className="w-full h-full">
                                        <div className="w-full h-full rounded-xl overflow-hidden bg-[#f1f1f1]">
                                            <img
                                                src={item.img}
                                                alt=""
                                                className="w-full h-full object-cover transition-all duration-500"
                                            />
                                        </div>
                                    </Parallax>
                                </div>
                            );
                        })}
                    </motion.div>

                    {/* --- LAYER 3: Hero Image Container (Zooms & Swaps Content) --- */}
                    <motion.div
                        style={{
                            scale: heroScale,
                            zIndex: 20
                        }}
                        // Initial sizing: 
                        // Desktop: 30vw width. 
                        // Mobile: 80vw width.
                        // We use a larger border radius that scales up to look like the wireframe.
                        // If we start with rounded-2xl (16px) and scale 3x, it becomes ~48px which is nice and round.
                        className="absolute rounded-2xl overflow-hidden bg-[#b1b1b1] w-[80vw] h-[50vh] md:w-[30vw] md:h-[40vh]"
                    >
                        {/* Base Hero Image */}
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={heroItem.img}
                                alt="Main Feature"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Overlay Images for subsequent steps */}
                        {stepImages.slice(1).map((img, index) => {
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            const opacity = useTransform(
                                scrollYProgress,
                                [0.25 + ((index + 1) * 0.18) - 0.05, 0.25 + ((index + 1) * 0.18)],
                                [0, 1]
                            );

                            return (
                                <motion.div
                                    key={`hero-overlay-${index}`}
                                    style={{ opacity }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <img
                                        src={img}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* --- LAYER 4: The White Info Card --- */}
                    {/* 
                      Placed inside the sticky container. 
                      We use a wrapper div to position it relative to the viewport (or the zoomed image area).
                      Using 'absolute bottom-[10%] left-[8%]' approximates the wireframe position over the 90vw image.
                    */}
                    <motion.div
                        style={{ opacity: cardOpacity }}
                        className="absolute bottom-22 md:bottom-4 left-4 z-30 pointer-events-auto w-full"
                    >
                        <div className="bg-white relative w-full md:w-1/2">
                            {steps.map((step, i) => {
                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                const stepOpacity = useStepOpacity(i);
                                return (
                                    <motion.div
                                        key={`step-card-${i}`}
                                        style={{ opacity: stepOpacity }}
                                        className="absolute w-4/5 md:w-1/2 bottom-0 left-0 flex flex-col justify-center p-8 md:p-10 bg-white rounded-xl"
                                    >
                                        <h3 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-black mb-4 flex items-end">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm md:text-base font-medium leading-relaxed text-gray-600">
                                            {step.description}
                                        </p>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>

                </div>
            </div>
        </ParallaxProvider>
    );
};
