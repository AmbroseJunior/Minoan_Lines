export const MINOAN_FLEET = [
  'Knossos Palace', 'Festos Palace', 'Mykonos Palace', 'Kydon Palace',
  'Santorini Palace', 'Europa Palace', 'Cruise Olympia', 'Cruise Europa',
];

export const PORTS: Record<string, { lat: number; lon: number; label: string }> = {
  Piraeus:   { lat: 37.9477, lon: 23.6333, label: 'Port of Piraeus' },
  Heraklion: { lat: 35.3397, lon: 25.1444, label: 'Port of Heraklion' },
  Chania:    { lat: 35.5138, lon: 24.0180, label: 'Port of Chania (Souda)' },
};

export const ROUTES = [
  { from: 'Piraeus',   to: 'Heraklion', hours: 9   },
  { from: 'Piraeus',   to: 'Chania',    hours: 9.5 },
  { from: 'Heraklion', to: 'Piraeus',   hours: 9   },
  { from: 'Chania',    to: 'Piraeus',   hours: 9.5 },
];

// Scheduled departure hour (local) for each origin port
const DEPARTURE_HOURS: Record<string, number> = {
  Piraeus:   21,
  Heraklion: 21,
  Chania:    21,
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function addHours(date: Date, h: number) {
  return new Date(date.getTime() + h * 3600 * 1000);
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(date: Date) {
  return date.toLocaleString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function generateVesselData(name: string) {
  const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (offset = 0) => seededRandom(seed + offset + Math.floor(Date.now() / 120000));

  const statuses = ['underway', 'at_anchor', 'moored', 'underway', 'underway'] as const;
  const status = statuses[Math.floor(rng(1) * statuses.length)];
  const route = ROUTES[Math.floor(rng(2) * ROUTES.length)];

  const fromPort = PORTS[route.from];
  const toPort   = PORTS[route.to];

  const speed       = status === 'underway' ? parseFloat((15 + rng(3) * 8).toFixed(1)) : 0;
  const delayProb   = parseFloat((rng(4) * 0.85).toFixed(2));
  const delayFactor = 1 + delayProb * 0.3;

  const now = new Date();

  let lat: number, lon: number;
  let departure_time: string, arrival_time: string, eta_label: string;
  let eta_hours: number | null = null;

  if (status === 'underway') {
    // Progress through the voyage (0 = just left, 1 = just arrived)
    const progress = 0.1 + rng(9) * 0.75;
    lat = lerp(fromPort.lat, toPort.lat, progress) + (rng(10) - 0.5) * 0.08;
    lon = lerp(fromPort.lon, toPort.lon, progress) + (rng(11) - 0.5) * 0.08;

    const totalHours  = route.hours * delayFactor;
    const hoursElapsed = progress * totalHours;
    const hoursLeft   = totalHours - hoursElapsed;
    eta_hours = parseFloat(hoursLeft.toFixed(1));

    const depTime = addHours(now, -hoursElapsed);
    const arrTime = addHours(now, hoursLeft);

    departure_time = `Departed ${formatTime(depTime)}`;
    arrival_time   = `ETA ${formatDateTime(arrTime)}`;
    eta_label      = `${hoursLeft.toFixed(1)}h remaining`;
  } else {
    // Moored or at anchor — place near origin port with slight scatter
    lat = fromPort.lat + (rng(10) - 0.5) * 0.04;
    lon = fromPort.lon + (rng(11) - 0.5) * 0.04;

    // Next departure: today or tomorrow at the scheduled hour
    const depHour    = DEPARTURE_HOURS[route.from] || 21;
    const nextDep    = new Date(now);
    nextDep.setHours(depHour, 0, 0, 0);
    if (nextDep <= now) nextDep.setDate(nextDep.getDate() + 1);

    const hoursUntilDep = (nextDep.getTime() - now.getTime()) / 3600000;
    const arrTime       = addHours(nextDep, route.hours * delayFactor);

    departure_time = `Next departure ${formatDateTime(nextDep)}`;
    arrival_time   = `Expected arrival ${formatDateTime(arrTime)}`;
    eta_label      = `Departs in ${hoursUntilDep.toFixed(1)}h`;
  }

  return {
    name,
    status,
    speed_knots: speed,
    route: `${route.from} → ${route.to}`,
    from: route.from,
    to: route.to,
    lat: parseFloat(lat.toFixed(4)),
    lon: parseFloat(lon.toFixed(4)),
    heading: Math.floor(rng(7) * 360),
    delay_probability: delayProb,
    eta_hours,
    eta_label,
    departure_time,
    arrival_time,
    fuel_consumption_tons: parseFloat((18 + rng(8) * 6).toFixed(1)),
    last_updated: now.toISOString(),
  };
}
