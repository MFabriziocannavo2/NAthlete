export default function HighlightFeedPreview() {
    return (
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
  
          <h2 className="text-3xl font-bold mb-6">
            Athlete Highlights
          </h2>
  
          <p className="text-gray-600 mb-10">
            Watch the latest highlights from athletes around the world.
          </p>
  
          <div className="grid md:grid-cols-3 gap-6">
  
            <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
              Highlight Video
            </div>
  
            <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
              Highlight Video
            </div>
  
            <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
              Highlight Video
            </div>
  
          </div>
  
        </div>
      </section>
    );
  }