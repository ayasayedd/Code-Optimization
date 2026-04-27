import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";

const socialButtons = [
  {
    label: "Google",
    src: "/figmaAssets/vector-1.svg",
    bg: "/figmaAssets/rectangle-48.png",
  },
  {
    label: "GitHub",
    src: "/figmaAssets/vector.png",
    bg: "/figmaAssets/rectangle-49.png",
  },
  {
    label: "Apple",
    src: "/figmaAssets/apple.png",
    bg: "/figmaAssets/rectangle-50.png",
  },
];

export function SignInForm() {
    const { login } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login();
      navigate("/chat");
    }
  };
  return (
    <section id="signin-section" className="bg-white py-20 px-6 lg:px-10 scroll-mt-20">
      <div className="max-w-[600px] mx-auto">
        <h2 className="font-medium text-[#002a63] text-3xl md:text-[34px] text-center leading-tight mb-10">
          Sign in your account
        </h2>

       <form onSubmit={handleSubmit} className="flex flex-col gap-5">          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-[73px] bg-[#fefefe] rounded-[10px] border border-[#cecece6b] font-light text-[#333] text-2xl px-4"          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-[73px] bg-[#fefefe] rounded-[10px] border border-[#cecece6b] font-light text-[#333] text-2xl px-4"          />
          <Button
            type="submit"
            className="w-full h-[73px] rounded-[10px] border border-[#002a63] bg-gradient-to-r from-[#002a63] to-[#df33a8] font-semibold text-[#fff8f8] text-2xl"
          >
            Sign In
          </Button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <Separator className="flex-1" />
          <span className="text-sm text-gray-500 whitespace-nowrap">
            Or sign in with
          </span>
          <Separator className="flex-1" />
        </div>

        <div className="flex items-center justify-center gap-5">
          {socialButtons.map((btn, index) => (
            <Button
              key={index}
              type="button"
              onClick={() => { login(); navigate("/chat"); }}
              variant="outline"
              className="w-[48px] h-[48px] p-0 relative rounded-lg overflow-hidden"
            >
              <img
                src={btn.bg}
                alt={btn.label}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <img
                src={btn.src}
                alt={btn.label}
                className="relative z-10 w-6 h-6 object-contain"
              />
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
