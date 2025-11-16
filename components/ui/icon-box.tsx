import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface IconBoxProps {
  icon: LucideIcon;
  gradient?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-20 w-20',
  lg: 'h-24 w-24',
};

const iconSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export function IconBox({ 
  icon: Icon, 
  gradient = 'from-purple-600 to-blue-600',
  size = 'md',
  className = ''
}: IconBoxProps) {
  return (
    <motion.div 
      className={`group relative inline-flex ${className}`}
      whileHover={{ scale: 1.08, rotate: 3 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {/* Powerful outer glow */}
      <motion.div
        className={`absolute -inset-6 rounded-[2rem] bg-gradient-to-br ${gradient} blur-3xl`}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Rotating gradient ring */}
      <motion.div
        className="absolute -inset-[3px] rounded-[1.5rem]"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${gradient.includes('purple') ? '#a855f7' : '#3b82f6'}, transparent)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Main icon container - BOLD gradient, clean and crisp */}
      <div className={`relative flex ${sizeClasses[size]} items-center justify-center rounded-[1.5rem] bg-gradient-to-br ${gradient} shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.6)]`}>
        {/* Metallic shine overlay - static */}
        <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-white/30 via-transparent to-black/20" />
        
        {/* Icon - crisp and bold */}
        <Icon 
          className={`${iconSizes[size]} relative z-10 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]`} 
          strokeWidth={2.5} 
        />
        
        {/* Subtle top highlight - static */}
        <div className="absolute inset-x-0 top-0 h-1/3 rounded-t-[1.5rem] bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </motion.div>
  );
}
