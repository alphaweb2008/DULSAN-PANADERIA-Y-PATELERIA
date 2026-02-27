import React from 'react';

interface LoadingScreenProps {
  logoUrl?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ logoUrl }) => {
  return (
    <div className="fixed inset-0 bg-[#FFE3ED] flex flex-col items-center justify-center z-50">
      {/* Logo de Dulsan */}
      <div className="mb-8">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Dulsan Pastelería y Panadería"
            className="w-32 h-32 md:w-40 md:h-40 object-contain animate-pulse"
          />
        ) : (
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white border-4 border-[#D14D72] flex items-center justify-center">
            <span className="text-4xl md:text-5xl font-playfair font-bold text-[#D14D72]">D</span>
          </div>
        )}
      </div>

      {/* Bolitas rosadas saltando */}
      <div className="flex gap-3">
        <div className="w-4 h-4 md:w-5 md:h-5 bg-[#D14D72] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-4 h-4 md:w-5 md:h-5 bg-[#D14D72] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-4 h-4 md:w-5 md:h-5 bg-[#D14D72] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>

      {/* Texto de carga */}
      <p className="mt-6 text-[#D14D72] font-playfair italic text-lg md:text-xl">
        Cargando sabores...
      </p>
    </div>
  );
};
