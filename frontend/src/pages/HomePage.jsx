import React from "react";
import Navigation from "../components/Navigation";
import Hero from "../components/sections/Hero";
import Metrics from "../components/sections/Metrics";
import Services from "../components/sections/Services";
import HowItWorks from "../components/sections/HowItWorks";
import Portfolio from "../components/sections/Portfolio";
import Contact from "../components/sections/Contact";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="bg-[#0A0A0A] text-white relative" data-testid="home-page">
      <Navigation />
      <main>
        <Hero />
        <Metrics />
        <Services />
        <HowItWorks />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
