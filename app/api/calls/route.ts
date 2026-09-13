import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface ActiveCallRecord {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorPhone?: string;
  target: 'human_agent' | 'ai_advisor';
  status: 'ringing' | 'connected' | 'rejected' | 'ended';
  startedAt: number;
  connectedAt?: number | null;
  endedAt?: number | null;
  duration?: number;
  offer?: any;
  answer?: any;
  candidateFromVisitor?: any[];
  candidateFromAdmin?: any[];
}

interface ProvisionalSignals {
  offer?: any;
  answer?: any;
  candidateFromVisitor: any[];
  candidateFromAdmin: any[];
  updatedAt: number;
}

// Global in-memory storage for active calls (persistent across API requests within the Node.js process)
declare global {
  var __globalActiveCalls: Map<string, ActiveCallRecord> | undefined;
  var __globalProvisionalSignals: Map<string, ProvisionalSignals> | undefined;
}

if (!global.__globalActiveCalls) {
  global.__globalActiveCalls = new Map<string, ActiveCallRecord>();
}
if (!global.__globalProvisionalSignals) {
  global.__globalProvisionalSignals = new Map<string, ProvisionalSignals>();
}

const activeCalls = global.__globalActiveCalls;
const provisionalSignals = global.__globalProvisionalSignals;

function cleanStaleCalls() {
  const now = Date.now();
  for (const [id, call] of activeCalls.entries()) {
    // If ringing for more than 50s without answer, mark ended
    if (call.status === 'ringing' && now - call.startedAt > 50000) {
      call.status = 'ended';
      call.endedAt = now;
    }
    // If ended or rejected for more than 30s, prune
    if ((call.status === 'ended' || call.status === 'rejected') && call.endedAt && now - call.endedAt > 30000) {
      activeCalls.delete(id);
      provisionalSignals.delete(id);
    }
  }

  // Clean stale provisional signals older than 2 minutes
  for (const [id, prov] of provisionalSignals.entries()) {
    if (now - prov.updatedAt > 120000) {
      provisionalSignals.delete(id);
    }
  }
}

function pushUniqueCandidate(array: any[], candidate: any) {
  if (!candidate || !candidate.candidate) return;
  const exists = array.some(c => c && c.candidate === candidate.candidate);
  if (!exists) {
    array.push(candidate);
  }
}

// GET /api/calls
export async function GET(request: Request) {
  cleanStaleCalls();
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const visitorId = searchParams.get('visitorId');
  const callId = searchParams.get('callId');

  if (callId) {
    const call = activeCalls.get(callId) || null;
    return NextResponse.json({ activeCall: call });
  }

  if (role === 'admin') {
    const callsList = Array.from(activeCalls.values()).sort((a, b) => b.startedAt - a.startedAt);
    // Return ringing call first, or connected call
    const ringingCall = callsList.find(c => c.status === 'ringing');
    const connectedCall = callsList.find(c => c.status === 'connected');
    const active = ringingCall || connectedCall || null;

    return NextResponse.json({
      activeCall: active,
      recentCalls: callsList.slice(0, 5)
    });
  }

  if (visitorId) {
    const visitorCall = Array.from(activeCalls.values())
      .filter(c => c.visitorId === visitorId)
      .sort((a, b) => b.startedAt - a.startedAt)[0] || null;

    return NextResponse.json({
      activeCall: visitorCall
    });
  }

  return NextResponse.json({ activeCall: null });
}

