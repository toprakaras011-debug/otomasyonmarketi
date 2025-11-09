import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface HoloIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  gradientFrom?: string;
  gradientTo?: string;
  gradientClass?: string;
  className?: string;
  iconColor?: string;
}

const sizeMap = {
  sm: {
    container: 'h-14 w-14',
    ringInset: '-inset-[6px]',
    glowInset: '-inset-[18px]',
    icon: 'h-7 w-7',
  },
  md: {
    container: 'h-16 w-16',
    ringInset: '-inset-[7px]',
    glowInset: '-inset-[22px]',
    icon: 'h-8 w-8',
  },
  lg: {
    container: 'h-20 w-20',
    ringInset: '-inset-[9px]',
    glowInset: '-inset-[28px]',
    icon: 'h-10 w-10',
  },
} as const;

const defaultGradientFrom = '#8b5cf6';
const defaultGradientTo = '#2563eb';

export function HoloIcon({
  icon: Icon,
  size = 'md',
  gradientFrom = defaultGradientFrom,
  gradientTo = defaultGradientTo,
  gradientClass,
  className = '',
  iconColor,
}: HoloIconProps) {
  const sizeStyles = sizeMap[size];
  const tailwindGradientClass = gradientClass ?? `from-[${gradientFrom}] to-[${gradientTo}]`;
  const resolvedIconColor = iconColor ?? '#ffffff';

  return (
    <motion.div
      className={`group relative inline-flex ${className}`}
      whileHover={{ scale: 1.08, rotate: 2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <motion.div
        className={`absolute ${sizeStyles.glowInset} rounded-[2.5rem] opacity-70 blur-3xl`}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${gradientFrom}33, transparent 65%)`,
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className={`absolute ${sizeStyles.ringInset} rounded-[2rem]`}
        style={{
          background: `conic-gradient(from 0deg, ${gradientFrom}, ${gradientTo}, ${gradientFrom})`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      <div
        className={`relative flex ${sizeStyles.container} items-center justify-center rounded-[1.6rem] bg-gradient-to-br ${tailwindGradientClass} shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] border border-white/5`}
      >
        <div className="absolute inset-0 rounded-[1.6rem] bg-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <Icon
          className={`${sizeStyles.icon} relative z-10 drop-shadow-[0_10px_18px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-110`}
          strokeWidth={2.4}
          style={{ color: resolvedIconColor, stroke: resolvedIconColor }}
        />
      </div>

      <motion.div
        className="absolute -bottom-3 right-1 h-2 w-2 rounded-full bg-white/70 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.4, 0.85, 0.4],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />
    </motion.div>
  );
}
