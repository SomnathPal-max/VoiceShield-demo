export type RiskTier = 'MONITOR' | 'VERIFY' | 'AUTH' | 'PREVENT' | 'UNCERTAIN';

export interface SignalLevels {
  authenticity: number;
  match: number;
  prosody: number;
  conversation: number;
}

export interface TranscriptLine {
  speaker: 'User' | 'Caller';
  text: string;
  tag?: string; // E.g., 'OTP REQUEST', 'URGENCY'
}

export interface ScriptStep {
  time: number; // in seconds
  score: number; // 0-100
  signals: SignalLevels;
  transcript?: TranscriptLine;
  alert?: string;
  modal?: 'firewall' | 'callback';
  statusOverride?: RiskTier;
  hash?: string; // Mock SHA-256 hash for evidence
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  callerName: string;
  callerNumber: string;
  duration: number; // max time in seconds
  steps: ScriptStep[];
}
