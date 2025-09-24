import { useSyncExternalStore } from 'react';

type Events = {
  'sos:triggered': { userId: string; position?: { lat: number; lng: number }; timestamp: number };
  'location:update': { userId: string; position: { lat: number; lng: number }; timestamp: number };
  'alert:geofence': { userId: string; zoneId: string; level: 'enter' | 'exit'; timestamp: number };
  'broadcast:send': { id: string; title?: string; message: string; area?: string; severity?: 'Info' | 'Advisory' | 'Warning' | 'Critical'; timestamp: number };
  'track:target': { userId: string; status: 'start' | 'stop'; reason?: string; timestamp: number };
};

type Handler<T> = (event: T) => void;
class SimpleBus {
  private handlers: Map<string, Set<Function>> = new Map();
  on<K extends keyof Events>(type: K, handler: Handler<Events[K]>): void {
    if (!this.handlers.has(type as string)) this.handlers.set(type as string, new Set());
    this.handlers.get(type as string)!.add(handler as Function);
  }
  off<K extends keyof Events>(type: K, handler: Handler<Events[K]>): void {
    this.handlers.get(type as string)?.delete(handler as Function);
  }
  emit<K extends keyof Events>(type: K, event: Events[K]): void {
    this.handlers.get(type as string)?.forEach((h) => {
      try { (h as Handler<Events[K]>)(event); } catch {}
    });
  }
}

export const bus = new SimpleBus();

export type BroadcastMessage = { id: string; title?: string; message: string; area?: string; severity?: 'Info' | 'Advisory' | 'Warning' | 'Critical'; timestamp: number };

export function emitBroadcast(payload: BroadcastMessage) {
  try {
    bus.emit('broadcast:send', payload);
  } catch (e) {
    // swallow for now
  }
}

export function emitTrackTarget(payload: { userId: string; status: 'start' | 'stop'; reason?: string; timestamp: number }) {
  try {
    bus.emit('track:target', payload);
  } catch (e) {
    // swallow for now
  }
}

export type TouristTracking = {
  userId: string;
  isTracking: boolean;
  lastPosition?: { lat: number; lng: number; accuracy?: number };
  lastUpdated?: number;
  safetyScore: number;
  // optional metadata shown in popups
  name?: string;
  nationality?: string;
  nationalId?: string;
  status?: string;
};

type State = {
  currentUserId?: string;
  tourists: Record<string, TouristTracking>;
  setCurrentUserId: (id: string | undefined) => void;
  updateTourist: (id: string, data: Partial<TouristTracking>) => void;
  setTracking: (id: string, isTracking: boolean) => void;
};

// Lightweight store implementation (no external deps)
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyAll() {
  listeners.forEach((l) => {
    try { l(); } catch {}
  });
}

const state: State = {
  currentUserId: undefined,
  tourists: {},
  setCurrentUserId: (id: string | undefined) => {
    state.currentUserId = id;
    notifyAll();
  },
  updateTourist: (id: string, data: Partial<TouristTracking>) => {
    const existing = state.tourists[id] ?? { userId: id, isTracking: false, safetyScore: 100, name: undefined, nationality: undefined, nationalId: undefined, status: undefined };
    state.tourists = {
      ...state.tourists,
      [id]: { ...existing, ...data, userId: id, safetyScore: data.safetyScore ?? existing.safetyScore ?? 100 },
    };
    notifyAll();
  },
  setTracking: (id: string, isTracking: boolean) => {
    const existing = state.tourists[id] ?? { userId: id, isTracking: false, safetyScore: 100 };
    state.tourists = { ...state.tourists, [id]: { ...existing, isTracking, userId: id } };
    notifyAll();
  },
};

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useRealtimeStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}



