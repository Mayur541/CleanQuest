// client/src/components/Features.jsx
function Features() {
  const steps = [
    {
      id: 1,
      title: "Snap a Photo",
      desc: "See garbage piling up? Take a clear photo using your phone's camera.",
      icon: "📸",
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 2,
      title: "Upload & Report",
      desc: "Share your location and details. Our system instantly alerts the nearest team.",
      icon: "📍",
      color: "bg-green-100 text-green-600"
    },
    {
      id: 3,
      title: "Get it Solved",
      desc: "Track the status in real-time. Watch as our teams clean up your neighborhood.",
      icon: "✅",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            How CleanQuest Works
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Three simple steps to a cleaner city.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.id} className="relative group bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
              
              {/* Floating Icon */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 ${step.color} shadow-sm group-hover:scale-110 transition duration-300`}>
                {step.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              
              <p className="text-gray-500 leading-relaxed">
                {step.desc}
              </p>

              {/* Step Number Background Effect */}
              <div className="absolute top-4 right-4 text-9xl font-bold text-gray-50 opacity-5 -z-10 select-none">
                {step.id}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Features;