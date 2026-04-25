import { NextResponse } from 'next/server';
import { MINOAN_FLEET, generateVesselData } from '@/lib/vessels';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  try {
    const vessels = MINOAN_FLEET.map(generateVesselData);
    return NextResponse.json(vessels);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
