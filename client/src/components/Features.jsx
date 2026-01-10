import React from 'react';

const Features = () => {
  const steps = [
    {
      id: 1,
      title: "Snap a Photo",
      desc: "See garbage? Take a clear picture using your phone's camera.",
      icon: "📸",
    },
    {
      id: 2,
      title: "Add Location",
      desc: "We use your GPS to pinpoint the exact location of the waste.",
      icon: "📍",
    },
    {
      id: 3,
      title: "We Clean It",
      desc: "Our municipal team gets alerted and dispatched to clean it up.",
      icon: "🚛",
    },
    {
      id: 4,
      title: "Earn Respect",
      desc: "Get updates when it's done and climb the City Heroes leaderboard.",
      icon: "🏆",
    },
  ];

  return (
    // DARK MODE: Added dark:bg-gray-900
    <section className="py-20 px-4 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            How CleanQuest Works
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Reporting waste shouldn't be hard. We've streamlined the process to take less than 30 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div 
              key={step.id} 
              // DARK MODE: Card Background & Text
              className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl transition hover:-translate-y-2 hover:shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-sm">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;