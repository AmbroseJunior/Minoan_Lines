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
  return NextResponse.json({
    vessels: data,
    fleet_summary: {
      total_co2_tons: parseFloat(data.reduce((s, v) => s + v.co2_emissions_tons, 0).toFixed(1)),
      total_ets_allowances: parseFloat(data.reduce((s, v) => s + v.eu_ets_allowances_needed, 0).toFixed(1)),
      avg_cii_score: parseFloat((data.reduce((s, v) => s + v.cii_score, 0) / data.length).toFixed(1)),
      report_date: new Date().toISOString().split('T')[0],
    },
  });
}

export async function POST(req: Request) {
  try {
    const { report_type = 'eu_ets', language = 'en', language_label = 'English' } = await req.json().catch(() => ({}));
    const data = buildComplianceData();

    const totalCO2 = data.reduce((s, v) => s + v.co2_emissions_tons, 0).toFixed(1);
    const totalETS = data.reduce((s, v) => s + v.eu_ets_allowances_needed, 0).toFixed(1);
    const avgCII = (data.reduce((s, v) => s + v.cii_score, 0) / data.length).toFixed(1);
    const avgGHG = (data.reduce((s, v) => s + v.ghg_intensity, 0) / data.length).toFixed(2);
    const ratingDist = data.reduce((acc, v) => { acc[v.fueleu_rating] = (acc[v.fueleu_rating] || 0) + 1; return acc; }, {} as Record<string, number>);
    const vesselSummary = data.map(v => `${v.vessel}: CO2 ${v.co2_emissions_tons}t, CII ${v.cii_score}, FuelEU ${v.fueleu_rating}`).join('; ');

    const isETS = report_type !== 'fuel_eu';
    const reportTitle = isETS ? 'EU Emissions Trading System (EU ETS)' : 'FuelEU Maritime Regulation';

    const prompt = `You are a senior maritime compliance officer preparing an official ${reportTitle} report for Minoan Lines S.A.
Write the entire report in ${language_label}. Every section, heading, and sentence must be in ${language_label} only.


Fleet data for ${data.length} vessels:
Total CO2 emissions: ${totalCO2} metric tons
Total ETS allowances required: ${totalETS} units
Average CII score: ${avgCII}
Average GHG intensity: ${avgGHG} gCO2e/MJ
FuelEU rating distribution: ${Object.entries(ratingDist).map(([r, c]) => `${c} vessels rated ${r}`).join(', ')}
Individual vessels: ${vesselSummary}

Write a formal compliance report with the following sections. Use plain prose throughout. Do not use any hashtags, asterisks, bullet symbols, dashes as list markers, or markdown formatting of any kind. Do not use emojis. Write in full paragraphs as a professional document would appear.

The report must include:
1. Executive Summary — overall compliance status, key metrics, and regulatory standing
2. Key Performance Indicators — present CII score, GHG intensity, ETS exposure, and fleet rating as narrative KPI commentary
3. Vessel Performance Analysis — identify top and bottom performers with specific data
4. Regulatory Compliance Status — assess compliance with ${isETS ? 'EU ETS Phase 4 obligations and 2024 maritime inclusion' : 'FuelEU Maritime Regulation 2025 GHG intensity requirements'}
5. Financial Exposure — estimate ETS cost exposure and potential penalty risk in euros
6. Strategic Recommendations — three specific, actionable recommendations with expected impact

Keep the total length under 500 words. Write as a human compliance expert, not as an AI assistant.`;

    const completion = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 900,
    });

    let reportText = completion.choices[0].message.content || '';
    // Strip any residual markdown symbols
    reportText = reportText.replace(/#{1,6}\s/g, '').replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1').replace(/^\s*[-*+]\s/gm, '').replace(/`([^`]+)`/g, '$1');

    let reportId: string | undefined;
    try {
      const db = supabaseAdmin();
      const { data: saved } = await db.from('compliance_reports').insert({
        report_type,
        content: reportText,
        vessel_data: data,
        generated_at: new Date().toISOString(),
      }).select('id').single();
      reportId = saved?.id;
    } catch {}

    return NextResponse.json({
      report_id: reportId,
      report_type,
      content: reportText,
      vessel_data: data,
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to generate report' },
      { status: 500 }
    );
  }
}
