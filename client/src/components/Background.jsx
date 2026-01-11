const Background = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      {/* 1. Base Layer (Light Gray / Dark Gray) */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-300" />

      {/* 2. The Pattern (Green Dots) 
          If you can see this, the pattern works. 
      */}
      <div 
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.3]"
        style={{
          // Creates a grid of small green dots
          backgroundImage: 'radial-gradient(#16a34a 1.5px, transparent 1.5px)',
          backgroundSize: '30px 30px' // Distance between dots
        }}
      />
      
      {/* 3. Subtle Fade (Vignette) so it's not too distracting */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white/80 dark:via-gray-900/50 dark:to-gray-900/90" />
    </div>
  );
};

export default Background;