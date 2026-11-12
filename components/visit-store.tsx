import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import * as parkApi from './park-api';
import { ParkError, type ParkVisit } from './park-api';

// How long a check-in lasts before it ends on its own (also set in supabase/schema.sql).
export const VISIT_MINUTES = 30;

// Most people who can be checked in at the park at once (also set in supabase/schema.sql).
export const PARK_CAPACITY = 30;

// How often the list of who's here refreshes.
const REFRESH_MS = 15 * 1000;
const STORAGE_KEY = 'parkbuds.myVisit';

type MyVisit = {
  id: string;
  secret: string;
  dogName: string;
  personName: string;
  expiresAt: string;
};

export type Visitor = { id: string; label: string; isYou: boolean };

type Status = 'loading' | 'ready' | 'error';

type VisitStore = {
  status: Status;
  statusMessage: string;
  checkedIn: boolean;
  dogName: string;
  personName: string;
  guestLabel: string;
  visitors: Visitor[];
  count: number;
  full: boolean;
  /** Checks in, or updates the names on an existing visit. Resolves to an error message, or null on success. */
  saveNames: (dogName: string, personName: string) => Promise<string | null>;
  leave: () => Promise<void>;
};

const VisitContext = createContext<VisitStore | null>(null);

export function VisitProvider({ children }: { children: ReactNode }) {
  const [visits, setVisits] = useState<ParkVisit[]>([]);
  const [myVisit, setMyVisitState] = useState<MyVisit | null>(() => readMyVisit());
  const [status, setStatus] = useState<Status>('loading');
  const [statusMessage, setStatusMessage] = useState('');
  const myVisitRef = useRef(myVisit);

  const setMyVisit = useCallback((next: MyVisit | null) => {
    myVisitRef.current = next;
    setMyVisitState(next);
    writeMyVisit(next);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const latest = await parkApi.fetchVisits();
      setVisits(latest);
      setStatus('ready');
      setStatusMessage('');
      // Our visit ended elsewhere (expired, or left from another tab).
      const mine = myVisitRef.current;
      if (mine && !latest.some((visit) => visit.id === mine.id)) {
        setMyVisit(null);
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof ParkError ? error.message : 'Can’t reach the park right now.');
    }
  }, [setMyVisit]);

  // Load now, then keep the list fresh while the page is open.
  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), REFRESH_MS);
    const onVisible = () => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') void refresh();
    };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  // End our own visit locally the moment it expires.
  useEffect(() => {
    if (!myVisit) return;
    const remaining = Date.parse(myVisit.expiresAt) - Date.now();
    if (remaining <= 0) {
      setMyVisit(null);
      return;
    }
    const timeout = setTimeout(() => {
      setMyVisit(null);
      void refresh();
    }, remaining);
    return () => clearTimeout(timeout);
  }, [myVisit, refresh, setMyVisit]);

  // Drop anyone whose time is up even between refreshes.
  const now = Date.now();
  const active = visits.filter((visit) => Date.parse(visit.expiresAt) > now);
  const myId = myVisit?.id;
  const visitors: Visitor[] = [
    ...active.filter((visit) => visit.id === myId),
    ...active.filter((visit) => visit.id !== myId),
  ].map((visit) => ({
    id: visit.id,
    isYou: visit.id === myId,
    label: visitLabel(
      visit.id === myId && myVisit ? myVisit.dogName : visit.dogName,
      visit.id === myId && myVisit ? myVisit.personName : visit.personName,
    ),
  }));
  // Show our own visit right away, before the next refresh picks it up.
  if (myVisit && !visitors.some((visitor) => visitor.isYou)) {
    visitors.unshift({ id: myVisit.id, isYou: true, label: visitLabel(myVisit.dogName, myVisit.personName) });
  }

  const checkedIn = myVisit != null;
  const count = visitors.length;

  const store: VisitStore = {
    status,
    statusMessage,
    checkedIn,
    dogName: myVisit?.dogName ?? '',
    personName: myVisit?.personName ?? '',
    guestLabel: checkedIn ? visitLabel(myVisit.dogName, myVisit.personName) : 'No one yet',
    visitors,
    count,
    full: !checkedIn && count >= PARK_CAPACITY,
    async saveNames(nextDogName, nextPersonName) {
      const dogName = nextDogName.trim();
      const personName = nextPersonName.trim();
      try {
        const mine = myVisitRef.current;
        if (mine) {
          const result = await parkApi.updateNames(mine.id, mine.secret, dogName, personName);
          setMyVisit({ ...mine, dogName, personName, expiresAt: result.expires_at });
        } else {
          const secret = randomId();
          const result = await parkApi.checkIn(dogName, personName, secret);
          setMyVisit({ id: result.id, secret, dogName, personName, expiresAt: result.expires_at });
        }
        void refresh();
        return null;
      } catch (error) {
        if (error instanceof ParkError && error.kind === 'visit_not_found') {
          setMyVisit(null);
        }
        void refresh();
        return error instanceof ParkError ? error.message : 'Can’t reach the park right now.';
      }
    },
    async leave() {
      const mine = myVisitRef.current;
      setMyVisit(null);
      if (!mine) return;
      setVisits((current) => current.filter((visit) => visit.id !== mine.id));
      try {
        await parkApi.leave(mine.id, mine.secret);
      } finally {
        void refresh();
      }
    },
  };

  return <VisitContext value={store}>{children}</VisitContext>;
}

export function useVisit() {
  const store = use(VisitContext);
  if (!store) {
    throw new Error('useVisit must be used within VisitProvider');
  }
  return store;
}

export function visitLabel(dogName: string, personName: string) {
  const names = [dogName.trim(), personName.trim()].filter(Boolean);
  if (names.length === 0) return 'Someone';
  if (names.length === 1) return names[0];
  return `${names[0]} & ${names[1]}`;
}

// Remember our own visit across page reloads (web only; storage can be unavailable).
function readMyVisit(): MyVisit | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const visit = JSON.parse(raw) as MyVisit;
    return Date.parse(visit.expiresAt) > Date.now() ? visit : null;
  } catch {
    return null;
  }
}

function writeMyVisit(visit: MyVisit | null) {
  try {
    if (typeof localStorage === 'undefined') return;
    if (visit) localStorage.setItem(STORAGE_KEY, JSON.stringify(visit));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore: the visit still works for this page load.
  }
}

function randomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const value = (Math.random() * 16) | 0;
    return (char === 'x' ? value : (value & 0x3) | 0x8).toString(16);
  });
}
