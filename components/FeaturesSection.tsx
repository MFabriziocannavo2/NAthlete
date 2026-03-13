export default function FeaturesSection() {
    return (
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
  
          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-2">Athlete Profiles</h3>
            <p className="text-gray-600">
              Create a profile that showcases your stats, highlights, and achievements.
            </p>
          </div>
  
          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-2">Highlight Videos</h3>
            <p className="text-gray-600">
              Upload your best moments and get discovered by coaches.
            </p>
          </div>
  
          <div className="p-6 bg-white rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-2">Coach Discovery</h3>
            <p className="text-gray-600">
              Coaches can easily search and connect with talented athletes.
            </p>
          </div>
  
        </div>
      </section>
    );
  }