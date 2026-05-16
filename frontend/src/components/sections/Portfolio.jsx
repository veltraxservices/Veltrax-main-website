import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { api } from "../../lib/api";
import { useLanguage } from "../../contexts/LanguageContext";

const Portfolio = () => {
  const { t, lang } = useLanguage();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get("/portfolio")
      .then(({ data }) => mounted && setItems(data))
      .catch(() => mounted && setItems([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const localized = (item) => ({
    title: lang === "en" && item.title_en ? item.title_en : item.title,
    category: lang === "en" && item.category_en ? item.category_en : item.category,
    description: lang === "en" && item.description_en ? item.description_en : item.description,
  });

  return (
    <section
      id="work"
      ref={ref}
      data-testid="portfolio-section"
      className="relative py-24 sm:py-36 bg-[#0A0A0A] border-t border-white/5"
    >
      <div className="vx-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16 sm:mb-20">
          <div className="lg:col-span-5">
            <span className="vx-overline">— {t("portfolio.eyebrow")}</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <h2 className="font-display text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-[-0.03em] leading-[1.02] uppercase">
              {t("portfolio.title")}
            </h2>
            <p className="mt-6 text-white/60 text-base sm:text-lg font-light max-w-xl">
              {t("portfolio.subtitle")}
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="text-white/30 vx-overline">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {items.map((raw, i) => {
              const item = localized(raw);
              const span =
                i % 5 === 0 || i % 5 === 3
                  ? "md:col-span-7"
                  : i % 5 === 1 || i % 5 === 4
                  ? "md:col-span-5"
                  : "md:col-span-12";
              const tall = i % 5 === 0 ? "md:h-[520px]" : "md:h-[440px]";
              return (
                <motion.article
                  key={raw.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.9,
                    delay: 0.15 + (i % 6) * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  data-testid={`portfolio-card-${i}`}
                  className={`group relative overflow-hidden ${span} bg-[#121212] border border-white/5`}
                >
                  <div className={`relative w-full h-[300px] sm:h-[380px] ${tall} overflow-hidden`}>
                    <img
                      src={raw.image_url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover vx-grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent" />
                  </div>

                  <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
                    <span className="vx-overline text-white/80">{item.category}</span>
                    <span className="font-display text-white/40 text-xs tracking-[0.3em]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="absolute left-0 right-0 bottom-0 p-6 sm:p-8">
                    <h3 className="font-display text-white text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-white/60 text-sm sm:text-base font-light max-w-md line-clamp-2">
                      {item.description}
                    </p>

                    <div className="mt-6 flex flex-wrap items-end gap-6 sm:gap-10">
                      {raw.metric_before && (
                        <div>
                          <span className="vx-overline text-white/40">
                            {t("portfolio.before")}
                          </span>
                          <p className="mt-1 font-display text-white/60 text-base sm:text-lg line-through decoration-white/30">
                            {raw.metric_before}
                          </p>
                        </div>
                      )}
                      {raw.metric_after && (
                        <div>
                          <span className="vx-overline text-white">
                            {t("portfolio.after")}
                          </span>
                          <p className="mt-1 font-display text-white text-xl sm:text-2xl tracking-tight">
                            {raw.metric_after}
                          </p>
                        </div>
                      )}
                      <div className="ml-auto">
                        <span className="inline-flex items-center gap-2 text-white text-xs tracking-[0.16em] uppercase font-display opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                          {t("portfolio.view")} <ArrowUpRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
