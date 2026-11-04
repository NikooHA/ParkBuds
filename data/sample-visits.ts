export type SampleVisit = {
  id: string;
  dogName: string;
  personName: string;
  here: boolean;
};

// Fake park visitors for testing. Import `sampleVisits` instead of hard-coding names.
export const sampleVisits: SampleVisit[] = [
  { id: 'visit-milo', dogName: 'Milo', personName: 'Maya', here: true },
  { id: 'visit-biscuit', dogName: 'Biscuit', personName: 'Jonah', here: true },
  { id: 'visit-luna', dogName: 'Luna', personName: 'Priya', here: true },
  { id: 'visit-pepper', dogName: 'Pepper', personName: 'Sam', here: true },
  { id: 'visit-moose', dogName: 'Moose', personName: 'Elena', here: true },
  { id: 'visit-noodle', dogName: 'Noodle', personName: 'Chris', here: true },
  { id: 'visit-clover', dogName: 'Clover', personName: 'Amina', here: false },
  { id: 'visit-bear', dogName: 'Bear', personName: 'Leo', here: false },
  { id: 'visit-daisy', dogName: 'Daisy', personName: 'Harper', here: true },
  { id: 'visit-fig', dogName: 'Fig', personName: 'Owen', here: false },
  { id: 'visit-kiwi', dogName: 'Kiwi', personName: 'Jean-Paul', here: true },
  { id: 'visit-buttercup', dogName: 'Buttercup', personName: 'Alexandra', here: false },
  { id: 'visit-draco', dogName: 'Draco', personName: 'Nikoo', here: true },
  { id: 'visit-waffles', dogName: 'Waffles', personName: '', here: false },
  { id: 'visit-jordan', dogName: '', personName: 'Jordan', here: false },
];

export function sampleVisitLabel(visit: Pick<SampleVisit, 'dogName' | 'personName'>) {
  const names = [visit.dogName.trim(), visit.personName.trim()].filter(Boolean);
  if (names.length === 0) return 'Someone';
  if (names.length === 1) return names[0];
  return `${names[0]} & ${names[1]}`;
}
