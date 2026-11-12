import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './park-config';

export type ParkVisit = {
  id: string;
  dogName: string;
  personName: string;
  createdAt: string;
  expiresAt: string;
};

export class ParkError extends Error {
  constructor(
    public readonly kind: 'park_full' | 'visit_not_found' | 'not_configured' | 'network',
    message: string,
  ) {
    super(message);
  }
}

export const parkConfigured = SUPABASE_URL !== '' && SUPABASE_PUBLISHABLE_KEY !== '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!parkConfigured) {
    throw new ParkError('not_configured', 'Shared check-ins are not set up yet.');
  }
  let response: Response;
  try {
    response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  } catch {
    throw new ParkError('network', 'Can’t reach the park right now.');
  }
  const text = await response.text();
  if (!response.ok) {
    if (text.includes('park_full')) {
      throw new ParkError('park_full', 'The park is full right now. Try again soon.');
    }
    if (text.includes('visit_not_found')) {
      throw new ParkError('visit_not_found', 'Your visit has already ended.');
    }
    throw new ParkError('network', 'Can’t reach the park right now.');
  }
  return (text ? JSON.parse(text) : null) as T;
}

type VisitRow = { id: string; dog_name: string; person_name: string; created_at: string; expires_at: string };

export async function fetchVisits(): Promise<ParkVisit[]> {
  const rows = await request<VisitRow[]>(
    'active_checkins?select=id,dog_name,person_name,created_at,expires_at&order=created_at.asc',
  );
  return rows.map((row) => ({
    id: row.id,
    dogName: row.dog_name,
    personName: row.person_name,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  }));
}

type VisitResult = { id: string; expires_at: string };

export function checkIn(dogName: string, personName: string, secret: string) {
  return request<VisitResult>('rpc/check_in', {
    method: 'POST',
    body: JSON.stringify({ p_dog: dogName, p_person: personName, p_secret: secret }),
  });
}

export function updateNames(id: string, secret: string, dogName: string, personName: string) {
  return request<VisitResult>('rpc/update_names', {
    method: 'POST',
    body: JSON.stringify({ p_id: id, p_secret: secret, p_dog: dogName, p_person: personName }),
  });
}

export function leave(id: string, secret: string) {
  return request<null>('rpc/leave', {
    method: 'POST',
    body: JSON.stringify({ p_id: id, p_secret: secret }),
  });
}
