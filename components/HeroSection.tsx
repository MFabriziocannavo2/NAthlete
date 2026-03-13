export default function HeroSection() {
    return (
      <section className="py-24 px-6 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Get Discovered. Get Recruited.
        </h1>
  
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Athletes showcase highlights. Coaches discover the next generation of talent.
        </p>
  
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Create Athlete Profile
          </button>
  
          <button className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100">
            Search Players
          </button>
        </div>
      </section>
    );
  }