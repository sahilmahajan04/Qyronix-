/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface GradientCanvasProps {
  isDark: boolean;
}

export default function GradientCanvas({ isDark }: GradientCanvasProps) {
  return (
    <div className={`fixed inset-0 -z-50 overflow-hidden transition-colors duration-700 ${isDark ? 'bg-[#03020A]' : 'bg-[#F8F9FD]'}`}>
      
      {/* Glow Ambient Blobs Container */}
      <div className="absolute inset-0 opacity-40 blur-[130px] sm:opacity-50 md:blur-[160px]">
        
        {/* Sky Blue Blob */}
        <div 
          style={{ id: 'blob-blue' }}
          className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full animate-aurora-slow transition-colors duration-700 ${
            isDark ? 'bg-aurora-blue/25' : 'bg-aurora-blue/15'
          }`}
        />
        
        {/* Neon Cyan Blob */}
        <div 
          style={{ id: 'blob-cyan' }}
          className={`absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full animate-aurora-reverse transition-colors duration-700 ${
            isDark ? 'bg-aurora-cyan/20' : 'bg-aurora-cyan/12'
          }`}
        />

        {/* Space Purple Blob */}
        <div 
          style={{ id: 'blob-purple' }}
          className={`absolute top-[20%] right-[10%] w-[55vw] h-[55vw] rounded-full animate-aurora-slow transition-colors duration-700 ${
            isDark ? 'bg-aurora-purple/20' : 'bg-aurora-purple/15'
          }`}
        />

        {/* Core Center Pulse Accent */}
        <div 
          style={{ id: 'blob-pulse' }}
          className={`absolute top-[40%] left-[25%] w-[35vw] h-[35vw] rounded-full animate-pulse-slow transition-colors duration-700 ${
            isDark ? 'bg-[#3b82f6]/10' : 'bg-[#3b82f6]/5'
          }`}
        />
      </div>

      {/* Cyber Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none" 
        style={{ 
          backgroundImage: `
            radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0),
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px, 40px 40px, 40px 40px',
        }}
      />
    </div>
  );
}
