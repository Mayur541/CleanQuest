const Background = () => {
  return (
    <div className="fixed inset-0 z-[-1] transition-colors duration-300 pointer-events-none">
      {/* 1. BASE BACKGROUND COLORS 
         Light: Very light gray/green | Dark: Deep gray/black
      */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-300" />

      {/* 2. PATTERN OVERLAY (SVG)
         We use a subtle SVG pattern. 
         - In Light Mode: It is very faint green/gray.
         - In Dark Mode: It is faint charcoal to add texture.
      */}
      <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* 3. VIGNETTE / GRADIENT OVERLAY
         This adds a professional 'glow' to the center and dims the corners.
      */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-green-50/30 to-transparent dark:from-transparent dark:via-green-900/10 dark:to-transparent" />
    </div>
  );
};

export default Background;