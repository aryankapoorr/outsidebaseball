import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Bubble Background Component
 * Creates floating bubble animations with smooth performance
 * Designed to add subtle texture to section backgrounds
 */
const BubbleBackground = ({ 
  sectionId = 'default',
  bubbleCount = 15,
  colorTheme = 'blue',
  intensity = 'medium',
  className = ''
}) => {
  const [bubbles, setBubbles] = useState([]);

  // Color themes for different sections
  const colorThemes = {
    blue: {
      primary: 'rgba(59, 130, 246, 0.08)',
      secondary: 'rgba(147, 197, 253, 0.06)',
      accent: 'rgba(219, 234, 254, 0.04)',
      border: 'rgba(59, 130, 246, 0.12)'
    },
    purple: {
      primary: 'rgba(147, 51, 234, 0.08)',
      secondary: 'rgba(196, 181, 253, 0.06)',
      accent: 'rgba(233, 213, 255, 0.04)',
      border: 'rgba(147, 51, 234, 0.12)'
    },
    teal: {
      primary: 'rgba(6, 182, 212, 0.08)',
      secondary: 'rgba(103, 232, 249, 0.06)',
      accent: 'rgba(207, 250, 254, 0.04)',
      border: 'rgba(6, 182, 212, 0.12)'
    },
    pink: {
      primary: 'rgba(236, 72, 153, 0.08)',
      secondary: 'rgba(251, 182, 206, 0.06)',
      accent: 'rgba(253, 242, 248, 0.04)',
      border: 'rgba(236, 72, 153, 0.12)'
    },
    amber: {
      primary: 'rgba(245, 158, 11, 0.08)',
      secondary: 'rgba(252, 211, 77, 0.06)',
      accent: 'rgba(254, 243, 199, 0.04)',
      border: 'rgba(245, 158, 11, 0.12)'
    },
    gray: {
      primary: 'rgba(156, 163, 175, 0.08)',
      secondary: 'rgba(209, 213, 219, 0.06)',
      accent: 'rgba(243, 244, 246, 0.04)',
      border: 'rgba(156, 163, 175, 0.12)'
    }
  };

  // Intensity settings
  const intensitySettings = {
    low: { speed: 0.3, scale: 0.8, opacity: 0.4 },
    medium: { speed: 0.5, scale: 1, opacity: 0.6 },
    high: { speed: 0.8, scale: 1.2, opacity: 0.8 }
  };

  const theme = colorThemes[colorTheme] || colorThemes.blue;
  const settings = intensitySettings[intensity] || intensitySettings.medium;

  // Generate bubbles with optimized properties
  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles = Array.from({ length: bubbleCount }, (_, i) => {
        const size = Math.random() * 40 + 10; // 10-50px
        const isLarge = size > 30;
        
        return {
          id: `${sectionId}-bubble-${i}`,
          size,
          x: Math.random() * 100,
          y: Math.random() * 100,
          duration: Math.random() * 15 + 10, // 10-25s for smooth movement
          delay: Math.random() * 5,
          opacity: isLarge ? 0.3 : Math.random() * 0.4 + 0.2,
          blur: isLarge ? 2 : Math.random() * 1 + 0.5,
          type: Math.random() > 0.7 ? 'accent' : Math.random() > 0.4 ? 'secondary' : 'primary',
          floatDistance: Math.random() * 30 + 20,
          rotationSpeed: Math.random() * 2 + 1,
          pulseSpeed: Math.random() * 3 + 2
        };
      });
      setBubbles(newBubbles);
    };

    generateBubbles();
  }, [sectionId, bubbleCount]);

  // Get bubble color based on type
  const getBubbleColor = (bubble) => {
    switch (bubble.type) {
      case 'accent':
        return theme.accent;
      case 'secondary':
        return theme.secondary;
      default:
        return theme.primary;
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none optimize-scroll ${className}`}>
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bubble-optimized"
          style={{
            width: bubble.size * settings.scale,
            height: bubble.size * settings.scale,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            backgroundColor: getBubbleColor(bubble),
            border: `1px solid ${theme.border}`,
            filter: `blur(${bubble.blur}px)`,
            opacity: bubble.opacity * settings.opacity,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -bubble.floatDistance, 0],
            x: [0, bubble.floatDistance * 0.3, -bubble.floatDistance * 0.2, 0],
            scale: [1, 1.1, 0.9, 1],
            opacity: [
              bubble.opacity * settings.opacity,
              (bubble.opacity * settings.opacity) * 1.2,
              (bubble.opacity * settings.opacity) * 0.8,
              bubble.opacity * settings.opacity
            ],
            rotate: [0, 360]
          }}
          transition={{
            duration: bubble.duration * settings.speed,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.3, 0.7, 1]
          }}
        />
      ))}
      
      {/* Additional subtle texture overlay with performance optimization */}
      <motion.div
        className="absolute inset-0 gpu-accelerated"
        style={{
          background: `radial-gradient(circle at 30% 70%, ${theme.primary} 0%, transparent 50%), 
                       radial-gradient(circle at 70% 30%, ${theme.secondary} 0%, transparent 50%),
                       radial-gradient(circle at 50% 50%, ${theme.accent} 0%, transparent 70%)`,
          willChange: 'opacity',
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default BubbleBackground;