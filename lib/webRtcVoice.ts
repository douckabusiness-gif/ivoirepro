'use client';

// WebRTC Voice Communication Service for Real-time VoIP Calls
// Connects Visitor and Admin directly with low-latency bidirectional audio

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:62.171.133.49:3478' },
    {
      urls: [
        'turn:62.171.133.49:3478?transport=udp',
        'turn:62.171.133.49:3478?transport=tcp'
      ],
      username: 'ivoirecall',
      credential: 'IvoireCall2026!'
    },
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10
};

export class WebRtcVoiceService {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private remoteAudioElement: HTMLAudioElement | null = null;
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private audioContext: AudioContext | null = null;
  private localAnalyser: AnalyserNode | null = null;
  private remoteAnalyser: AnalyserNode | null = null;
  private localDataArray: Uint8Array | null = null;
  private remoteDataArray: Uint8Array | null = null;
  private callId: string | null = null;
  private onIceCandidateCallback: ((candidate: RTCIceCandidate) => void) | null = null;
  private onConnectionStateChangeCallback: ((state: { connectionState: string; iceConnectionState: string }) => void) | null = null;

  // Prepare audio output synchronously during user click/touch gesture
  // Unlocks browser autoplay policies across Chrome, Safari iOS, and Android
  public prepareAudioOutput(): void {
    if (typeof window === 'undefined') return;

    try {
      let el = this.remoteAudioElement || (document.getElementById('ivoire-remote-voice-player') as HTMLAudioElement);
      if (!el) {
        el = document.createElement('audio');
        el.id = 'ivoire-remote-voice-player';
        el.autoplay = true;
        (el as any).playsInline = true;
        (el as any).webkitPlaysInline = true;
        el.setAttribute('playsinline', 'true');
        el.setAttribute('webkit-playsinline', 'true');
        document.body.appendChild(el);
      }

      el.muted = false;
      el.volume = 1.0;
      this.remoteAudioElement = el;

      // Prime AudioContext on user gesture
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext || this.audioContext.state === 'closed') {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }
      }
    } catch (err) {
      console.warn('[WebRTC] prepareAudioOutput error:', err);
    }
  }

  // Register connection state change listener
  public setOnConnectionStateChange(callback: ((state: { connectionState: string; iceConnectionState: string }) => void) | null) {
    this.onConnectionStateChangeCallback = callback;
  }

  public getConnectionState(): { connectionState: string; iceConnectionState: string } {
    return {
      connectionState: this.pc?.connectionState || 'new',
      iceConnectionState: this.pc?.iceConnectionState || 'new'
    };
  }

  // Initialize a new PeerConnection
  private createPeerConnection(): RTCPeerConnection {
    if (this.pc) {
      try {
        this.pc.close();
      } catch {}
      this.pc = null;
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.pendingCandidates = [];

    pc.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidateCallback) {
        this.onIceCandidateCallback(event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] ontrack received:', event.track.kind, event.streams);
      let stream: MediaStream | null = event.streams && event.streams[0] ? event.streams[0] : null;
      if (!stream && event.track) {
        stream = new MediaStream([event.track]);
      }
      if (stream) {
        this.remoteStream = stream;
        this.setupRemoteAudio(stream);
        this.setupAudioAnalyser(stream, 'remote');
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state changed:', pc.connectionState);
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback({
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback({
          connectionState: pc.connectionState,
          iceConnectionState: pc.iceConnectionState
        });
      }
    };

    this.pc = pc;
    return pc;
  }

  // Acquire local microphone with echo cancellation & noise suppression
  private async acquireLocalMicrophone(): Promise<MediaStream> {
    if (this.localStream) {
      return this.localStream;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("L'accès au microphone n'est pas pris en charge par ce navigateur.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    });

    this.localStream = stream;
    this.setupAudioAnalyser(stream, 'local');
    return stream;
  }

  // Setup DOM audio element to play incoming voice
  private setupRemoteAudio(stream: MediaStream) {
    if (typeof window === 'undefined') return;

    let el = this.remoteAudioElement || (document.getElementById('ivoire-remote-voice-player') as HTMLAudioElement);
    if (!el) {
      el = document.createElement('audio');
      el.id = 'ivoire-remote-voice-player';
      el.autoplay = true;
      (el as any).playsInline = true;
      (el as any).webkitPlaysInline = true;
      el.setAttribute('playsinline', 'true');
      el.setAttribute('webkit-playsinline', 'true');
      document.body.appendChild(el);
    }

    el.muted = false;
    el.volume = 1.0;
    el.srcObject = stream;
    this.remoteAudioElement = el;

    const playPromise = el.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('[WebRTC] Autoplay play() rejected, unlocking on interaction:', err);
        const unlock = () => {
          el?.play().catch(() => {});
          window.removeEventListener('click', unlock);
          window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
      });
    }
  }

  // Setup Web Audio API Analysers
  private setupAudioAnalyser(stream: MediaStream, type: 'local' | 'remote') {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      const source = this.audioContext.createMediaStreamSource(stream);
      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      if (type === 'local') {
        this.localAnalyser = analyser;
        this.localDataArray = new Uint8Array(analyser.frequencyBinCount);
      } else {
        this.remoteAnalyser = analyser;
        this.remoteDataArray = new Uint8Array(analyser.frequencyBinCount);
      }
    } catch (err) {
      console.warn(`[WebRTC] Audio analyser error (${type}):`, err);
    }
  }

  // CALLER: Start a call (Visitor calls human support)
  public async startCallAsCaller(
    callId: string,
    onIceCandidate: (cand: RTCIceCandidate) => void
  ): Promise<{ offer: RTCSessionDescriptionInit; micError: string | null }> {
    this.callId = callId;
    this.onIceCandidateCallback = onIceCandidate;

    // Ensure audio player is primed
    this.prepareAudioOutput();

    let micError: string | null = null;
    let stream: MediaStream | null = null;

    try {
      stream = await this.acquireLocalMicrophone();
    } catch (err: any) {
      console.warn('[WebRTC] Microphone access error:', err);
      micError = "Microphone non accessible. Veuillez autoriser le micro dans votre navigateur pour parler.";
    }

    const pc = this.createPeerConnection();

    if (stream) {
      stream.getAudioTracks().forEach(track => {
        pc.addTrack(track, stream!);
      });
    }

    const offer = await pc.createOffer({
      offerToReceiveAudio: true
    });

    await pc.setLocalDescription(offer);

    return {
      offer: pc.localDescription || offer,
      micError
    };
  }

  // CALLER: Receive and apply Answer from callee
  public async handleAnswerFromCallee(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc) return;
    if (this.pc.remoteDescription) return; // already set

    try {
      await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
      await this.flushPendingCandidates();
    } catch (err) {
      console.error('[WebRTC] Error setting remote description (answer):', err);
    }
  }

  // CALLEE: Accept an incoming call (Admin clicks "DÉCROCHER")
  public async acceptCallAsCallee(
    callId: string,
    offer: RTCSessionDescriptionInit,
    initialCandidates: RTCIceCandidateInit[] | undefined,
    onIceCandidate: (cand: RTCIceCandidate) => void
  ): Promise<{ answer: RTCSessionDescriptionInit; micError: string | null }> {
    this.callId = callId;
    this.onIceCandidateCallback = onIceCandidate;

    // Ensure audio player is primed
    this.prepareAudioOutput();

    let micError: string | null = null;
    let stream: MediaStream | null = null;

    try {
      stream = await this.acquireLocalMicrophone();
    } catch (err: any) {
      console.warn('[WebRTC] Callee microphone access error:', err);
      micError = "Microphone non accessible. Veuillez autoriser le micro dans votre navigateur pour parler.";
    }

    const pc = this.createPeerConnection();

    if (stream) {
      stream.getAudioTracks().forEach(track => {
        pc.addTrack(track, stream!);
      });
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    // Queue and immediately flush any initial visitor candidates
    if (Array.isArray(initialCandidates)) {
      initialCandidates.forEach(c => {
        if (c && c.candidate) this.pendingCandidates.push(c);
      });
    }
    await this.flushPendingCandidates();

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    return {
      answer: pc.localDescription || answer,
      micError
    };
  }

  // Add remote ICE candidate received from signaling server
  public async addRemoteCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!candidate || !candidate.candidate) return;
    if (!this.pc || !this.pc.remoteDescription) {
      this.pendingCandidates.push(candidate);
      return;
    }

    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn('[WebRTC] Error adding ICE candidate:', err);
    }
  }

  private async flushPendingCandidates() {
    if (!this.pc || !this.pc.remoteDescription) return;

    while (this.pendingCandidates.length > 0) {
      const cand = this.pendingCandidates.shift();
      if (cand && cand.candidate) {
        try {
          await this.pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (err) {
          console.warn('[WebRTC] Error flushing candidate:', err);
        }
      }
    }
  }

  // Toggle microphone mute
  public setMute(isMuted: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }

  // Toggle speaker output
  public setSpeaker(isSpeakerOn: boolean) {
    if (this.remoteAudioElement) {
      this.remoteAudioElement.muted = !isSpeakerOn;
    }
  }

  // Read local microphone volume level (0 to 100%)
  public getLocalMicLevel(): number {
    if (!this.localAnalyser || !this.localDataArray) return 0;
    try {
      this.localAnalyser.getByteFrequencyData(this.localDataArray as any);
      let sum = 0;
      for (let i = 0; i < this.localDataArray.length; i++) {
        sum += this.localDataArray[i];
      }
      const avg = sum / this.localDataArray.length;
      return Math.min(100, Math.round((avg / 255) * 100));
    } catch {
      return 0;
    }
  }

  // Read remote voice volume level (0 to 100%)
  public getRemoteAudioLevel(): number {
    if (!this.remoteAnalyser || !this.remoteDataArray) return 0;
    try {
      this.remoteAnalyser.getByteFrequencyData(this.remoteDataArray as any);
      let sum = 0;
      for (let i = 0; i < this.remoteDataArray.length; i++) {
        sum += this.remoteDataArray[i];
      }
      const avg = sum / this.remoteDataArray.length;
      return Math.min(100, Math.round((avg / 255) * 100));
    } catch {
      return 0;
    }
  }

  // Read actual live voice frequency levels (12 bars for visualizer)
  public getAudioLevels(): number[] {
    const activeAnalyser = this.remoteAnalyser || this.localAnalyser;
    const activeData = this.remoteAnalyser ? this.remoteDataArray : this.localDataArray;

    if (!activeAnalyser || !activeData) {
      return [20, 35, 25, 45, 60, 40, 30, 50, 40, 25, 35, 30];
    }

    try {
      activeAnalyser.getByteFrequencyData(activeData as any);
      const result: number[] = [];
      const step = Math.max(1, Math.floor(activeData.length / 12));
      for (let i = 0; i < 12; i++) {
        const val = activeData[i * step] || 0;
        const normalized = Math.min(95, Math.max(15, Math.round((val / 255) * 85 + 15)));
        result.push(normalized);
      }
      return result;
    } catch {
      return [25, 35, 25, 45, 50, 40, 30, 45, 35, 25, 30, 25];
    }
  }

  // Terminate voice call & clean all media resources
  public cleanup() {
    this.callId = null;
    this.onIceCandidateCallback = null;
    this.onConnectionStateChangeCallback = null;
    this.pendingCandidates = [];

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      this.localStream = null;
    }

    if (this.remoteAudioElement) {
      try {
        this.remoteAudioElement.pause();
        this.remoteAudioElement.srcObject = null;
      } catch {}
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close().catch(() => {});
      } catch {}
      this.audioContext = null;
    }

    this.localAnalyser = null;
    this.remoteAnalyser = null;
    this.localDataArray = null;
    this.remoteDataArray = null;

    if (this.pc) {
      try {
        this.pc.close();
      } catch {}
      this.pc = null;
    }
  }
}

export const webRtcVoice = new WebRtcVoiceService();
