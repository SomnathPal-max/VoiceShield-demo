import React from 'react';
import { motion } from 'motion/react';
import { RiskTier } from '../types';

interface GaugeProps {
  score: number; // 0 to 100
  tier: RiskTier;
  label: string;
}

export function CircularGauge({ score, tier, label }: GaugeProps) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'text-brand-green';
  if (tier === 'VERIFY') colorClass = 'text-yellow-500';
  if (tier === 'AUTH') colorClass = 'text-brand-orange';
  if (tier === 'PREVENT') colorClass = 'text-brand-red';
  if (tier === 'UNCERTAIN') colorClass = 'text-gray-500';

  return (
    <div className="relative flex flex-col items-center justify-center w-56 h-56 sm:w-64 sm:h-64 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
        <circle
          className="text-gray-200 stroke-current"
          strokeWidth="12"
          cx="100"
          cy="100"
          r={radius}
          fill="transparent"
        ></circle>
        <motion.circle
          className={`${colorClass} stroke-current drop-shadow-sm`}
          strokeWidth="12"
          strokeLinecap="round"
          cx="100"
          cy="100"
          r={radius}
          fill="transparent"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        ></motion.circle>
      </svg>
      <div className="absolute flex flex-col items-center justify-center inset-0">
        <motion.span 
          className="text-5xl font-bold text-gray-800"
        >
          {Math.round(score)}%
        </motion.span>
        <span className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}
