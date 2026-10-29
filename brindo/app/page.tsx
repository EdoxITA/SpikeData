import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/hero/Hero";
import { Problem } from "@/components/sections/Problem";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Strengths } from "@/components/sections/Strengths";
import { ZeroCost } from "@/components/sections/ZeroCost";
import { BringBack } from "@/components/sections/BringBack";
import { Mockups } from "@/components/sections/Mockups";
import { Faq } from "@/components/sections/Faq";
import { ContactForm } from "@/components/sections/ContactForm";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Strengths />
        <ZeroCost />
        <BringBack />
        <Mockups />
        <Faq />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
