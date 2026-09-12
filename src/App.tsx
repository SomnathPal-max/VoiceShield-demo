import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, AlertTriangle, ShieldCheck, ShieldAlert, PhoneOff, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Scenario, RiskTier } from './types';
import { scenarios } from './scenarios';
import { CircularGauge } from './components/Gauge';
import { TranscriptPanel } from './components/Transcript';
import { MiniMeter } from './components/MiniMeter';

function getTierFromScore(score: number, override?: RiskTier): RiskTier {
  if (override) return override;
  if (score >= 85) return 'PREVENT';
  if (score >= 60) return 'AUTH';
  if (score >= 30) return 'VERIFY';
  return 'MONITOR';
}

function getTierVisuals(tier: RiskTier) {
  switch (tier) {
    case 'MONITOR': return { bg: 'bg-brand-green/10', text: 'text-brand-green', border: 'border-brand-green/30', label: 'Monitoring', icon: ShieldCheck };
    case 'VERIFY': return { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/30', label: 'Verify Identity', icon: AlertTriangle };
    case 'AUTH': return { bg: 'bg-brand-orange/10', text: 'text-brand-orange', border: 'border-brand-orange/30', label: 'Additional Auth Required', icon: AlertTriangle };
    case 'PREVENT': return { bg: 'bg-brand-red/10', text: 'text-brand-red', border: 'border-brand-red/30', label: 'Action: Prevent', icon: ShieldAlert };
    case 'UNCERTAIN': return { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/30', label: 'Uncertain — Human Review', icon: FileText };
  }
}

function getInterpolatedState(scenario: Scenario, time: number) {
  let prevStep = scenario.steps[0];
  let nextStep = scenario.steps[scenario.steps.length - 1];

  for (let i = 0; i < scenario.steps.length; i++) {
    if (scenario.steps[i].time > time) {
      nextStep = scenario.steps[i];
      prevStep = scenario.steps[i > 0 ? i - 1 : 0];
      break;
    }
  }

  if (time >= nextStep.time) {
    return { score: nextStep.score, signals: nextStep.signals, statusOverride: nextStep.statusOverride };
  }
  if (time <= prevStep.time) {
    return { score: prevStep.score, signals: prevStep.signals, statusOverride: prevStep.statusOverride };
  }

  const progress = (time - prevStep.time) / (nextStep.time - prevStep.time);
  const score = prevStep.score + progress * (nextStep.score - prevStep.score);
  
  const signals = {
    authenticity: prevStep.signals.authenticity + progress * (nextStep.signals.authenticity - prevStep.signals.authenticity),
    match: prevStep.signals.match + progress * (nextStep.signals.match - prevStep.signals.match),
    prosody: prevStep.signals.prosody + progress * (nextStep.signals.prosody - prevStep.signals.prosody),
    conversation: prevStep.signals.conversation + progress * (nextStep.signals.conversation - prevStep.signals.conversation),
  };

  return { score, signals, statusOverride: prevStep.statusOverride };
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function App() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>(scenarios[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [activeModal, setActiveModal] = useState<'firewall' | 'callback' | 'report' | null>(null);
  const [dismissedModals, setDismissedModals] = useState<Set<string>>(new Set());

  const activeScenario = scenarios.find(s => s.id === activeScenarioId)!;
  const { score, signals, statusOverride } = getInterpolatedState(activeScenario, time);
  const currentTier = getTierFromScore(score, statusOverride);
  const tierVisuals = getTierVisuals(currentTier);

  const visibleTranscripts = activeScenario.steps
    .filter(s => s.time <= time && s.transcript)
    .map(s => ({ ...s.transcript!, id: `tr-${s.time}` }));
    
  const visibleAlerts = activeScenario.steps
    .filter(s => s.time <= time && s.alert)
    .map(s => ({ time: s.time, text: s.alert!, hash: s.hash }));

  useEffect(() => {
    if (!isPlaying) return;
    
    if (time >= activeScenario.duration) {
      setIsPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      setTime(t => Math.min(t + 0.5, activeScenario.duration));
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, time, activeScenario.duration]);

  useEffect(() => {
    const latestStep = activeScenario.steps.slice().reverse().find(s => s.time <= time);
    if (latestStep?.modal && !dismissedModals.has(latestStep.modal)) {
      setActiveModal(latestStep.modal);
      setDismissedModals(prev => new Set(prev).add(latestStep.modal!));
    }
  }, [time, activeScenario, dismissedModals]);

  const handleStart = (id: string) => {
    setActiveScenarioId(id);
    setTime(0);
    setIsPlaying(true);
    setActiveModal(null);
    setDismissedModals(new Set());
  };

  const handleReset = () => {
    setTime(0);
    setIsPlaying(false);
    setActiveModal(null);
    setDismissedModals(new Set());
  };

  const handleDownloadReport = () => {
    const reportContent = `INCIDENT ID: V-SHIELD-${activeScenario.id.toUpperCase()}-${Math.floor(time)}
TIMESTAMP: ${new Date().toISOString()}
SCENARIO: ${activeScenario.title}
MAX RISK SCORE: ${Math.max(...activeScenario.steps.map(s => s.score))}%

EVENTS:
${visibleAlerts.map(a => `[${formatTime(a.time)}] ${a.text}`).join('\n')}
`;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VoiceShield_Report_${activeScenario.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActiveModal(null);
  };

  const StatusIcon = tierVisuals.icon;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-800">
      <header className="bg-brand-navy text-white px-4 lg:px-6 py-3 flex items-center justify-between shadow-md z-10 relative">
        <div className="flex items-center gap-2 lg:gap-3">
          <ShieldCheck className="text-brand-green" size={24} />
          <h1 className="text-lg lg:text-xl font-bold tracking-wide">VoiceShield</h1>
          <span className="hidden sm:inline-block ml-2 bg-blue-800 text-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest border border-blue-700">Live Console</span>
        </div>
        <div className="flex items-center gap-2 lg:gap-4 text-xs lg:text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></div>
            <span className="hidden sm:inline">Node: AP-SOUTH-1</span>
            <span className="sm:hidden">AP-SOUTH-1</span>
          </div>
          <div className="hidden sm:block text-gray-400">|</div>
          <div className="hidden sm:block opacity-80">{new Date().toISOString().split('T')[0]}</div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
        <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col shadow-[2px_0_10px_rgba(0,0,0,0.03)] z-10 flex-shrink-0">
          <div className="p-4 border-b border-gray-100 lg:flex-1 lg:overflow-y-auto">
            <div className="flex justify-between items-center mb-3 lg:mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attack Simulator</h2>
              <button 
                onClick={handleReset}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
            <div className="flex lg:flex-col gap-3 overflow-x-auto pb-2 lg:pb-0 snap-x">
              {scenarios.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleStart(s.id)}
                  className={`min-w-[240px] lg:min-w-0 flex-shrink-0 snap-start w-full text-left p-3 rounded-lg border transition-all ${
                    activeScenarioId === s.id 
                      ? 'border-brand-blue bg-blue-50/50 shadow-sm ring-1 ring-brand-blue/20' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-800">{s.title}</div>
                  <div className="text-[10px] text-gray-500 mt-1 leading-tight">{s.description}</div>
                  {activeScenarioId === s.id && isPlaying && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-brand-blue">
                      <div className="w-1.5 h-1.5 bg-brand-blue rounded-full animate-pulse" />
                      SIMULATING
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden lg:block p-4 mt-auto border-t border-gray-100">
             <button 
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
                Reset Dashboard
              </button>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6 flex flex-col overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 lg:h-full">
            <div className="col-span-1 lg:col-span-8 flex flex-col gap-4 lg:gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Call Metadata</h3>
                    <div className="text-2xl font-bold text-gray-800">{activeScenario.callerName}</div>
                    <div className="text-lg text-gray-500 font-medium font-mono mt-1">{activeScenario.callerNumber}</div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Duration</span>
                      <span className="text-lg font-mono font-medium text-brand-navy">{formatTime(time)}</span>
                    </div>
                    {score > 60 && (
                      <button 
                        onClick={() => setActiveModal('callback')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-gray-200"
                      >
                        <PhoneOff size={14} />
                        Trusted Callback
                      </button>
                    )}
                  </div>
                </div>

                <div className={`rounded-xl shadow-sm border p-5 flex flex-col items-center justify-center transition-colors duration-500 relative overflow-hidden ${tierVisuals.bg} ${tierVisuals.border}`}>
                  <div className="absolute top-3 left-4 flex items-center gap-2">
                    <StatusIcon className={tierVisuals.text} size={18} />
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${tierVisuals.text}`}>System Verdict</span>
                  </div>
                  <CircularGauge score={score} tier={currentTier} label="Fraud Risk" />
                  <motion.div 
                    key={currentTier}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`mt-4 px-4 py-1.5 rounded-full border text-sm font-bold tracking-wide shadow-sm ${tierVisuals.bg} ${tierVisuals.text} ${tierVisuals.border}`}
                  >
                    {tierVisuals.label}
                  </motion.div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Biometric & Behavioral Signals</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <MiniMeter label="Voice Authenticity" value={signals.authenticity} invertGood={true} />
                  <MiniMeter label="Speaker Match" value={signals.match} invertGood={false} />
                  <MiniMeter label="Prosody Anomaly" value={signals.prosody} invertGood={true} />
                  <MiniMeter label="Conversation Risk" value={signals.conversation} invertGood={true} />
                </div>
              </div>

              <div className="flex-1 min-h-[400px] lg:min-h-0">
                <TranscriptPanel lines={visibleTranscripts} />
              </div>
            </div>

            <div className="col-span-1 lg:col-span-4 flex flex-col gap-4 lg:gap-6 min-h-[400px] lg:min-h-0 lg:h-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={14} /> Evidence Timeline
                  </h3>
                  {visibleAlerts.length > 0 && (
                    <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{visibleAlerts.length} Events</span>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  {visibleAlerts.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      No anomalies detected yet.
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                      {visibleAlerts.map((alert, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="relative pl-5"
                        >
                          <div className="absolute w-3 h-3 bg-brand-orange rounded-full -left-[7px] top-1.5 ring-4 ring-white" />
                          <div className="text-[10px] text-gray-400 font-mono mb-1">
                            +{formatTime(alert.time)} {alert.hash && <span className="ml-2 text-gray-300">[{alert.hash}]</span>}
                          </div>
                          <div className="text-sm text-gray-800 font-medium leading-snug bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                            {alert.text}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button 
                    onClick={() => setActiveModal('report')}
                    disabled={visibleAlerts.length === 0}
                    className="w-full py-2.5 bg-brand-navy hover:bg-blue-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    Generate Incident Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {activeModal === 'firewall' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-brand-red/20"
            >
              <div className="bg-brand-red text-white p-5 flex items-start gap-4">
                <ShieldAlert size={32} className="shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-bold">SIMULATED SECURITY CONTROL</h2>
                  <p className="text-red-100 text-sm mt-1">Transaction Firewall Triggered</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 font-medium text-center">
                  Transfer of <strong className="text-lg">₹45,000</strong> has been held pending verification.
                </p>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setActiveModal(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">
                    Reject
                  </button>
                  <button onClick={() => setActiveModal(null)} className="flex-1 py-2.5 bg-brand-red text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors shadow-sm">
                    Approve after verification
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeModal === 'callback' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 text-brand-blue rounded-full flex items-center justify-center mb-4">
                  <PhoneOff size={24} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Call Terminated</h2>
                <p className="text-gray-600 text-sm">
                  Recommend calling back via the verified number on file:<br/>
                  <strong className="text-gray-800 mt-2 block text-base">+91-9988776655</strong>
                </p>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="mt-6 w-full py-2.5 bg-brand-blue text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  Callback Initiated
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeModal === 'report' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="text-brand-navy" size={18} />
                  Incident Report Draft
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">For Bank Cyber-Cell</span>
              </div>
              <div className="p-6 space-y-4 text-sm text-gray-600 font-mono bg-gray-900 text-green-400 overflow-x-auto">
                <div>INCIDENT ID: V-SHIELD-{activeScenario.id.toUpperCase()}-{Math.floor(time)}</div>
                <div>TIMESTAMP: {new Date().toISOString()}</div>
                <div>SCENARIO: {activeScenario.title}</div>
                <div>MAX RISK SCORE: {Math.max(...activeScenario.steps.map(s => s.score))}%</div>
                <div className="pt-2 border-t border-green-800/30">EVENTS:</div>
                {visibleAlerts.map((a, i) => (
                  <div key={i} className="pl-4">[{formatTime(a.time)}] {a.text}</div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
                <button 
                  onClick={handleDownloadReport}
                  className="px-6 py-2 bg-brand-navy text-white rounded font-bold text-sm hover:bg-blue-900 transition-colors"
                >
                  Close & Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
