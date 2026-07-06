import React, { useEffect, useState } from 'react';
import { ArrowRight, Zap, Package, Truck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-purple-500 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-blue-600 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
            <div className="space-y-4">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                  🚀 Next Generation 3D Printing
                </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Bring Your <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Ideas to Life</span>
              </h1>
              
              <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                Premium 3D printing services with professional-grade products. From prototypes to final products, we deliver exceptional quality and precision.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
              >
                Shop Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-8 py-4 border border-slate-600 hover:border-slate-400 text-white font-semibold rounded-lg transition-all hover:bg-slate-800/50"
              >
                Learn More
              </Link>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8">
              {[
                { icon: Zap, label: 'Fast Turnaround' },
                { icon: Package, label: 'Premium Quality' },
                { icon: Truck, label: 'Quick Delivery' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <feature.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - 3D visualization placeholder */}
          <div className="relative h-96 sm:h-full min-h-[500px] hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-500/20 flex items-center justify-center overflow-hidden group">
              {/* Animated 3D-like illustration */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Geometric shapes animation */}
                <div className="absolute w-48 h-48 bg-blue-500/30 rounded-3xl transform rotate-45 group-hover:rotate-45 transition-transform duration-500" style={{ animation: 'float 6s ease-in-out infinite' }}></div>
                <div className="absolute w-32 h-32 bg-purple-500/30 rounded-full transform group-hover:scale-110 transition-transform duration-500" style={{ animation: 'float 4s ease-in-out infinite', animationDelay: '1s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center z-10">
                    <Award className="w-24 h-24 text-blue-400 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-300 font-semibold">Premium 3D Printing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce z-20">
        <p className="text-sm text-slate-400">Scroll to explore</p>
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

export default Hero;
