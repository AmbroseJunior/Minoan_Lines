'use client';
import { useState, useEffect, useCallback } from 'react';
import { FileText, RefreshCw, Download, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

type VesselData = { vessel: string; fuel_consumption_tons: number; co2_emissions_tons: number; eu_ets_allowances_needed: number; cii_score: number; fueleu_rating: string; ghg_intensity: number };
type ComplianceData = { vessels: VesselData[]; fleet_summary: { total_co2_tons: number; total_ets_allowances: number; avg_cii_score: number; report_date: string } };

function ratingColor(r: string) {
  if (r === 'A') return 'bg-green-100 text-green-700';
  if (r === 'B') return 'bg-blue-100 text-blue-700';
  if (r === 'C') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

export default function CompliancePage() {
  const { t } = useTranslation();
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportType, setReportType] = useState<'eu_ets' | 'fuel_eu'>('eu_ets');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/compliance');
      setData(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function generateReport() {
    setGenerating(true);
    setReportText('');
    setReportError('');
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_type: reportType }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setReportText(json.content || '');
    } catch (e) {
      setReportError(e instanceof Error ? e.message : 'Report generation failed');
    } finally { setGenerating(false); }
  }

  if (loading) return <div className="card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" /></div>;

  const s = data?.fleet_summary;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#003087]" />
          <h1 className="text-xl font-bold text-[#001A4D]">{t('compliance.title')}</h1>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />{t('compliance.refresh')}
        </button>
      </div>

      {s && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t('compliance.totalCO2'), value: s.total_co2_tons.toFixed(0), icon: AlertTriangle, color: 'text-orange-600' },
            { label: t('compliance.etsAllowances'), value: s.total_ets_allowances.toFixed(0), icon: FileText, color: 'text-blue-600' },
            { label: t('compliance.avgCII'), value: s.avg_cii_score.toFixed(1), icon: CheckCircle, color: 'text-green-600' },
            { label: t('compliance.reportDate'), value: s.report_date, icon: FileText, color: 'text-gray-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Icon className={clsx('w-4 h-4', color)} />{label}
              </div>
              <div className="text-xl font-bold text-gray-900">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-4 border-b"><h2 className="font-semibold text-gray-900">Fleet Compliance Details</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Vessel', 'Fuel (t)', 'CO₂ (t)', 'ETS Needed', 'CII Score', 'FuelEU', 'GHG Intensity'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.vessels.map(v => (
                <tr key={v.vessel} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{v.vessel}</td>
                  <td className="px-4 py-3 text-gray-600">{v.fuel_consumption_tons}</td>
                  <td className="px-4 py-3 text-gray-600">{v.co2_emissions_tons}</td>
                  <td className="px-4 py-3 text-gray-600">{v.eu_ets_allowances_needed}</td>
                  <td className="px-4 py-3 text-gray-600">{v.cii_score}</td>
                  <td className="px-4 py-3"><span className={clsx('badge', ratingColor(v.fueleu_rating))}>{v.fueleu_rating}</span></td>
                  <td className="px-4 py-3 text-gray-600">{v.ghg_intensity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Generate AI Compliance Report</h2>
        <div className="flex gap-3 items-center flex-wrap">
          <select value={reportType} onChange={e => setReportType(e.target.value as typeof reportType)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]">
            <option value="eu_ets">{t('compliance.euEts')}</option>
            <option value="fuel_eu">{t('compliance.fuelEu')}</option>
          </select>
          <button onClick={generateReport} disabled={generating} className="btn-primary flex items-center gap-2 text-sm">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {generating ? t('compliance.generating') : t('compliance.generateReport')}
          </button>
        </div>
        {reportError && <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">⚠️ {reportError}</div>}
        {reportText && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{reportText}</div>
        )}
      </div>
    </div>
  );
}
