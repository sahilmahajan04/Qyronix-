/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  isDark: boolean;
  className?: string;
  delay?: number;
  key?: React.Key;
}

export default function GlassCard({ children, isDark, className = '', delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl p-6 md:p-8 transition-all duration-300 ${
        isDark ? 'glass-card-dark hover:border-aurora-purple/30' : 'glass-card-light hover:border-aurora-purple/20'
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
