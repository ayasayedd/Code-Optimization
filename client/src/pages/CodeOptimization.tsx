import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { SignInForm } from "@/components/SignInForm";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerReveal from "@/components/Stagger";

export const CodeOptimization = (): JSX.Element => {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="min-h-screen">
      <ScrollReveal>
      <Navbar />
      <main>
        <Hero />
        <StaggerReveal>
        <Features />
        {!showSignIn ? (
          <section className="bg-white py-20 flex justify-center">
            <Button 
              id = "signup-button"
              onClick={() => setShowSignIn(true)}
              className="h-[73px] px-12 rounded-[10px] bg-gradient-to-r from-[#002a63] to-[#df33a8] font-semibold text-white text-2xl shadow-lg hover:opacity-90 transition-all"
            >
              Sign Up Now
            </Button>
          </section>
        ) : (
          <SignInForm />
        )}
        </StaggerReveal>
      </main>
      <Footer />
      </ScrollReveal>
    </div>
  );
};
