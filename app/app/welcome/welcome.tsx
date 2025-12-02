import { Link } from "react-router";
import { motion } from "motion/react"
import AnimatedBackground from "~/components/Elements/AnimatedBackground/AnimatedBackground";
import { Button } from "~/components/Elements/Button/Button";
import { useAuth, useTranslatedContent } from "~/hooks";
import type { PageRecord } from "~/lib/services";

interface WelcomeProps {
  homepageData: PageRecord[];
}

export const Welcome = ({ homepageData }: WelcomeProps) => {
  const { user, isAuthenticated } = useAuth();
  const { getContent } = useTranslatedContent(homepageData);

  // Get translated content
  const title = getContent("intro-title");
  const text = getContent("intro-text");


  return (
    <main className="w-full min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <AnimatedBackground className="absolute top-0 left-0 w-full h-full z-10" />

      {isAuthenticated && (
        <motion.span layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 3.5, ease: [0.22, 1, 0.36, 1] }} className="text-white text-md my-6 bg-white/10 px-4 py-2 rounded-full">Olá, {user?.name} 👋</motion.span>
      )}

      <motion.div
        layout
        className="text-white flex flex-col items-center justify-center gap-8 z-20 relative px-4"
      >
        <motion.h1
          layout
          initial={{ opacity: 0, scale: 1.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 2,
            delay: 0.5,
          }}
          className="text-6xl md:text-8xl"
        >
          {title}
        </motion.h1>

        <motion.p
          layout
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 1, delay: 2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-center text-gray-300 text-lg md:text-xl overflow-hidden"
        >
          {text}
        </motion.p>


        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4 overflow-hidden pt-4"
        >
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="secondary" size="lg" className="hover:bg-gray-200 ">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="secondary" size="lg" className="hover:bg-gray-200 ">Login</Button>
              </Link>
              <Link to="/auth/signup">
                <Button variant="outline" size="lg" className="text-white border-white/20">Sign Up</Button>
              </Link>
            </>
          )}
        </motion.div>

      </motion.div>
    </main>
  );
}
