import { NextResponse } from 'next/server';
import WebSocket from 'ws';
import { generateVesselData } from '@/lib/vessels';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Confirmed Minoan Lines MMSI numbers
// Add/correct via AISSTREAM_MMSI env var: comma-separated "MMSI:Name" pairs
const DEFAULT_MMSI_MAP: Record<string, string> = {
  '237902000': 'Knossos Palace',
  '237927000': 'Festos Palace',
  '237928000': 'Kydon Palace',
  '237901000': 'Europa Palace',
  '239248300': 'Santorini Palace',
  '239220900': 'Mykonos Palace',
  '239073900': 'Cruise Olympia',
  '239073800': 'Cruise Europa',
};

function getMmsiMap(): Record<string, string> {
  const override = process.env.AISSTREAM_MMSI;
  if (!override) return DEFAULT_MMSI_MAP;
  // Format: "237902000:Knossos Palace,237927000:Festos Palace"
  const map: Record<string, string> = {};
  override.split(',').forEach(pair => {
    const [mmsi, ...rest] = pair.trim().split(':');
    if (mmsi && rest.length) map[mmsi] = rest.join(':');
  });
  return Object.keys(map).length ? map : DEFAULT_MMSI_MAP;
}

type AISPosition = {
  UserID: number;
  Latitude: number;
  Longitude: number;
  Sog: number;       // Speed Over Ground (knots)
  Cog: number;       // Course Over Ground
  TrueHeading: number;
  NavigationalStatus: number; // 0=underway engine, 1=at anchor, 5=moored
};

type AISMessage = {
  MessageType: string;
  MetaData: { MMSI: number; ShipName: string };
  Message: {
    PositionReport?: AISPosition;
    StandardClassBPositionReport?: AISPosition;
  };
};

function navStatusToString(status: number): string {
  if (status === 0) return 'underway';
  if (status === 1) return 'at_anchor';
  if (status === 5) return 'moored';
  return 'underway';
}

function fetchAISData(
  apiKey: string,
  mmsiMap: Record<string, string>,
  timeoutMs = 7000,
): Promise<Record<string, { lat: number; lon: number; speed: number; heading: number; status: string; cog: number }>> {
  return new Promise((resolve) => {
    const results: Record<string, { lat: number; lon: number; speed: number; heading: number; status: string; cog: number }> = {};
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      try { ws.terminate(); } catch { /* ignore */ }
      resolve(results);
    };

    const timer = setTimeout(finish, timeoutMs);

    const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');

    ws.on('open', () => {
      ws.send(JSON.stringify({
        APIKey: apiKey,
        BoundingBoxes: [[[-90, -180], [90, 180]]],
        FiltersShipMMSI: Object.keys(mmsiMap),
        FilterMessageTypes: ['PositionReport', 'StandardClassBPositionReport'],
      }));
    });

    ws.on('message', (raw: Buffer) => {
      try {
        const msg: AISMessage = JSON.parse(raw.toString());
        const mmsi = String(msg.MetaData?.MMSI);
        if (!mmsiMap[mmsi]) return;

        const pos = msg.Message?.PositionReport ?? msg.Message?.StandardClassBPositionReport;
        if (!pos) return;

        results[mmsiMap[mmsi]] = {
          lat: pos.Latitude,
          lon: pos.Longitude,
          speed: pos.Sog ?? 0,
          heading: pos.TrueHeading === 511 ? pos.Cog : (pos.TrueHeading ?? pos.Cog ?? 0),
          cog: pos.Cog ?? 0,
          status: navStatusToString(pos.NavigationalStatus ?? 0),
        };

        // Once we have all vessels, return early
        if (Object.keys(results).length >= Object.keys(mmsiMap).length) {
          clearTimeout(timer);
          finish();
        }
      } catch { /* ignore parse errors */ }
    });

    ws.on('error', () => { clearTimeout(timer); finish(); });
    ws.on('close', () => { clearTimeout(timer); finish(); });
  });
}

export async function GET() {
  try {
    const mmsiMap = getMmsiMap();
    const apiKey = process.env.AISSTREAM_API_KEY;

    // If no API key, fall back to simulated data
    if (!apiKey) {
      const vessels = Object.values(mmsiMap).map(generateVesselData);
      return NextResponse.json(vessels);
    }

    // Fetch real AIS data
    const aisData = await fetchAISData(apiKey, mmsiMap);

    // Merge AIS data with simulated fallback for vessels not heard
    const vessels = Object.values(mmsiMap).map(name => {
      const live = aisData[name];
      const base = generateVesselData(name);

      if (!live) return { ...base, ais_live: false };

      return {
        ...base,
        lat: live.lat,
        lon: live.lon,
        speed_knots: parseFloat(live.speed.toFixed(1)),
        heading: Math.round(live.heading),
        status: live.status,
        ais_live: true,
      };
    });

    return NextResponse.json(vessels);
  } catch (e) {
    // Full fallback to simulated data on any error
    const { MINOAN_FLEET } = await import('@/lib/vessels');
    const { generateVesselData: gen } = await import('@/lib/vessels');
    return NextResponse.json(MINOAN_FLEET.map(gen));
  }
}
