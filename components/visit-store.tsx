import { createContext, use, useEffect, useState, type ReactNode } from 'react';

const VISIT_LENGTH_MS = 60 * 60 * 1000;

type VisitStore = {
  checkedIn: boolean;
  dogName: string;
  personName: string;
  guestLabel: string;
  count: number;
  checkIn: () => void;
  saveNames: (dogName: string, personName: string) => void;
  leave: () => void;
};

const VisitContext = createContext<VisitStore | null>(null);

export function VisitProvider({ children }: { children: ReactNode }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [dogName, setDogName] = useState('');
  const [personName, setPersonName] = useState('');
  const [checkedInAt, setCheckedInAt] = useState<number | null>(null);

  useEffect(() => {
    if (!checkedIn || checkedInAt == null) return;
    const remaining = VISIT_LENGTH_MS - (Date.now() - checkedInAt);
    if (remaining <= 0) {
      setCheckedIn(false);
      setCheckedInAt(null);
      return;
    }
    const timeout = setTimeout(() => {
      setCheckedIn(false);
      setCheckedInAt(null);
    }, remaining);
    return () => clearTimeout(timeout);
  }, [checkedIn, checkedInAt]);

  const store: VisitStore = {
    checkedIn,
    dogName,
    personName,
    guestLabel: guestLabel(dogName, personName, checkedIn),
    count: checkedIn ? 1 : 0,
    checkIn() {
      setCheckedIn(true);
      setCheckedInAt((current) => current ?? Date.now());
    },
    saveNames(nextDogName, nextPersonName) {
      setDogName(nextDogName.trim());
      setPersonName(nextPersonName.trim());
      setCheckedIn(true);
      setCheckedInAt((current) => current ?? Date.now());
    },
    leave() {
      setCheckedIn(false);
      setCheckedInAt(null);
      setDogName('');
      setPersonName('');
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

function guestLabel(dogName: string, personName: string, checkedIn: boolean) {
  if (!checkedIn) return 'No one yet';
  const names = [dogName.trim(), personName.trim()].filter(Boolean);
  if (names.length === 0) return 'Someone';
  if (names.length === 1) return names[0];
  return `${names[0]} & ${names[1]}`;
}
