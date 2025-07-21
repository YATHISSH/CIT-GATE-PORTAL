'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ScrollText, Clock, Wifi, Monitor, AlertTriangle } from 'lucide-react';

interface InstructionsPageProps {
  params: { testId: string };
}

const InstructionsPage: React.FC<InstructionsPageProps> = ({ params }) => {
  const router = useRouter();
  const { testId } = params;
  const [isLoading, setIsLoading] = useState(false);
  const [animateWarning, setAnimateWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateWarning(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStartTest = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.replace(`/student/take-test/${testId}`);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-slate-900 overflow-hidden">
      {/* Enhanced radial gradient with better color combination */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 100% at 50% 0%, rgba(59, 130, 246, 0.15), rgba(15, 23, 42, 0)),
            radial-gradient(ellipse 80% 80% at 20% 50%, rgba(139, 92, 246, 0.1), rgba(15, 23, 42, 0)),
            radial-gradient(ellipse 60% 60% at 80% 50%, rgba(59, 130, 246, 0.08), rgba(15, 23, 42, 0))
          `
        }}
      />

      {/* Subtle floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Main card with glassmorphism effect */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Subtle border glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl"></div>
            <div className="absolute inset-[1px] bg-slate-900/80 rounded-3xl backdrop-blur-xl"></div>
            
            <div className="relative z-10">
              {/* Header with enhanced styling */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg">
                    <ShieldAlert className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-white">
                    Test Instructions
                  </h1>
                </div>
                <div className="h-1 w-32 bg-blue-500 rounded-full mx-auto"></div>
              </div>

              {/* Instructions grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* General Instructions */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                      <ScrollText className="w-6 h-6 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">General Instructions</h2>
                  </div>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Test begins immediately after clicking <br></br><strong className="text-white">                  'I Understand, Start Test'</strong></span>
                    </li>

                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>All questions are <strong className="text-white">mandatory</strong> and must be answered</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Review your answers before final submission</span>
                    </li>
                  </ul>
                </div>
                {/* System Requirements */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                      <Monitor className="w-6 h-6 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">System Requirements</h2>
                  </div>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <Wifi className="w-4 h-4 text-blue-400 mt-1" />
                      <span>Stable internet connection required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-blue-400 mt-1" />
                      <span>Quiet environment recommended</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Monitor className="w-4 h-4 text-blue-400 mt-1" />
                      <span>Full screen mode will be activated</span>
          
                    </li>
                    <li className="flex items-start gap-2">
                      <Monitor className="w-4 h-4 text-blue-400 mt-1" />
                      <span>Close all unnecessary applications and browser tabs</span>
          
                    </li>
                  </ul>
                </div>
              </div>

              {/* Critical Warning Section */}
              <div className={`relative overflow-hidden rounded-2xl mb-8 transition-all duration-1000 ${animateWarning ? 'shadow-2xl shadow-red-500/50' : 'shadow-xl shadow-red-500/30'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-orange-600/20 to-red-600/20 animate-pulse"></div>
                <div className="relative backdrop-blur-sm bg-red-900/30 border-2 border-red-500/50 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full transition-all duration-500 ${animateWarning ? 'bg-red-500 scale-110' : 'bg-red-600 scale-100'}`}>
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-red-300">⚠️ CRITICAL WARNING</h3>
                      <div className="h-0.5 w-20 bg-red-500 rounded-full mt-1"></div>
                    </div>
                  </div>
                  <div className="bg-red-950/50 rounded-xl p-4 border border-red-500/30">
                    <p className="text-red-200 text-lg leading-relaxed">
                      <strong className="text-red-100">Exiting fullscreen mode</strong> or <strong className="text-red-100">switching tabs</strong> will 
                      <span className="text-red-300 font-bold"> immediately lock your test</span> and trigger automatic submission.
                    </p>
                    <p className="text-red-300 mt-2 font-semibold">
                      ⚡ No warnings will be shown - the test will submit instantly!
                    </p>
                  </div>
                </div>
              </div>

              {/* Start Test Button */}
              <div className="text-center">
                <button
  onClick={handleStartTest}
  disabled={isLoading}
  className={`relative group overflow-hidden px-12 py-4 rounded-full font-bold text-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-400/30 ${
    isLoading 
      ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
      : 'bg-slate-800 hover:bg-green-600 text-white border border-slate-600 hover:border-green-700 shadow-lg hover:shadow-xl hover:shadow-green-500/20'
  }`}
>
  <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
  <div className="relative flex items-center justify-center gap-3">
    {isLoading ? (
      <>
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span className="text-white">Loading Test...</span>
      </>
    ) : (
      <>

        <span className="text-white">I Understand, Start Test</span>
      </>
    )}
  </div>
</button>
              </div>

              {/* Additional info */}
              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                  By clicking "Start Test", you acknowledge that you have read and understood all instructions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InstructionsPage;