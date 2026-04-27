const navLinks = [
  { label: "Home", href: "#" },
  { label: "Features", href: "#features" },
  { label: "About Us", href: "#about" },
  { label: "Blog", href: "#blog" },
];

export function Footer() {
  return (
    <footer className="bg-white shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-[100px] flex items-center justify-between">
        <img
          src="/figmaAssets/pink-purple-gradient-modern-technology-logo--1--2.png"
          alt="Logo"
          className="w-[80px] h-[80px] object-contain"
        />

        <nav className="flex items-center gap-6 md:gap-10 flex-wrap justify-center">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-medium text-black text-sm md:text-base hover:text-[#002a63] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <p className="text-sm text-gray-400 hidden md:block">
          © 2025 All rights reserved
        </p>
      </div>
    </footer>
  );
}
