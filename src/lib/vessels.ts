export const MINOAN_FLEET = [
  'Knossos Palace', 'Festos Palace', 'Mykonos Palace', 'Kydon Palace',
  'Santorini Palace', 'Europa Palace', 'Cruise Olympia', 'Cruise Europa',
];

export const ROUTES = [
  { from: 'Piraeus', to: 'Heraklion', hours: 9 },
  { from: 'Piraeus', to: 'Chania', hours: 9.5 },
  { from: 'Heraklion', to: 'Piraeus', hours: 9 },
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateVesselData(name: string) {
  const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (offset = 0) => seededRandom(seed + offset + Date.now() / 60000);

  const statuses = ['underway', 'at_anchor', 'moored', 'underway'] as const;
  const status = statuses[Math.floor(rng(1) * statuses.length)];
  const route = ROUTES[Math.floor(rng(2) * ROUTES.length)];
  const speed = status === 'underway' ? 15 + rng(3) * 8 : 0;
  const delayProb = rng(4) * 0.9;

  return {
    name,
    status,
    speed_knots: parseFloat(speed.toFixed(1)),
    route: `${route.from} → ${route.to}`,
    lat: 35.5 + rng(5) * 4,
    lon: 23.5 + rng(6) * 5,
    heading: Math.floor(rng(7) * 360),
    delay_probability: parseFloat(delayProb.toFixed(2)),
    eta_hours: status === 'underway' ? parseFloat((route.hours * (1 + delayProb * 0.3)).toFixed(1)) : null,
    fuel_consumption_tons: parseFloat((18 + rng(8) * 6).toFixed(1)),
    last_updated: new Date().toISOString(),
  };
}
