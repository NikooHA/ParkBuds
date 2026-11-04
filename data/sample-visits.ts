export type SampleVisit = {
  id: string;
  dogName: string;
  personName: string;
};

// Fake park visitors for testing. Import `sampleVisits` instead of hard-coding names.
export const sampleVisits: SampleVisit[] = [
  { id: 'visit-milo', dogName: 'Milo', personName: 'Maya' },
  { id: 'visit-biscuit', dogName: 'Biscuit', personName: 'Jonah' },
  { id: 'visit-luna', dogName: 'Luna', personName: 'Priya' },
  { id: 'visit-pepper', dogName: 'Pepper', personName: 'Sam' },
  { id: 'visit-moose', dogName: 'Moose', personName: 'Elena' },
  { id: 'visit-noodle', dogName: 'Noodle', personName: 'Chris' },
  { id: 'visit-clover', dogName: 'Clover', personName: 'Amina' },
  { id: 'visit-bear', dogName: 'Bear', personName: 'Leo' },
  { id: 'visit-daisy', dogName: 'Daisy', personName: 'Harper' },
  { id: 'visit-fig', dogName: 'Fig', personName: 'Owen' },
  { id: 'visit-kiwi', dogName: 'Kiwi', personName: 'Jean-Paul' },
  { id: 'visit-buttercup', dogName: 'Buttercup', personName: 'Alexandra' },
  { id: 'visit-draco', dogName: 'Draco', personName: 'Nikoo' },
  { id: 'visit-waffles', dogName: 'Waffles', personName: '' },
  { id: 'visit-jordan', dogName: '', personName: 'Jordan' },
];

export function sampleVisitLabel(visit: Pick<SampleVisit, 'dogName' | 'personName'>) {
  const names = [visit.dogName.trim(), visit.personName.trim()].filter(Boolean);
  if (names.length === 0) return 'Someone';
  if (names.length === 1) return names[0];
  return `${names[0]} & ${names[1]}`;
}
