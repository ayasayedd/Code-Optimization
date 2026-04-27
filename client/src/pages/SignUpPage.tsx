import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { getSocialLoginUrl } from "@/lib/api";

const socialButtons = [
  {
    label: "Google",
    provider: "google" as const,
    src: "/figmaAssets/google.svg",
    bg: "/figmaAssets/rectangle-48.png",
  },
  {
    label: "Facebook",
    provider: "facebook" as const,
    src: "/figmaAssets/vector.png",
    bg: "/figmaAssets/rectangle-49.png",
  },
  {
    label: "Apple",
    provider: "apple" as const,
    src: "/figmaAssets/apple.png",
    bg: "/figmaAssets/rectangle-50.png",
  },
];

export default function SignUpPage() {
  const { register } = useAuth();
  const [, navigate] = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      navigate("/chat");
    } catch (err) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } }; message?: string };
      const serverErrors = e.response?.data?.errors;
      if (serverErrors) {
        const firstError = Object.values(serverErrors).flat()[0];
        setError(firstError ?? "Registration failed.");
      } else {
        setError(e.response?.data?.message ?? e.message ?? "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#002a63] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-[600px] rounded-[30px] p-10 shadow-2xl">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <img
              src="/figmaAssets/pink-purple-gradient-modern-technology-logo--1--2.png"
              alt="Logo"
              className="w-[100px] h-[100px] object-contain cursor-pointer"
            />
          </Link>
        </div>

        <h2 className="font-medium text-[#002a63] text-3xl md:text-[34px] text-center leading-tight mb-10">
          Create your account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-[73px] bg-[#fefefe] rounded-[10px] border border-[#cecece6b] font-light text-[#333] text-2xl px-4"
          />
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-[73px] bg-[#fefefe] rounded-[10px] border border-[#cecece6b] font-light text-[#333] text-2xl px-4"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-[73px] bg-[#fefefe] rounded-[10px] border border-[#cecece6b] font-light text-[#333] text-2xl px-4"
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            className="w-full h-[73px] bg-[#fefefe] rounded-[10px] border border-[#cecece6b] font-light text-[#333] text-2xl px-4"
          />
          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-[73px] rounded-[10px] border border-[#002a63] bg-gradient-to-r from-[#002a63] to-[#df33a8] font-semibold text-[#fff8f8] text-2xl disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="flex items-center gap-4 my-8">
          <Separator className="flex-1" />
          <span className="text-sm text-gray-500 whitespace-nowrap">
            Or sign up with
          </span>
          <Separator className="flex-1" />
        </div>

        <div className="flex items-center justify-center gap-5">
          {socialButtons.map((btn) => (
            <Button
              key={btn.provider}
              variant="outline"
              onClick={() => { window.location.href = getSocialLoginUrl(btn.provider); }}
              className="w-[48px] h-[48px] p-0 relative rounded-lg overflow-hidden"
              title={`Continue with ${btn.label}`}
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

        <p className="mt-8 text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-[#df33a8] font-semibold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
