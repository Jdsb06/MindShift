import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

function RevealBlock({ title, subtitle, image, reverse = false, isDark }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    if (node) obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`grid md:grid-cols-2 gap-8 items-center py-16 ${reverse ? 'md:flex-row-reverse' : ''}`}>
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <h3 className={`${isDark ? 'text-white' : 'text-gray-900'} text-2xl sm:text-3xl font-bold mb-3`}>{title}</h3>
        <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-lg leading-relaxed`}>{subtitle}</p>
      </div>
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className={`relative rounded-xl overflow-hidden border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
          <img src={image} alt="UI mockup" className="w-full h-auto object-cover" />
        </div>
      </div>
    </div>
  );
}

export default function RevealNarrative() {
  const { isDark } = useTheme();
  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <RevealBlock
        isDark={isDark}
        title="Start with Intention"
        subtitle="Your Compass grounds every action in your long-term goals."
        image="/mock-compass.jpg"
      />
      <RevealBlock
        isDark={isDark}
        reverse
        title="Build Your Momentum"
        subtitle="Celebrate small wins to create a positive, shame-free feedback loop."
        image="/mock-log.jpg"
      />
      <RevealBlock
        isDark={isDark}
        title="Gain Gentle Clarity"
        subtitle="Our AI Coach helps you see your patterns, without judgment."
        image="/mock-ai.jpg"
      />
    </section>
  );
} 
