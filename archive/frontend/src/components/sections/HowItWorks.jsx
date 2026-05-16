import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const steps = t("process.steps");

  return (
    <section
      id="process"
      ref={ref}
      data-testid="process-section"
      className="relative py-24 sm:py-36 bg-[#0A0A0A] border-t border-white/5"
    >
      <div className="vx-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
          <div className="lg:col-span-5">
            <span className="vx-overline">— {t("process.eyebrow")}</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <h2 className="font-display text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-[-0.03em] leading-[1.02] uppercase">
              {t("process.title")}
            </h2>
          </motion.div>
        </div>

        <div className="relative">
          {/* vertical timeline line */}
          <div className="hidden md:block absolute left-[80px] top-0 bottom-0 w-px bg-white/10" />

          {Array.isArray(steps) &&
            steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.15 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                data-testid={`process-step-${i}`}
                className="relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-10 md:py-16 border-t border-white/10 last:border-b last:border-white/10 group"
              >
                <div className="md:col-span-2 flex md:block items-baseline gap-6">
                  <span className="font-display text-white text-6xl md:text-7xl lg:text-8xl font-light tracking-[-0.04em] leading-none">
                    {s.n}
                  </span>
                </div>

                <div className="md:col-span-7">
                  <h3 className="font-display text-white text-3xl sm:text-4xl font-light tracking-tight mb-4">
                    {s.t}
                  </h3>
                  <p className="text-white/60 text-base sm:text-lg font-light leading-relaxed max-w-xl">
                    {s.d}
                  </p>
                </div>

                <div className="md:col-span-3 flex md:justify-end items-start">
                  <span className="vx-overline text-white/40">{s.dur}</span>
                </div>

                {/* dot on timeline */}
                <span className="hidden md:block absolute left-[76px] top-[68px] w-[9px] h-[9px] bg-white rounded-full" />
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
