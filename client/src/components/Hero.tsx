import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import "../index.css";


export function Hero() {
  return (
    <section className="bg-[#002a63] pt-[100px] min-h-screen flex items-center relative overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-10 py-16 lg:py-20 flex flex-col lg:flex-row items-center gap-10">
        <div className="flex-1 max-w-xl">
          <h1 className="font-bold text-white text-4xl md:text-5xl lg:text-[48px] leading-tight mb-8">
            Build &amp; Understand Code with AI
          </h1>

          <p className="font-medium text-[#acacac] text-xl md:text-2xl leading-relaxed mb-12">
            Unlock your coding potential.
            <br />
            Leverage intelligent AI to write, debug, and optimize code
            <br />
            faster than ever before.
          </p>

          <div className="flex items-center gap-5 flex-wrap">
            <Button className="w-[200px] h-[60px] rounded-[20px] border border-white bg-gradient-to-r from-[#e33da2] to-[#002a63] text-white font-bold text-2xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
              Lets Try
            </Button>
            <Link href="/login">
              <Button className="w-[150px] h-[60px] rounded-[20px] border border-white bg-gradient-to-r from-[#e33da2] to-[#002a63] text-white font-bold text-2xl shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
                Log In
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end">
          <img
            src="/figmaAssets/chatbot-and-browser-with-coding.png"
            alt="Chatbot and browser with coding"
            className="w-full max-w-[600px] h-auto object-contain animated"
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <img
          src="/figmaAssets/vector-4.svg"
          alt=""
          className="w-full h-auto animate-fade-in"
        />
      </div>
    </section>
  );
}
