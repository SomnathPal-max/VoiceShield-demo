import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { TranscriptLine } from '../types';
import { User, Headphones } from 'lucide-react';

interface TranscriptPanelProps {
  lines: (TranscriptLine & { id: string })[];
}

export function TranscriptPanel({ lines }: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">Live Transcript</h3>
        <span className="flex items-center gap-2 text-xs text-brand-green bg-green-50 px-2 py-1 rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse"></span>
          Live Feed
        </span>
      </div>
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {lines.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Waiting for audio...
          </div>
        )}
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col max-w-[85%] ${line.speaker === 'User' ? 'self-start' : 'self-end items-end ml-auto'}`}
          >
            <div className={`flex items-center gap-1.5 mb-1 text-xs font-medium ${line.speaker === 'User' ? 'text-brand-navy' : 'text-gray-500'}`}>
              {line.speaker === 'User' ? <Headphones size={12} /> : <User size={12} />}
              {line.speaker}
            </div>
            <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
              line.speaker === 'User' 
                ? 'bg-blue-50 text-blue-900 rounded-tl-none border border-blue-100' 
                : 'bg-gray-100 text-gray-800 rounded-tr-none border border-gray-200'
            }`}>
              {line.text}
            </div>
            {line.tag && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-1.5 bg-brand-red/10 text-brand-red border border-brand-red/20 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
              >
                FLAG: {line.tag}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
