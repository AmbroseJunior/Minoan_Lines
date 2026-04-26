'use client';
import { useState, useEffect, useCallback } from 'react';
import { FileText, RefreshCw, Download, Mail, AlertTriangle, CheckCircle, Loader2, X, Send, Languages } from 'lucide-react';
import { REPORT_LANGUAGES, languageLabel } from '@/lib/reportLanguages';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

type VesselData = { vessel: string; fuel_consumption_tons: number; co2_emissions_tons: number; eu_ets_allowances_needed: number; cii_score: number; fueleu_rating: string; ghg_intensity: number };
type ComplianceData = { vessels: VesselData[]; fleet_summary: { total_co2_tons: number; total_ets_allowances: number; avg_cii_score: number; report_date: string } };

function ratingColor(r: string) {
  if (r === 'A') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (r === 'B') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (r === 'C') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
}

function barColor(rating: string) {
  if (rating === 'A') return '#16a34a';
  if (rating === 'B') return '#2563eb';
  if (rating === 'C') return '#d97706';
  return '#dc2626';
}

const NON_LATIN_LANGS = new Set(['el', 'ru', 'uk', 'ar', 'zh', 'ja', 'ko', 'hi']);

function printReport(reportType: string, content: string, vessels: VesselData[], lang: string) {
  const title = reportType === 'fuel_eu' ? 'FuelEU Maritime Compliance Report' : 'EU ETS Compliance Report';
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const isRTL = lang === 'ar';
  const vesselRows = vessels.map((v, i) => `
    <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
      <td style="padding:8px 12px;font-weight:600">${v.vessel}</td>
      <td style="padding:8px 12px;text-align:center">${v.fuel_consumption_tons}</td>
      <td style="padding:8px 12px;text-align:center">${v.co2_emissions_tons}</td>
      <td style="padding:8px 12px;text-align:center">${v.cii_score}</td>
      <td style="padding:8px 12px;text-align:center">
        <span style="background:${v.fueleu_rating === 'A' ? '#dcfce7' : v.fueleu_rating === 'B' ? '#dbeafe' : v.fueleu_rating === 'C' ? '#fef9c3' : '#fee2e2'};padding:2px 10px;border-radius:999px;font-weight:700;font-size:12px">${v.fueleu_rating}</span>
      </td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html dir="${isRTL ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"><title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;700&family=Noto+Sans+SC:wght@400;700&family=Noto+Sans+JP:wght@400;700&family=Noto+Sans+KR:wght@400;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Sans','Noto Sans Arabic','Noto Sans SC','Noto Sans JP',system-ui,sans-serif; background:#fff; color:#111827; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .header { background:#001A4D; color:#fff; padding:28px 40px; }
  .header-brand { color:#C9A84C; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px; }
  .header-title { font-size:22px; font-weight:700; }
  .header-sub { color:#93c5fd; font-size:13px; margin-top:6px; }
  .body { padding:32px 40px; }
  .report-text { background:#f0f9ff; border-left:4px solid #003087; padding:20px 24px; border-radius:0 8px 8px 0; font-size:14px; line-height:1.8; color:#1e3a5f; white-space:pre-wrap; margin-bottom:28px; font-family:Georgia,serif; }
  h2 { font-size:15px; font-weight:700; color:#001A4D; margin-bottom:14px; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  thead tr { background:#001A4D; color:#fff; }
  thead th { padding:10px 12px; text-align:${isRTL ? 'right' : 'left'}; font-weight:600; font-size:12px; letter-spacing:.03em; }
  .footer { margin-top:32px; padding:16px 40px; background:#f9fafb; border-top:1px solid #e5e7eb; font-size:11px; color:#9ca3af; text-align:center; }
  @media print { @page { size: A4; margin: 0; } }
</style></head>
<body>
  <div class="header">
    <div class="header-brand">⚓ Minoan Lines S.A. · Compliance Department</div>
    <div class="header-title">${title}</div>
    <div class="header-sub">${date} · Prepared by IntegraMind AI</div>
  </div>
  <div class="body">
    <div class="report-text">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    <h2>Fleet Compliance Data</h2>
    <table>
      <thead><tr>
        <th>Vessel</th><th style="text-align:center">Fuel (t)</th><th style="text-align:center">CO₂ (t)</th><th style="text-align:center">CII Score</th><th style="text-align:center">FuelEU</th>
      </tr></thead>
      <tbody>${vesselRows}</tbody>
    </table>
  </div>
  <div class="footer">Minoan Lines S.A. · EU Compliance Report · Powered by IntegraMind AI · integramindai.com</div>
  <script>window.onload = () => { window.print(); }<\/script>
</body></html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  if (w) { w.document.write(html); w.document.close(); }
}

async function downloadPDF(reportType: string, content: string, vessels: VesselData[]) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const title = reportType === 'fuel_eu' ? 'FuelEU Maritime Compliance Report' : 'EU ETS Compliance Report';
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(0, 26, 77);
  doc.rect(0, 0, pageW, 35, 'F');
  doc.setTextColor(201, 168, 76);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('MINOAN LINES S.A.', 15, 12);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(title, 15, 23);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(147, 197, 253);
  doc.text(`${date} · Prepared by Minoan Lines Compliance Department`, 15, 31);

  doc.setTextColor(30, 58, 95);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Content', 15, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  const lines = doc.splitTextToSize(content, pageW - 30);
  doc.text(lines, 15, 56);

  let yPos = 56 + lines.length * 5 + 10;
  if (yPos > 230) { doc.addPage(); yPos = 20; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 95);
  doc.text('Fleet Compliance Data', 15, yPos);
  yPos += 8;

  doc.setFillColor(0, 26, 77);
  doc.rect(15, yPos - 4, pageW - 30, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Vessel', 17, yPos + 1);
  doc.text('Fuel (t)', 88, yPos + 1);
  doc.text('CO2 (t)', 112, yPos + 1);
  doc.text('CII Score', 138, yPos + 1);
  doc.text('FuelEU', 162, yPos + 1);
  yPos += 8;

  vessels.forEach((v, i) => {
    if (yPos > 270) { doc.addPage(); yPos = 20; }
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, yPos - 4, pageW - 30, 7, 'F');
    }
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(v.vessel, 17, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(String(v.fuel_consumption_tons), 88, yPos);
    doc.text(String(v.co2_emissions_tons), 112, yPos);
    doc.text(String(v.cii_score), 138, yPos);
    const rColor = v.fueleu_rating === 'A' ? [22, 163, 74] : v.fueleu_rating === 'B' ? [37, 99, 235] : v.fueleu_rating === 'C' ? [217, 119, 6] : [220, 38, 38];
    doc.setTextColor(rColor[0], rColor[1], rColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(v.fueleu_rating, 165, yPos);
    yPos += 7;
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(0, 26, 77);
    doc.rect(0, 285, pageW, 12, 'F');
    doc.setFontSize(8);
    doc.setTextColor(147, 197, 253);
    doc.setFont('helvetica', 'normal');
    doc.text('Minoan Lines S.A. · Compliance Department · Powered by IntegraMind AI', 15, 292);
    doc.text(`Page ${i} of ${pages}`, pageW - 30, 292);
  }

  doc.save(`minoan-lines-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
}

export default function CompliancePage() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportVessels, setReportVessels] = useState<VesselData[]>([]);
  const [reportError, setReportError] = useState('');
  const [reportType, setReportType] = useState<'eu_ets' | 'fuel_eu'>('eu_ets');
  const [reportLang, setReportLang] = useState(() => i18n.language?.slice(0, 2) || 'en');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailStatus, setEmailStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/compliance');
      setData(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function generateReport() {
    setGenerating(true); setReportText(''); setReportError(''); setEmailStatus('');
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_type: reportType, language: reportLang, language_label: languageLabel(reportLang) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setReportText(json.content || '');
      setReportVessels(json.vessel_data || []);
    } catch (e) {
      setReportError(e instanceof Error ? e.message : 'Report generation failed');
    } finally { setGenerating(false); }
  }

  async function handleDownload() {
    if (!reportText) return;
    setDownloading(true);
    try { await downloadPDF(reportType, reportText, reportVessels); }
    catch (e) { alert('PDF generation failed: ' + (e instanceof Error ? e.message : e)); }
    finally { setDownloading(false); }
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!emailTo || !reportText) return;
    setSendingEmail(true); setEmailStatus('');
    try {
      const res = await fetch('/api/compliance/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailTo, report_type: reportType, content: reportText, vessel_data: reportVessels }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send');
      setEmailStatus('Report sent successfully.');
      setShowEmailForm(false);
      setEmailTo('');
    } catch (e) {
      setEmailStatus('Failed: ' + (e instanceof Error ? e.message : 'Unable to send email'));
    } finally { setSendingEmail(false); }
  }

  if (loading) return <div className="card p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-[#003087] mx-auto" /></div>;
  const s = data?.fleet_summary;
  const chartData = data?.vessels.map(v => ({ name: v.vessel.replace(' Palace', '').replace('Cruise ', 'C.'), co2: v.co2_emissions_tons, rating: v.fueleu_rating })) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#003087]" />
          <h1 className="text-xl font-bold text-[#001A4D] dark:text-slate-100">{t('compliance.title')}</h1>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />{t('compliance.refresh')}
        </button>
      </div>

      {s && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t('compliance.totalCO2'), value: `${s.total_co2_tons.toFixed(0)} t`, icon: AlertTriangle, color: 'text-orange-600' },
            { label: t('compliance.etsAllowances'), value: s.total_ets_allowances.toFixed(0), icon: FileText, color: 'text-blue-600' },
            { label: t('compliance.avgCII'), value: s.avg_cii_score.toFixed(1), icon: CheckCircle, color: 'text-green-600' },
            { label: t('compliance.reportDate'), value: s.report_date, icon: FileText, color: 'text-gray-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4">
              <div className={clsx('flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-1')}>
                <Icon className={clsx('w-4 h-4', color)} />{label}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-slate-100">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* CO2 Chart */}
      {chartData.length > 0 && (
        <div className="card p-4">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">CO2 Emissions by Vessel (metric tons)</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} className="dark:fill-slate-400" />
                <YAxis tick={{ fontSize: 10 }} className="dark:fill-slate-400" />
                <Tooltip
                  formatter={(v: number) => [`${v} t CO2`, 'Emissions']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="co2" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry.rating)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2 justify-center">
            {[['A', '#16a34a'], ['B', '#2563eb'], ['C', '#d97706'], ['D', '#dc2626']].map(([r, c]) => (
              <span key={r} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: c }} />{r} Rating
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100">Fleet Compliance Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>{['Vessel', 'Fuel (t)', 'CO2 (t)', 'ETS Needed', 'CII Score', 'FuelEU', 'GHG Intensity'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {data?.vessels.map(v => (
                <tr key={v.vessel} className="hover:bg-gray-50 dark:hover:bg-slate-700/40">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{v.vessel}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{v.fuel_consumption_tons}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{v.co2_emissions_tons}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{v.eu_ets_allowances_needed}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{v.cii_score}</td>
                  <td className="px-4 py-3"><span className={clsx('badge', ratingColor(v.fueleu_rating))}>{v.fueleu_rating}</span></td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{v.ghg_intensity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-slate-100">Generate Compliance Report</h2>
        <div className="flex gap-3 items-center flex-wrap">
          <select value={reportType} onChange={e => setReportType(e.target.value as typeof reportType)}
            className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
            <option value="eu_ets">{t('compliance.euEts')}</option>
            <option value="fuel_eu">{t('compliance.fuelEu')}</option>
          </select>
          <div className="flex items-center gap-1.5 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-900">
            <Languages className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <select value={reportLang} onChange={e => setReportLang(e.target.value)}
              className="text-sm focus:outline-none bg-transparent text-gray-900 dark:text-slate-100">
              {REPORT_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
          <button onClick={generateReport} disabled={generating} className="btn-primary flex items-center gap-2 text-sm">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {generating ? t('compliance.generating') : t('compliance.generateReport')}
          </button>
        </div>

        {reportError && <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-3 text-sm">{reportError}</div>}

        {reportText && (
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-5 text-sm text-gray-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed border-l-4 border-[#003087]" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}>
              {reportText}
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              {NON_LATIN_LANGS.has(reportLang) && (
                <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                  Use Print / Save as PDF for best results in this language
                </span>
              )}
              <button onClick={handleDownload} disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-[#003087] text-white rounded-lg text-sm font-medium hover:bg-[#001A4D] transition-colors disabled:opacity-50">
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download PDF
              </button>
              <button onClick={() => printReport(reportType, reportText, reportVessels, reportLang)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                <Download className="w-4 h-4" />
                Print / Save as PDF
              </button>
              <button onClick={() => { setShowEmailForm(!showEmailForm); setEmailStatus(''); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
                <Mail className="w-4 h-4" />
                Send to Email
              </button>
            </div>

            {emailStatus && (
              <div className={clsx('text-sm rounded-lg p-3', emailStatus.startsWith('Failed') ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400')}>
                {emailStatus}
              </div>
            )}

            {showEmailForm && (
              <div className="bg-blue-50 dark:bg-slate-800 rounded-lg p-4 space-y-3 border border-blue-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900 dark:text-slate-200">Send Report by Email</span>
                  <button onClick={() => setShowEmailForm(false)}><X className="w-4 h-4 text-blue-400" /></button>
                </div>
                <form onSubmit={handleSendEmail} className="flex gap-2">
                  <input type="email" value={emailTo} onChange={e => setEmailTo(e.target.value)}
                    placeholder="recipient@example.com" required
                    className="flex-1 border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]" />
                  <button type="submit" disabled={sendingEmail || !emailTo}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#003087] text-white rounded-lg text-sm font-medium hover:bg-[#001A4D] disabled:opacity-50">
                    {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
