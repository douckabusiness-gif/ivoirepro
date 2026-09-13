/**
 * Web Audio API Sound Synthesizer for In-Browser VoIP Web Calls
 * Provides realistic ringtones, dial tones, connection chimes, and hangup sounds
 * Zero external audio files or network dependencies - 100% synthesized in real-time.
 */

class WebCallAudioEngine {
  private audioCtx: AudioContext | null = null;
  private ringtoneInterval: any = null;
  private dialtoneInterval: any = null;
  private activeNodes: Array<{ osc: OscillatorNode; gain: GainNode }> = [];

  private getContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Unlock AudioContext on user interaction
   */
  public unlock() {
    if (typeof window === 'undefined') return;
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {}
  }

  /**
   * Stop all currently playing call sounds and intervals
   */
  public stopAll() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
    if (this.dialtoneInterval) {
      clearInterval(this.dialtoneInterval);
      this.dialtoneInterval = null;
    }

    this.activeNodes.forEach(({ osc, gain }) => {
      try {
        gain.gain.setValueAtTime(0, this.audioCtx?.currentTime || 0);
        osc.stop();
        osc.disconnect();
        gain.disconnect();
      } catch {
        // node might already be stopped
      }
    });
    this.activeNodes = [];
  }

  /**
   * Play realistic incoming ringtone (melodious repeating chime sequence)
   */
  public playIncomingRingtone() {
    if (typeof window === 'undefined') return;
    this.stopAll();

    const playRingtonePhrase = () => {
      try {
        const ctx = this.getContext();
        const now = ctx.currentTime;

        // Sequence of melodic chime frequencies (modern soft smartphone ringtone)
        // E5 (659.25Hz), G#5 (830.61Hz), B5 (987.77Hz), E6 (1318.51Hz)
        const notes = [
          { freq: 659.25, time: 0.0, dur: 0.22 },
          { freq: 830.61, time: 0.24, dur: 0.22 },
          { freq: 987.77, time: 0.48, dur: 0.35 },
          { freq: 830.61, time: 0.9, dur: 0.22 },
          { freq: 1318.51, time: 1.15, dur: 0.55 },
        ];

        notes.forEach(note => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.freq, now + note.time);

          // Gentle bell-like envelope
          gain.gain.setValueAtTime(0.0001, now + note.time);
          gain.gain.exponentialRampToValueAtTime(0.28, now + note.time + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + note.time);
          osc.stop(now + note.time + note.dur + 0.05);

          this.activeNodes.push({ osc, gain });
        });
      } catch (err) {
        console.warn('WebCall audio incoming ringtone error:', err);
      }
    };

    // Play immediately, then repeat every 2.6s
    playRingtonePhrase();
    this.ringtoneInterval = setInterval(playRingtonePhrase, 2600);
  }

  /**
   * Play outgoing dial tone cadence (realistic European / standard PBX ringback tone: 440Hz + 480Hz)
   */
  public playOutgoingDialtone() {
    if (typeof window === 'undefined') return;
    this.stopAll();

    const playDialtoneBurst = () => {
      try {
        const ctx = this.getContext();
        const now = ctx.currentTime;
        const burstDuration = 1.3;

        [440, 480].forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
          gain.gain.setValueAtTime(0.12, now + burstDuration - 0.08);
          gain.gain.linearRampToValueAtTime(0.0001, now + burstDuration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + burstDuration + 0.05);

          this.activeNodes.push({ osc, gain });
        });
      } catch (err) {
        console.warn('WebCall audio outgoing dialtone error:', err);
      }
    };

    playDialtoneBurst();
    this.dialtoneInterval = setInterval(playDialtoneBurst, 3500);
  }

  /**
   * Play connected pleasant chime (ascending major triad chord)
   */
  public playCallConnected() {
    if (typeof window === 'undefined') return;
    this.stopAll();

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      // C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz) -> C6 (1046Hz)
      const notes = [
        { freq: 523.25, time: 0.0, dur: 0.25 },
        { freq: 659.25, time: 0.12, dur: 0.25 },
        { freq: 783.99, time: 0.24, dur: 0.35 },
        { freq: 1046.5, time: 0.38, dur: 0.55 },
      ];

      notes.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0.0001, now + note.time);
        gain.gain.exponentialRampToValueAtTime(0.25, now + note.time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur + 0.05);
      });
    } catch (err) {
      console.warn('WebCall audio connected chime error:', err);
    }
  }

  /**
   * Play call ended double beep tone
   */
  public playCallEnded() {
    if (typeof window === 'undefined') return;
    this.stopAll();

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Two quick drop beeps
      [
        { freq: 480, start: 0.0, dur: 0.18 },
        { freq: 360, start: 0.26, dur: 0.3 }
      ].forEach(b => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(b.freq, now + b.start);

        gain.gain.setValueAtTime(0.0001, now + b.start);
        gain.gain.linearRampToValueAtTime(0.18, now + b.start + 0.02);
        gain.gain.linearRampToValueAtTime(0.0001, now + b.start + b.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + b.start);
        osc.stop(now + b.start + b.dur + 0.02);
      });
    } catch (err) {
      console.warn('WebCall audio ended chime error:', err);
    }
  }

  /**
   * Play discrete notification alert sound (for chat & call badges)
   */
  public playNotificationPing() {
    if (typeof window === 'undefined') return;

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12); // A6 upward ping

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch (err) {
      console.warn('WebCall notification ping error:', err);
    }
  }
}

export const webCallAudio = new WebCallAudioEngine();
