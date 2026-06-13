const features = [
  {
    title: "A Profile That's Truly Yours",
    description:
      "Build a professional digital identity with your stats, academic background, achievements, and athletic journey all in one place.",
    icon: "🆔",
  },
  {
    title: "Highlights & Achievements",
    description:
      "Showcase your highlight videos and career milestones so coaches can see your story, not just your stats.",
    icon: "🎬",
  },
  {
    title: "Recruiting Snapshot",
    description:
      "Surface the recruiting and academic information coaches look for — graduation year, GPA, test scores, and recruiting status.",
    icon: "📋",
  },
  {
    title: "Share With the World",
    description:
      "Send coaches, recruiters, and universities a single link to your always-up-to-date athletic identity.",
    icon: "🔗",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
