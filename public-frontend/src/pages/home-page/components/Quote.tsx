import React from 'react';
import { FaQuoteLeft } from 'react-icons/fa';

const Quote = () => {
  return (
    <section className="bg-background py-24 px-4 md:px-8 overflow-hidden select-none">
      <div className="max-w-[1400px] mx-auto">
        <div className="relative bg-[#0B0F19] text-white rounded-[32px] p-12 md:p-20 text-center overflow-hidden shadow-2xl border border-white/[0.03]">
          
          {/* Editorial Background Ambient Light */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Centralized Icon Framing */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 mb-8 shadow-inner">
              <FaQuoteLeft size={14} />
            </div>

            {/* Premium Large Editorial Type */}
            <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl max-w-4xl mx-auto leading-relaxed font-light tracking-wide text-white/90">
              “A reader lives a thousand lives before he dies. <span className="italic font-normal text-white">The man who never reads</span> lives only one.”
            </blockquote>

            {/* Minimalist Separator Dot */}
            <div className="flex items-center gap-1.5 my-8">
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="h-1 w-6 rounded-full bg-white/40" />
              <span className="h-1 w-1 rounded-full bg-white/20" />
            </div>

            {/* Author Attribution Layer */}
            <cite className="block text-white/60 font-sans text-xs md:text-sm font-semibold tracking-[0.2em] uppercase not-italic">
              George R.R. Martin
            </cite>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Quote;