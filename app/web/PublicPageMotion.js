'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PublicPageMotion({ children }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="public-atmosphere relative flex min-h-screen scroll-smooth flex-col text-gray-900 antialiased"
    >
      <div className="public-atmosphere-content relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </motion.div>
  );
}
