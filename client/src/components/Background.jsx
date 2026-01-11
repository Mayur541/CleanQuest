const Background = () => {
  return (
    <div className="fixed inset-0 z-[-1] transition-colors duration-300 pointer-events-none overflow-hidden">
      {/* 1. BASE COLOR */}
      <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900 transition-colors duration-300" />

      {/* 2. STRONGER PATTERN OVERLAY */}
      <div className="absolute inset-0 opacity-[0.6] dark:opacity-[0.2]"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M40 40c0-8.8-7.2-16-16-16S8 31.2 8 40s7.2 16 16 16 16-7.2 16-16zm0 0c0 8.8 7.2 16 16 16s16-7.2 16-16-7.2-16-16-16-16 7.2-16 16zm-32 0c0-8.8-7.2-16-16-16S-16 31.2-16 40s7.2 16 16 16 16-7.2 16-16zm0 0c0 8.8 7.2 16 16 16s16-7.2 16-16-7.2-16-16-16-16 7.2-16 16z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
        }}
      />

      {/* 3. VIGNETTE GRADIENT (Makes center brighter) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-gray-100/60 to-gray-200/90 dark:via-gray-900/60 dark:to-black/90" />
    </div>
  );
};

export default Background;