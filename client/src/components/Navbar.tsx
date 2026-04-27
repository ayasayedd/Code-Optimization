import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Features", href: "#features" },
  { label: "About Us", href: "#about" },
  { label: "Blog", href: "#blog" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-[100px] flex items-center px-6 lg:px-10">
      <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto">
        <Link href="/">
          <img
            src="/figmaAssets/pink-purple-gradient-modern-technology-logo--1--2.png"
            alt="Logo"
            className="w-[80px] h-[80px] object-contain cursor-pointer"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 lg:gap-12">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-medium text-black text-base hover:text-[#002a63] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="outline"
              className="w-[90px] h-[40px] rounded-[10px] border border-[#bebebe] text-[#626262] font-medium text-base shadow"
            >
              Log In
            </Button>
          </Link>
          <Button 
            onClick={() => {
              const element = document.getElementById('signup-button');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-[100px] h-[40px] rounded-[10px] bg-gradient-to-b from-[#002a63] to-[#e33da2] text-white font-medium text-base shadow"
          >
            Sign Up
          </Button>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="absolute top-[100px] left-0 right-0 bg-white shadow-md md:hidden flex flex-col items-center gap-4 py-6 z-50">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-medium text-black text-base hover:text-[#002a63]"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 mt-2">
          <Link href="/login">
            <Button
              variant="outline"
              className="w-[90px] h-[40px] rounded-[10px] border border-[#bebebe] text-[#626262]"
            >
              Log In
            </Button>
            </Link>
            <Button 
            onClick={() => {
              const element = document.getElementById('signup-button');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-[100px] h-[40px] rounded-[10px] bg-gradient-to-b from-[#002a63] to-[#e33da2] text-white">
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
