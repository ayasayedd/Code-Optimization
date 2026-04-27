
const featureCards = [
  {
    title: "Build & Understand Code with AI",
    description: "Optimize code from natural language. Ask AI to explain complex functions.",
    bgColor: "bg-[#9d203f]",
    icons: [
      { src: "/figmaAssets/pen-1.png", alt: "Pen" },
    ],
  },
  {
    title: "Optimize Code From any Language",
    description: "Improve code efficiency.\nGet suggestions for refactoring in Python, JavaScript, and more.",
    bgColor: "bg-[#e33da2]",
    icons: [
      { src: "/figmaAssets/javascript-1.png", alt: "JavaScript" },
      { src: "/figmaAssets/python--1--1.png", alt: "Python" },
    ],
  },
  {
    title: "Optimize Code and Fix Bugs",
    description: "Automatically detect and fix common errors. Get debugging help.",
    bgColor: "bg-[#1eb866]",
    icons: [
      { src: "/figmaAssets/watch-1.png", alt: "Watch" },
    ],
  },
  {
    title: "AI helps Find and Fix Bugs",
    description: "Get intelligent suggestions for improving logic and fixing issues.",
    bgColor: "bg-[#2643ee]",
    icons: [
      { src: "/figmaAssets/idea-1.png", alt: "Idea" },
      { src: "/figmaAssets/search--1--1.png", alt: "Search" },
    ],
  },
];

export function Features() {
  return (
    <section id="features" className="bg-white py-20 px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="font-bold text-black text-4xl md:text-5xl leading-tight mb-14 max-w-[573px]">
          The Future Coding is Here
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {featureCards.map((card, index) => (
            <div key={index} className="flex flex-col rounded-[20px] overflow-hidden">
              <div className={`${card.bgColor} rounded-[20px] p-6 pb-14 relative`}>
                <h3 className="font-bold text-white text-xl lg:text-2xl leading-tight mb-6">
                  {card.title}
                </h3>
                <div className="flex gap-4 mt-4">
                  {card.icons.map((icon, iconIndex) => (
                    <div
                      key={iconIndex}
                      className="w-16 h-16 bg-white/25 rounded-full flex items-center justify-center"
                    >
                      <img
                        src={icon.src}
                        alt={icon.alt}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-black rounded-[20px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-6 -mt-6">
                <p className="font-medium text-[#626262] text-base lg:text-lg leading-relaxed whitespace-pre-line">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
