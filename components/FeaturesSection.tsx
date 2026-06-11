const features = [
  {
    title: "Athlete Profiles",
    description:
      "Create a profile that showcases your stats, academic background, and athletic achievements.",
    icon: "🏅",
  },
  {
    title: "Highlight Videos",
    description:
      "Share your best plays and get noticed by coaches.",
    icon: "🎬",
  },
  {
    title: "Coach Connections",
    description:
      "Coaches can easily search and connect with talented athletes.",
    icon: "🤝",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl hover:bg-white/10 transition"
          >
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              {feature.title}
            </h3>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
