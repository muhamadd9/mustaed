import { useState, useEffect } from 'react';
import WhatsAppIcon from './icons/WhatsAppIcon';

const WhatsAppButton = () => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Delay entrance so it pops in after the page loads
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed left-6 bottom-6 z-50 flex items-center gap-3"
      style={{
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.5)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease',
      }}
    >
      {/* Tooltip label */}
      <div
        className="bg-white text-green-700 text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg border border-green-100 whitespace-nowrap pointer-events-none"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0) scale(1)' : 'translateX(8px) scale(0.95)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        تواصل معنا
      </div>

      {/* Button with pulse rings */}
      <a
        href="https://wa.me/966563866234"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل عبر واتساب"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg"
        style={{
          transform: hovered ? 'scale(1.12)' : 'scale(1)',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
          boxShadow: hovered
            ? '0 8px 30px rgba(34,197,94,0.5)'
            : '0 4px 16px rgba(34,197,94,0.35)',
        }}
      >
        {/* Pulse ring 1 */}
        <span
          className="absolute inset-0 rounded-full bg-green-400"
          style={{ animation: 'wa-pulse 2.2s ease-out infinite' }}
        />
        {/* Pulse ring 2 - delayed */}
        <span
          className="absolute inset-0 rounded-full bg-green-400"
          style={{ animation: 'wa-pulse 2.2s ease-out infinite 0.7s' }}
        />

        <WhatsAppIcon className="w-7 h-7 relative z-10" />
      </a>

      <style>{`
        @keyframes wa-pulse {
          0%   { transform: scale(1); opacity: 0.6; }
          70%  { transform: scale(1.9); opacity: 0; }
          100% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppButton;
