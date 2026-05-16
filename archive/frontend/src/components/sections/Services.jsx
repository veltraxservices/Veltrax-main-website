import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const Services = () => {
  const { t, lang } = useLanguage();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const items = t("services.items");

  return (
    <section
      id="services"
      ref={ref}
      data-testid="services-section"
      className="relative py-24 sm:py-36 bg-[#0A0A0A] border-t border-white/5"
    >
      <div className="vx-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16 sm:mb-24">
          <div className="lg:col-span-5 flex items-start gap-4">
            <span className="vx-overline mt-2">— {t("services.eyebrow")}</span>
          </div>
          <div className="lg:col-span-7">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-[-0.03em] leading-[1.02] uppercase"
            >
              {t("services.title")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 text-white/60 text-base sm:text-lg max-w-xl font-light leading-relaxed"
            >
              {t("services.subtitle")}
            </motion.p>
          </div>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-px bg-white/10">
          {Array.isArray(items) &&
            items.map((item, i) => {
              const span =
                i === 0
                  ? "md:col-span-4"
                  : i === 1
                  ? "md:col-span-2"
                  : i === 2
                  ? "md:col-span-3"
                  : i === 3
                  ? "md:col-span-3"
                  : "md:col-span-6";
              const tall = i === 0 || i === 4 ? "md:row-span-1" : "";
              return (
                <motion.article
                  key={item.n}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  data-testid={`service-card-${i}`}
                  className={`group relative bg-[#0A0A0A] p-8 sm:p-10 lg:p-12 ${span} ${tall} flex flex-col justify-between min-h-[300px] sm:min-h-[360px] overflow-hidden cursor-default`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-display text-white/30 text-sm tracking-[0.3em]">
                      {item.n}
                    </span>
                    <motion.span
                      initial={{ opacity: 0, x: -8, y: 8 }}
                      whileHover={{ opacity: 1, x: 0, y: 0 }}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowUpRight size={20} />
                    </motion.span>
                  </div>

                  <div>
                    <h3 className="font-display text-white text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight leading-tight mb-5">
                      {item.t}
                    </h3>
                    <p className="text-white/55 text-sm sm:text-base font-light leading-relaxed max-w-md">
                      {item.d}
                    </p>
                  </div>

                  {/* hover line */}
                  <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-white group-hover:w-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  {/* subtle hover background */}
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors duration-500 pointer-events-none" />
                </motion.article>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default Services;