// POST /api/calls
export async function POST(request: Request) {
  cleanStaleCalls();

  try {
    const body = await request.json();
    const { action, callId, visitorId, visitorName, visitorPhone, target, role, signal, offer, answer, candidate } = body;

    // 1. Visitor starts a call to human support
    if (action === 'start') {
      if (!visitorId) {
        return NextResponse.json({ error: 'visitorId requis' }, { status: 400 });
      }

      // Close any previous ringing/connected call for this visitor
      for (const [id, c] of activeCalls.entries()) {
        if (c.visitorId === visitorId && (c.status === 'ringing' || c.status === 'connected')) {
          c.status = 'ended';
          c.endedAt = Date.now();
        }
      }

      const id = callId || `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const visitorCandidates: any[] = [];
      if (candidate) {
        pushUniqueCandidate(visitorCandidates, candidate);
      }

      // Merge any provisional signals buffered before 'start'
      let initialOffer = offer || signal?.offer || null;
      const prov = provisionalSignals.get(id);
      if (prov) {
        if (!initialOffer && prov.offer) {
          initialOffer = prov.offer;
        }
        if (prov.candidateFromVisitor) {
          prov.candidateFromVisitor.forEach(c => pushUniqueCandidate(visitorCandidates, c));
        }
      }

      const newCall: ActiveCallRecord = {
        id,
        visitorId,
        visitorName: visitorName?.trim() || 'Client Boutique',
        visitorPhone: visitorPhone?.trim() || undefined,
        target: target || 'human_agent',
        status: 'ringing',
        startedAt: Date.now(),
        connectedAt: null,
        endedAt: null,
        duration: 0,
        offer: initialOffer,
        answer: prov?.answer || null,
        candidateFromVisitor: visitorCandidates,
        candidateFromAdmin: prov?.candidateFromAdmin ? [...prov.candidateFromAdmin] : []
      };

      activeCalls.set(id, newCall);

      // Log in chat history if conversation exists
      try {
        const conv = await prisma.chatConversation.findUnique({
          where: { visitorId }
        });
        if (conv) {
          await prisma.chatMessage.create({
            data: {
              conversationId: conv.id,
              sender: 'visitor',
              senderName: newCall.visitorName,
              text: `📞 [APPEL ENTRANT] Appel vocal direct démarré depuis le widget.`
            }
          });
          await prisma.chatConversation.update({
            where: { id: conv.id },
            data: {
              lastMessageText: `📞 Appel vocal entrant démarré`,
              lastMessageAt: new Date(),
              unreadByAdmin: { increment: 1 }
            }
          });
        }
      } catch (err) {
        console.warn('Could not record call in chat message log:', err);
      }

      return NextResponse.json({ success: true, call: newCall });
    }

    // 2. Admin accepts the incoming call ("Décrocher")
    if (action === 'accept') {
      let callToAccept: ActiveCallRecord | undefined;
      if (callId) {
        callToAccept = activeCalls.get(callId);
      } else {
        callToAccept = Array.from(activeCalls.values()).find(c => c.status === 'ringing');
      }

      if (!callToAccept) {
        return NextResponse.json({ error: 'Appel introuvable ou déjà terminé.' }, { status: 404 });
      }

      callToAccept.status = 'connected';
      callToAccept.connectedAt = Date.now();

      if (answer) {
        callToAccept.answer = answer;
      }
      if (candidate) {
        callToAccept.candidateFromAdmin = callToAccept.candidateFromAdmin || [];
        pushUniqueCandidate(callToAccept.candidateFromAdmin, candidate);
      }

      // Merge any buffered provisional signals
      const prov = provisionalSignals.get(callToAccept.id);
      if (prov) {
        if (!callToAccept.answer && prov.answer) {
          callToAccept.answer = prov.answer;
        }
        if (Array.isArray(prov.candidateFromVisitor)) {
          callToAccept.candidateFromVisitor = callToAccept.candidateFromVisitor || [];
          prov.candidateFromVisitor.forEach(c => pushUniqueCandidate(callToAccept!.candidateFromVisitor!, c));
        }
        if (Array.isArray(prov.candidateFromAdmin)) {
          callToAccept.candidateFromAdmin = callToAccept.candidateFromAdmin || [];
          prov.candidateFromAdmin.forEach(c => pushUniqueCandidate(callToAccept!.candidateFromAdmin!, c));
        }
      }

      return NextResponse.json({ success: true, call: callToAccept });
    }

    // 3. Admin rejects the incoming call ("Refuser")
    if (action === 'reject') {
      let callToReject: ActiveCallRecord | undefined;
      if (callId) {
        callToReject = activeCalls.get(callId);
      } else {
        callToReject = Array.from(activeCalls.values()).find(c => c.status === 'ringing');
      }

      if (callToReject) {
        callToReject.status = 'rejected';
        callToReject.endedAt = Date.now();
      }

      return NextResponse.json({ success: true, call: callToReject || null });
    }

    // 4. Either side hangs up ("Raccrocher")
    if (action === 'end') {
      let callToEnd: ActiveCallRecord | undefined;
      if (callId) {
        callToEnd = activeCalls.get(callId);
      } else if (visitorId) {
        callToEnd = Array.from(activeCalls.values()).find(c => c.visitorId === visitorId);
      }

      if (callToEnd) {
        callToEnd.status = 'ended';
        callToEnd.endedAt = Date.now();
        if (callToEnd.connectedAt) {
          callToEnd.duration = Math.floor((Date.now() - callToEnd.connectedAt) / 1000);
        }
      }

      return NextResponse.json({ success: true, call: callToEnd || null });
    }

    // 5. WebRTC Signaling (offer / answer / ICE candidates)
    if (action === 'signal') {
      const targetCall = callId ? activeCalls.get(callId) : null;

      // If call is not yet created in activeCalls, buffer signal provisionally
      if (!targetCall) {
        if (!callId) {
          return NextResponse.json({ error: 'callId requis pour signal' }, { status: 400 });
        }

        let prov = provisionalSignals.get(callId);
        if (!prov) {
          prov = {
            candidateFromVisitor: [],
            candidateFromAdmin: [],
            updatedAt: Date.now()
          };
          provisionalSignals.set(callId, prov);
        }
        prov.updatedAt = Date.now();

        if (signal?.type === 'offer') {
          prov.offer = signal;
        } else if (signal?.type === 'answer') {
          prov.answer = signal;
        } else if (signal?.candidate) {
          if (role === 'admin') {
            pushUniqueCandidate(prov.candidateFromAdmin, signal.candidate);
          } else {
            pushUniqueCandidate(prov.candidateFromVisitor, signal.candidate);
          }
        }

        return NextResponse.json({ success: true, buffered: true });
      }

      if (signal?.type === 'offer') {
        targetCall.offer = signal;
      } else if (signal?.type === 'answer') {
        targetCall.answer = signal;
      } else if (signal?.candidate) {
        if (role === 'admin') {
          targetCall.candidateFromAdmin = targetCall.candidateFromAdmin || [];
          pushUniqueCandidate(targetCall.candidateFromAdmin, signal.candidate);
        } else {
          targetCall.candidateFromVisitor = targetCall.candidateFromVisitor || [];
          pushUniqueCandidate(targetCall.candidateFromVisitor, signal.candidate);
        }
      }

      return NextResponse.json({ success: true, call: targetCall });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erreur interne' }, { status: 500 });
  }
}
