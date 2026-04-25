import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { deepseek, DEEPSEEK_MODEL } from '@/lib/ai';

export const runtime = 'nodejs';

const VESSELS = ['Knossos Palace', 'Festos Palace', 'Mykonos Palace', 'Kydon Palace',
  'Santorini Palace', 'Europa Palace', 'Cruise Olympia', 'Cruise Europa'];

function buildComplianceData() {
  return VESSELS.map(name => {
    const fuelTons = 18 + Math.random() * 12;
    const co2 = fuelTons * 3.114;
    const cii_score = 60 + Math.random() * 30;
    const fuelEuRating = cii_score > 85 ? 'A' : cii_score > 75 ? 'B' : cii_score > 65 ? 'C' : 'D';
    return {
      vessel: name,
      fuel_consumption_tons: parseFloat(fuelTons.toFixed(1)),
      co2_emissions_tons: parseFloat(co2.toFixed(1)),
      eu_ets_allowances_needed: parseFloat((co2 * 0.5).toFixed(1)),
      cii_score: parseFloat(cii_score.toFixed(1)),
      fueleu_rating: fuelEuRating,
      ghg_intensity: parseFloat((fuelTons * 0.23).toFixed(2)),
    };
  });
}

export async function GET() {
  const data = buildComplianceData();
  const fleet_total_co2 = data.reduce((s, v) => s + v.co2_emissions_tons, 0);
  const fleet_ets = data.reduce((s, v) => s + v.eu_ets_allowances_needed, 0);

  return NextResponse.json({
    vessels: data,
    fleet_summary: {
      total_co2_tons: parseFloat(fleet_total_co2.toFixed(1)),
      total_ets_allowances: parseFloat(fleet_ets.toFixed(1)),
      avg_cii_score: parseFloat((data.reduce((s, v) => s + v.cii_score, 0) / data.length).toFixed(1)),
      report_date: new Date().toISOString().split('T')[0],
    },
  });
}

export async function POST(req: Request) {
  const { report_type = 'eu_ets' } = await req.json().catch(() => ({}));

  const data = buildComplianceData();
  const db = supabaseAdmin();

  const prompt = `Generate a formal EU ${report_type === 'fuel_eu' ? 'FuelEU Maritime' : 'ETS'} compliance summary
for Minoan Lines S.A. fleet of ${data.length} vessels.
Fleet total CO2: ${data.reduce((s,v) => s+v.co2_emissions_tons,0).toFixed(0)} tons.
Average CII score: ${(data.reduce((s,v) => s+v.cii_score,0)/data.length).toFixed(1)}.
Include key findings, regulatory compliance status, and 3 improvement recommendations.
Keep it professional and under 400 words.`;

  const completion = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
  });

  const reportText = completion.choices[0].message.content || '';

  // Save to Supabase
  const { data: saved } = await db.from('compliance_reports').insert({
    report_type,
    content: reportText,
    vessel_data: data,
    generated_at: new Date().toISOString(),
  }).select().single();

  return NextResponse.json({
    report_id: saved?.id,
    report_type,
    content: reportText,
    vessel_data: data,
    generated_at: new Date().toISOString(),
  });
}
