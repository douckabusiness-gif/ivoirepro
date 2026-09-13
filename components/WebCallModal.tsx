'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/storeContext';
import { webRtcVoice } from '@/lib/webRtcVoice';
import { 
  Phone, 
  PhoneOff, 
  PhoneCall, 
  PhoneIncoming, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Bot, 
  User, 
  Clock, 
  ShieldCheck, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Radio, 
  Activity,
  Smile,
  Zap,
  CheckCircle2,
  X
} from 'lucide-react';

export const WebCallModal = () => {
  const { 
    activeCall, 
    acceptIncomingCall, 
    rejectIncomingCall, 
    endWebCall, 
    toggleCallMute, 
    toggleCallSpeaker,
    sendCallAudioVoiceNote,
    settings 
  } = useStore();

  const [isMinimized, setIsMinimized] = useState(false);
  const [voiceInputText, setVoiceInputText] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([40, 65, 30, 85, 95, 60, 45, 75, 55, 35, 70, 80]);
  const [localMicLevel, setLocalMicLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);

  // Animate dynamic waveform peaks and measure local mic during active call
  useEffect(() => {
    if (!activeCall || activeCall.status !== 'connected') return;

    const interval = setInterval(() => {
      if (activeCall.target === 'ai_advisor') {
        setWaveformPeaks(prev => 
          prev.map(() => Math.floor(Math.random() * 70) + 25)
        );
        setLocalMicLevel(0);
      } else {
        const live = webRtcVoice.getAudioLevels();
        if (live && live.length === 12) {
          setWaveformPeaks(live);
        }
        setLocalMicLevel(webRtcVoice.getLocalMicLevel());
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeCall?.status, activeCall?.target]);

  // Voice speech-to-text recognition initialization if browser supports it
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'fr-FR';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            sendCallAudioVoiceNote(transcript);
          }
        };

        recognition.onend = () => {
          setIsRecognizing(false);
        };

        recognition.onerror = () => {
          setIsRecognizing(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }
  }, [sendCallAudioVoiceNote]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) return;
    if (isRecognizing) {
      recognitionRef.current.stop();
      setIsRecognizing(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecognizing(true);
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const handleSendVoiceNote = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!voiceInputText.trim()) return;
    const text = voiceInputText.trim();
    setVoiceInputText('');
    await sendCallAudioVoiceNote(text);
  };

  if (!activeCall) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Minimized floating pill (when user clicks minimize to continue browsing)
  if (isMinimized) {
    return (
      <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl rounded-2xl p-2.5 px-4 flex items-center gap-3 text-white">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white animate-pulse">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full absolute -top-0.5 -right-0.5 ring-2 ring-slate-900" />
          </div>

          <div className="text-left cursor-pointer" onClick={() => setIsMinimized(false)}>
            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>{activeCall.contactName}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-black px-1.5 py-0.2 rounded-sm">
                {activeCall.status === 'connected' ? formatDuration(activeCall.duration) : 'Appel...'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Cliquez pour agrandir</p>
          </div>

          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Agrandir"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={endWebCall}
              className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition cursor-pointer"
              title="Raccrocher"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Call Window Container */}
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl shadow-2xl border border-slate-800/80 overflow-hidden flex flex-col items-center text-center p-6 sm:p-7">
        
        {/* Background ambient glow effect */}
        <div className={`absolute top-0 inset-x-0 h-40 opacity-25 blur-3xl pointer-events-none ${
          activeCall.status === 'connected'
            ? 'bg-gradient-to-b from-emerald-500 via-teal-500 to-transparent'
            : activeCall.status === 'ringing'
            ? 'bg-gradient-to-b from-amber-500 via-rose-500 to-transparent'
            : 'bg-gradient-to-b from-indigo-500 via-purple-600 to-transparent'
        }`} />

        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between z-10 mb-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50 backdrop-blur-xs">
            <Radio className={`w-3.5 h-3.5 ${activeCall.status === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-indigo-400'}`} />
            <span>VoIP Web Call • HD</span>
          </div>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition cursor-pointer"
            title="Réduire en haut à droite"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        {/* Center Caller Avatar & Sonar Pulse Animation */}
        <div className="relative my-4 flex items-center justify-center">
          
          {/* Sonar rings when calling or ringing */}
          {(activeCall.status === 'calling' || activeCall.status === 'ringing') && (
            <>
              <span className="absolute w-36 h-36 rounded-full bg-indigo-500/20 animate-ping duration-1000" />
              <span className="absolute w-48 h-48 rounded-full bg-indigo-500/10 animate-pulse duration-1000" />
            </>
          )}

          {activeCall.status === 'connected' && (
            <span className="absolute w-36 h-36 rounded-full bg-emerald-500/15 animate-pulse duration-1000" />
          )}

          {/* Avatar frame */}
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-2xl z-10 transition-all duration-300 relative border-2 ${
            activeCall.status === 'connected'
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-400/50 shadow-emerald-600/30'
              : activeCall.status === 'ringing'
              ? 'bg-gradient-to-tr from-amber-600 to-rose-600 border-amber-400/50 shadow-rose-600/40 animate-bounce'
              : 'bg-gradient-to-tr from-indigo-600 to-purple-700 border-indigo-400/50 shadow-indigo-600/30'
          }`}>
            {activeCall.target === 'ai_advisor' ? (
              <Bot className="w-12 h-12 text-white" />
            ) : (
              <PhoneCall className="w-10 h-10 text-white" />
            )}

            {/* Micro active status indicator */}
            {activeCall.status === 'connected' && (
              <span className={`w-4 h-4 rounded-full absolute -bottom-1 -right-1 ring-2 ring-slate-900 flex items-center justify-center text-[8px] font-bold ${
                activeCall.isMuted ? 'bg-rose-500 text-white' : 'bg-emerald-400 text-slate-950'
              }`}>
                {activeCall.isMuted ? '✕' : '✓'}
              </span>
            )}
          </div>
        </div>

        {/* Contact Info & Title */}
        <div className="z-10 mt-1 mb-3 space-y-1 max-w-[280px]">
          <h3 className="text-xl font-black tracking-tight text-white line-clamp-1">
            {activeCall.contactName}
          </h3>
          <p className="text-xs text-slate-400 font-medium line-clamp-1">
            {activeCall.contactSubtitle || settings.storeName}
          </p>

          {/* Status Label & Duration */}
          <div className="pt-2">
            {activeCall.status === 'calling' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                <span>Sonnerie en cours...</span>
              </div>
            )}

            {activeCall.status === 'ringing' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold animate-pulse">
                <PhoneIncoming className="w-3.5 h-3.5" />
                <span>Appel Web Entrant...</span>
              </div>
            )}

            {activeCall.status === 'connected' && (
              <div className="flex flex-col items-center gap-1.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-black tracking-wider">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>{formatDuration(activeCall.duration)} • En direct</span>
                </div>
                {activeCall.target !== 'ai_advisor' && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    activeCall.connectionQuality === 'connected'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : activeCall.connectionQuality === 'failed'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      activeCall.connectionQuality === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'
                    }`} />
                    {activeCall.connectionQuality === 'connected'
                      ? 'Voix HD P2P & Relais Coturn • Actif'
                      : activeCall.connectionQuality === 'failed'
                      ? 'Tentative de reconnexion...'
                      : 'Synchronisation WebRTC...'}
                  </span>
                )}
              </div>
            )}

            {activeCall.status === 'ended' && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Appel terminé</span>
              </div>
            )}
          </div>
        </div>

        {/* Microphone Permission / Access Alert */}
        {activeCall.micError && (
          <div className="z-10 w-full px-3.5 py-2.5 my-2 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-300 text-xs flex items-center gap-2 text-left animate-in fade-in duration-200">
            <MicOff className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="leading-tight font-medium">{activeCall.micError}</span>
          </div>
        )}

        {/* Visual Audio Waveform Bars & Microphone Sensor (During Connected Call) */}
        {activeCall.status === 'connected' && (
          <div className="z-10 w-full px-4 py-3 my-2 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-1.5 h-8 w-full">
              {waveformPeaks.map((height, idx) => (
                <div
                  key={idx}
                  className="w-1.5 bg-gradient-to-t from-emerald-500 to-teal-300 rounded-full transition-all duration-150"
                  style={{ height: `${activeCall.isMuted ? 8 : height}%` }}
                />
              ))}
            </div>

            {/* Speaking level meter */}
            {activeCall.target !== 'ai_advisor' && (
              <div className="w-full flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span className="flex items-center gap-1">
                  <Mic className="w-3 h-3 text-emerald-400" />
                  Votre micro :
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 transition-all duration-100 rounded-full"
                      style={{ width: `${activeCall.isMuted ? 0 : Math.min(100, localMicLevel * 2)}%` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-emerald-400 w-7 text-right">
                    {activeCall.isMuted ? 'OFF' : `${localMicLevel}%`}
                  </span>
                </div>
              </div>
            )}

            <p className="text-[10px] font-semibold">
              {activeCall.isMuted ? (
                <span className="text-rose-400">Microphone coupé</span>
              ) : (
                <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Audio bidirectionnel actif • Parlez librement
                </span>
              )}
            </p>
          </div>
        )}

        {/* Quick Voice Prompt / Text Box during AI Call */}
        {activeCall.status === 'connected' && activeCall.target === 'ai_advisor' && (
          <form onSubmit={handleSendVoiceNote} className="z-10 w-full mt-2 mb-3">
            <div className="relative flex items-center">
              <input
                type="text"
                value={voiceInputText}
                onChange={(e) => setVoiceInputText(e.target.value)}
                placeholder="Parlez ou posez une question..."
                className="w-full pl-3 pr-16 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-400"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                {typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      isRecognizing ? 'bg-rose-600 text-white animate-pulse' : 'text-slate-400 hover:text-white'
                    }`}
                    title={isRecognizing ? 'Écoute en cours...' : 'Activer la reconnaissance vocale'}
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!voiceInputText.trim()}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white rounded-lg transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick vocal suggestion chips */}
            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
              {[
                "🔥 Ventes flash ?",
                "🛵 Délais de livraison",
                "💡 Quel est le top vente ?"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendCallAudioVoiceNote(chip)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-0.5 rounded-lg border border-slate-700 transition cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </form>
        )}

        {/* Bottom Call Actions Control Strip */}
        <div className="z-10 w-full mt-auto pt-3 flex items-center justify-around">
          
          {/* CASE 1: Calling (Outgoing) -> Cancel Button */}
          {activeCall.status === 'calling' && (
            <button
              onClick={endWebCall}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 group-hover:scale-105 transition">
                <PhoneOff className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-300">Annuler</span>
            </button>
          )}

          {/* CASE 2: Ringing (Incoming) -> Accept & Reject Buttons */}
          {activeCall.status === 'ringing' && (
            <div className="w-full flex items-center justify-around px-4">
              <button
                onClick={rejectIncomingCall}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 group-hover:scale-105 transition">
                  <PhoneOff className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-rose-400">Refuser</span>
              </button>

              <button
                onClick={acceptIncomingCall}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/50 group-hover:scale-110 transition animate-bounce">
                  <Phone className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-emerald-400">Décrocher</span>
              </button>
            </div>
          )}

          {/* CASE 3: Connected -> Mute, Speaker, Hangup */}
          {activeCall.status === 'connected' && (
            <div className="w-full flex items-center justify-around px-2">
              
              {/* Mute Toggle */}
              <button
                onClick={toggleCallMute}
                className="flex flex-col items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                  activeCall.isMuted
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}>
                  {activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </div>
                <span className="text-[10px] font-bold">{activeCall.isMuted ? 'Muet' : 'Micro'}</span>
              </button>

              {/* End Call Button */}
              <button
                onClick={endWebCall}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 group-hover:scale-105 transition">
                  <PhoneOff className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-rose-400">Raccrocher</span>
              </button>

              {/* Speaker Toggle */}
              <button
                onClick={toggleCallSpeaker}
                className="flex flex-col items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                  !activeCall.isSpeakerOn
                    ? 'bg-slate-800 text-slate-500'
                    : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                }`}>
                  {activeCall.isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <span className="text-[10px] font-bold">{activeCall.isSpeakerOn ? 'Haut-parleur' : 'Discret'}</span>
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
