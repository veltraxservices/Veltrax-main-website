import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";

const useCount = (target, inView, duration = 1600) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  return val;
};

const Stat = ({ value, suffix, label, index, inView }) => {
  const numeric = useCount(value ?? 0, inView);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="border-t border-white/10 pt-6"
      data-testid={`metric-${index}`}
    >
      <div className="font-display text-white text-5xl sm:text-6xl font-light tracking-tighter">
        {value !== null ? `+${numeric}${suffix || ""}` : suffix}
      </div>
      <p className="vx-overline mt-3">{label}</p>
    </motion.div>
  );
};

const Metrics = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      data-testid="metrics-section"
      className="relative py-20 sm:py-28 bg-[#0A0A0A]"
    >
      <div className="vx-container grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12">
        <Stat value={284} suffix="%" label={t("metrics.label_1")} index={0} inView={inView} />
        <Stat value={42} suffix="" label={t("metrics.label_2")} index={1} inView={inView} />
        <Stat value={96} suffix="%" label={t("metrics.label_3")} index={2} inView={inView} />
        <Stat value={null} suffix={t("metrics.val_4")} label={t("metrics.label_4")} index={3} inView={inView} />
      </div>
    </section>
  );
};

export default Metrics;
