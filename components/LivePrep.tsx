
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, PhoneOff, Video, Sparkles, Waves, Loader2, BrainCircuit } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { UserProfile } from '../types';

const LivePrep: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  const [transcription, setTranscription] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    setStatus('connecting');
    try {
      // Always initialize GoogleGenAI with a named parameter using process.env.API_KEY directly.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log("Live API connected");
            setStatus('active');
            setIsActive(true);
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`.
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
               setTranscription(prev => [...prev.slice(-4), `Coach: ${message.serverContent?.outputTranscription?.text}`]);
            }
            if (message.serverContent?.inputTranscription) {
               setTranscription(prev => [...prev.slice(-4), `You: ${message.serverContent?.inputTranscription?.text}`]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
               const ctx = outputAudioContextRef.current;
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(ctx.destination);
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               sourcesRef.current.add(source);
               source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Live Error", e),
          onclose: () => {
            setStatus('idle');
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: `You are a strict but fair interviewer at KaziLens AI. 
          The user's background: ${JSON.stringify(profile.analysis)}. 
          Conduct a high-stakes mock interview for the role of ${profile.analysis?.parsedRole || 'Professional'}. 
          Keep your questions concise. Wait for them to answer. 
          Provide real-time feedback after they answer a few questions.`
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setStatus('idle');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    setStatus('idle');
    setIsActive(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Voice Interview Prep</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Practice your interviewing skills with our low-latency Gemini Live agent. 
          Talk naturally and receive instant feedback on your tone, content, and confidence.
        </p>
      </div>

      <div className={`relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-12`}>
        {/* Animated Rings */}
        <div className={`absolute inset-0 rounded-full border-2 border-blue-500/20 transition-all duration-1000 ${isActive ? 'scale-110 opacity-100' : 'scale-100 opacity-0'}`}></div>
        <div className={`absolute inset-0 rounded-full border border-electric-blue/30 transition-all duration-700 delay-150 ${isActive ? 'scale-125 opacity-100' : 'scale-100 opacity-0'}`}></div>
        
        {/* Visualizer Circle */}
        <div className={`relative z-10 w-full h-full rounded-full glass-card flex items-center justify-center overflow-hidden border-2 ${isActive ? 'border-electric-blue shadow-[0_0_50px_rgba(0,212,255,0.2)]' : 'border-slate-800'}`}>
          {isActive ? (
            <div className="flex flex-col items-center">
               <Waves className="text-electric-blue w-24 h-24 mb-4 animate-pulse" />
               <span className="text-xs font-bold text-electric-blue uppercase tracking-widest">Live Coaching</span>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-40">
               <MicOff className="text-slate-600 w-24 h-24 mb-4" />
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ready to Start</span>
            </div>
          )}

          {/* Status Overlay */}
          {status === 'connecting' && (
            <div className="absolute inset-0 bg-navy-900/80 flex flex-col items-center justify-center backdrop-blur-md">
               <Loader2 className="text-electric-blue w-12 h-12 animate-spin mb-4" />
               <span className="text-sm font-bold text-white">Connecting to AI...</span>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Transcription Peek */}
      {isActive && transcription.length > 0 && (
        <div className="w-full max-w-2xl bg-slate-900/50 p-6 rounded-2xl border border-slate-800 mb-8 animate-in fade-in slide-in-from-bottom-4">
           <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
             <Volume2 size={14} /> Transcript Insight
           </div>
           <div className="space-y-2">
             {transcription.map((t, i) => (
               <p key={i} className={`text-sm ${t.startsWith('You:') ? 'text-slate-400' : 'text-electric-blue font-medium'}`}>
                 {t}
               </p>
             ))}
           </div>
        </div>
      )}

      <div className="flex gap-6">
        {!isActive ? (
          <button 
            onClick={startSession}
            disabled={status === 'connecting'}
            className="group flex items-center gap-4 bg-white text-navy-900 px-10 py-6 rounded-3xl font-extrabold text-xl shadow-2xl hover:bg-electric-blue transition-all disabled:opacity-50"
          >
            <Mic className="group-hover:animate-bounce" /> Start Interview Prep
          </button>
        ) : (
          <button 
            onClick={stopSession}
            className="flex items-center gap-4 bg-red-500 text-white px-10 py-6 rounded-3xl font-extrabold text-xl shadow-2xl hover:bg-red-600 transition-all"
          >
            <PhoneOff /> End Session
          </button>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <div className="p-4 rounded-2xl border border-slate-800 flex items-center gap-4 bg-slate-900/30">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-electric-blue">
            <BrainCircuit size={20} />
          </div>
          <p className="text-xs text-slate-400">Contextual awareness of your resume and targeted role.</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-800 flex items-center gap-4 bg-slate-900/30">
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
            <Sparkles size={20} />
          </div>
          <p className="text-xs text-slate-400">Zero-latency responses for a natural conversation.</p>
        </div>
      </div>
    </div>
  );
};

export default LivePrep;
