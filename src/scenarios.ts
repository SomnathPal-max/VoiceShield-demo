import { Scenario } from './types';

function generateHash() {
  return Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6);
}

export const scenarios: Scenario[] = [
  {
    id: 'genuine',
    title: '1. Genuine Call',
    description: 'Normal customer interaction. Score stays low, signals remain stable.',
    callerName: 'Rajesh Kumar',
    callerNumber: '+91-9876543210',
    duration: 45,
    steps: [
      { time: 0, score: 5, signals: { authenticity: 10, match: 95, prosody: 5, conversation: 5 } },
      { time: 5, score: 5, signals: { authenticity: 12, match: 94, prosody: 6, conversation: 5 }, transcript: { speaker: 'User', text: 'Welcome to Global Bank. How may I assist you today?' } },
      { time: 10, score: 8, signals: { authenticity: 15, match: 92, prosody: 8, conversation: 8 }, transcript: { speaker: 'Caller', text: 'Hi, I need to check the balance on my savings account.' } },
      { time: 18, score: 12, signals: { authenticity: 10, match: 96, prosody: 4, conversation: 10 }, transcript: { speaker: 'User', text: 'Sure, I can help with that. Could you confirm your date of birth?' } },
      { time: 25, score: 10, signals: { authenticity: 8, match: 95, prosody: 5, conversation: 6 }, transcript: { speaker: 'Caller', text: 'It\'s 14th August, 1985.' } },
      { time: 35, score: 10, signals: { authenticity: 9, match: 95, prosody: 5, conversation: 5 }, transcript: { speaker: 'User', text: 'Thank you. Your current balance is ₹45,200.' } },
      { time: 45, score: 10, signals: { authenticity: 9, match: 95, prosody: 5, conversation: 5 } }
    ]
  },
  {
    id: 'replay',
    title: '2. Replay Attack',
    description: 'A recorded snippet of a real voice is replayed. Speaker Match is suspiciously static.',
    callerName: 'Priya Sharma (Unverified)',
    callerNumber: '+91-9988776655',
    duration: 45,
    steps: [
      { time: 0, score: 15, signals: { authenticity: 20, match: 99, prosody: 30, conversation: 15 } },
      { time: 5, score: 15, signals: { authenticity: 20, match: 99, prosody: 35, conversation: 15 }, transcript: { speaker: 'User', text: 'Hello, am I speaking with Priya?' } },
      { time: 12, score: 35, signals: { authenticity: 30, match: 100, prosody: 45, conversation: 40 }, transcript: { speaker: 'Caller', text: 'Yes, this is Priya. I need to transfer funds.' }, alert: 'Unnatural repetition pattern detected in voice signal', hash: generateHash() },
      { time: 22, score: 52, signals: { authenticity: 40, match: 100, prosody: 60, conversation: 55 }, transcript: { speaker: 'User', text: 'Alright, for security, what is your mother\'s maiden name?' } },
      { time: 30, score: 65, signals: { authenticity: 50, match: 100, prosody: 85, conversation: 70 }, transcript: { speaker: 'Caller', text: 'Yes, this is Priya. I need to transfer funds.' }, modal: 'callback', hash: generateHash() },
      { time: 45, score: 65, signals: { authenticity: 50, match: 100, prosody: 85, conversation: 70 } }
    ]
  },
  {
    id: 'aiclone',
    title: '3. AI Voice Clone',
    description: 'Deepfake voice clone attempting a high-value transfer. Flagship demo scenario.',
    callerName: 'Amit Desai (Spoofed)',
    callerNumber: '+91-9123456789',
    duration: 55,
    steps: [
      { time: 0, score: 12, signals: { authenticity: 15, match: 80, prosody: 10, conversation: 15 } },
      { time: 5, score: 12, signals: { authenticity: 18, match: 78, prosody: 15, conversation: 20 }, transcript: { speaker: 'Caller', text: 'Hello, this is Amit Desai, bank manager from the regional branch.' }, hash: generateHash() },
      { time: 15, score: 31, signals: { authenticity: 35, match: 60, prosody: 25, conversation: 45 }, transcript: { speaker: 'Caller', text: 'We have an urgent compliance issue. Please stay on the line.', tag: 'URGENCY' }, hash: generateHash() },
      { time: 25, score: 58, signals: { authenticity: 75, match: 45, prosody: 50, conversation: 60 }, transcript: { speaker: 'User', text: 'Sir, I don\'t see a ticket for this in my system.' }, alert: 'Synthetic voice signature detected', hash: generateHash() },
      { time: 35, score: 82, signals: { authenticity: 90, match: 30, prosody: 65, conversation: 95 }, transcript: { speaker: 'Caller', text: 'I am overriding it. Provide the OTP sent to your terminal immediately.', tag: 'OTP REQUEST' }, modal: 'firewall', alert: 'OTP request flagged in transcript', hash: generateHash() },
      { time: 45, score: 94, signals: { authenticity: 95, match: 10, prosody: 80, conversation: 99 }, alert: 'Call flagged as high-risk impersonation — transaction held', hash: generateHash() },
      { time: 55, score: 94, signals: { authenticity: 95, match: 10, prosody: 80, conversation: 99 } }
    ]
  },
  {
    id: 'human',
    title: '4. Human Impersonator',
    description: 'A real human scammer. No AI audio, but fails speaker match and triggers conversation risk.',
    callerName: 'Unknown (Claiming: Sanjay)',
    callerNumber: 'Private Number',
    duration: 50,
    steps: [
      { time: 0, score: 20, signals: { authenticity: 5, match: 30, prosody: 10, conversation: 30 } },
      { time: 6, score: 25, signals: { authenticity: 5, match: 20, prosody: 15, conversation: 40 }, transcript: { speaker: 'Caller', text: 'Listen, I am Sanjay from the IT department.' }, hash: generateHash() },
      { time: 15, score: 45, signals: { authenticity: 8, match: 15, prosody: 12, conversation: 60 }, transcript: { speaker: 'Caller', text: 'You need to grant me remote access to fix a security breach right now.', tag: 'AUTHORITY CLAIM' }, hash: generateHash() },
      { time: 25, score: 70, signals: { authenticity: 10, match: 5, prosody: 20, conversation: 85 }, transcript: { speaker: 'User', text: 'I need to verify this with my supervisor first.' } },
      { time: 35, score: 88, signals: { authenticity: 12, match: 2, prosody: 25, conversation: 95 }, transcript: { speaker: 'Caller', text: 'Do not tell anyone, this is a confidential internal audit!', tag: 'SECRECY REQUEST' }, alert: 'High conversational risk detected', hash: generateHash() },
      { time: 50, score: 88, signals: { authenticity: 12, match: 2, prosody: 25, conversation: 95 } }
    ]
  },
  {
    id: 'ambiguous',
    title: '5. Ambiguous / Uncertain',
    description: 'Signals conflict resulting in an uncertain state routed to human review.',
    callerName: 'Neha Gupta',
    callerNumber: '+91-8877665544',
    duration: 40,
    steps: [
      { time: 0, score: 25, signals: { authenticity: 30, match: 70, prosody: 20, conversation: 10 } },
      { time: 8, score: 40, signals: { authenticity: 45, match: 60, prosody: 25, conversation: 15 }, transcript: { speaker: 'User', text: 'Hi Neha, I see a login from a new device.' } },
      { time: 18, score: 50, signals: { authenticity: 55, match: 50, prosody: 30, conversation: 20 }, transcript: { speaker: 'Caller', text: 'Yeah, I just got a new phone and I am setting it up.' }, statusOverride: 'UNCERTAIN', alert: 'Signals inconclusive — case queued for analyst review', hash: generateHash() },
      { time: 28, score: 52, signals: { authenticity: 58, match: 48, prosody: 32, conversation: 22 }, transcript: { speaker: 'User', text: 'Okay, I will need to ask a few extra security questions.' } },
      { time: 40, score: 52, signals: { authenticity: 58, match: 48, prosody: 32, conversation: 22 }, statusOverride: 'UNCERTAIN' }
    ]
  }
];
