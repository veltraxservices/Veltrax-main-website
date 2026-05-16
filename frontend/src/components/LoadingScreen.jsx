import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAME = "VELSTRAX";

const LoadingScreen = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState(0); // 0 = letters, 1 = full word, 2 = exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1100);
    const t2 = setTimeout(() => setPhase(2), 1900);
    const t3 = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-testid="loading-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            filter: "blur(20px)",
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A]"
        >
          <motion.div
            animate={{ y: phase === 2 ? -40 : 0, opacity: phase === 2 ? 0 : 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <div className="font-display flex overflow-hidden" data-testid="loading-logo">
              {NAME.split("").map((char, i) => (
                <span
                  key={i}
                  className="vx-letter text-white text-5xl sm:text-6xl md:text-7xl font-light tracking-[0.18em]"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  {char}
                </span>
              ))}
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: phase >= 1 ? 1 : 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 h-[1px] w-40 bg-white origin-left"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 1 ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="vx-overline mt-4"
            >
              Premium Web Studio · GR
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
