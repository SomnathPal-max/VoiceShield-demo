import React from 'react';
import { motion } from 'motion/react';

interface MiniMeterProps {
  label: string;
  value: number; // 0-100
  invertGood?: boolean; // if true, high is bad (red). If false, high is good (green).
}

export function MiniMeter({ label, value, invertGood = true }: MiniMeterProps) {
  // If invertGood is true, higher value = higher risk (red).
  // If invertGood is false, higher value = lower risk (green).
  
  let colorClass = 'bg-brand-green';
  if (invertGood) {
    if (value > 40) colorClass = 'bg-yellow-400';
    if (value > 65) colorClass = 'bg-brand-orange';
    if (value > 85) colorClass = 'bg-brand-red';
  } else {
    // High is good
    if (value < 85) colorClass = 'bg-brand-green';
    if (value < 65) colorClass = 'bg-yellow-400';
    if (value < 40) colorClass = 'bg-brand-orange';
    if (value < 20) colorClass = 'bg-brand-red';
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-gray-600 uppercase tracking-wider text-[10px]">{label}</span>
        <span className="text-gray-900">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
