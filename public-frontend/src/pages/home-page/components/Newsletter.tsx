import React, { useState } from 'react';
import { FiMail, FiArrowRight } from 'react-icons/fi';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribed email:', email);
    // Add newsletter subscription logic here
    setEmail('');
  };

  return (
    <section className="bg-background py-24 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-card-bg border border-ui-muted/15 rounded-[2rem] p-10 md:p-16 transition-all duration-300 max-w-5xl mx-auto relative overflow-hidden shadow-2xs hover:shadow-xs">
          
          {/* Ambient Background Flare */}
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-ui-dark/[0.02] rounded-full blur-3xl pointer-events-none" />

          {/* Core Content Grid */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
            
            {/* Left Column: Typography Layout */}
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-[1px] w-4 bg-ui-dark/40" />
                <span className="font-sans text-[10px] uppercase tracking-widest text-ui-dark font-bold">Dispatch Insights</span>
              </div>
              <h2 className="font-serif text-heading text-3xl md:text-4xl font-normal tracking-tight">
                Stay <span className="italic font-light text-ui-muted">Updated</span>
              </h2>
              <p className="text-ui-muted font-sans text-xs md:text-sm mt-3 leading-relaxed font-normal">
                Get premium alerts on upcoming independent store releases, exclusive literary content updates, and curated seasonal arrivals.
              </p>
            </div>

            {/* Right Column: Premium Form Action Module */}
            <form 
              onSubmit={handleSubscribe}
              className="w-full lg:max-w-md flex flex-col sm:flex-row gap-3"
            >
              {/* Input Wrapper Container */}
              <div className="relative flex-1 group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-background border border-ui-muted/20 text-heading placeholder:text-ui-muted/40 font-sans text-xs rounded-xl pl-11 pr-4 py-3.5 transition-all duration-300 outline-none focus:bg-card-bg focus:border-ui-dark focus:ring-4 focus:ring-ui-dark/5 shadow-inner font-medium"
                />
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-ui-muted/50 group-focus-within:text-ui-dark transition-colors duration-200 text-sm pointer-events-none" />
              </div>

              {/* Action Dispatcher Trigger */}
              <button 
                type="submit"
                className="bg-ui-dark text-card-bg font-sans font-semibold text-xs px-6 py-3.5 rounded-xl hover:bg-ui-dark/90 active:scale-[0.97] transition-all duration-200 shadow-xs cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 group/btn"
              >
                <span>Subscribe</span>
                <FiArrowRight size={13} className="transform group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </form>
            
          </div>

        </div>
      </div>
    </section>
  );
};

export default Newsletter;