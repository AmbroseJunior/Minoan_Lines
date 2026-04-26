'use client';
import { useState } from 'react';
import { Ship, Mail, User, Calendar, Users, Anchor, CheckCircle, Loader2, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

const ROUTES = [
  { value: 'Piraeus-Heraklion', label: 'Piraeus → Heraklion', departure: '21:00', duration: '9h' },
  { value: 'Piraeus-Chania', label: 'Piraeus → Chania', departure: '20:30', duration: '8h' },
  { value: 'Heraklion-Piraeus', label: 'Heraklion → Piraeus', departure: '21:00', duration: '9h' },
  { value: 'Chania-Piraeus', label: 'Chania → Piraeus', departure: '20:00', duration: '8h' },
];

const CABINS = [
  { value: 'deck', label: 'Deck Seat', desc: 'Open deck or lounge seating', price: '€35+' },
  { value: 'inside', label: 'Inside Cabin', desc: 'Private cabin, no window', price: '€65+' },
  { value: 'outside', label: 'Outside Cabin', desc: 'Sea-view window cabin', price: '€85+' },
  { value: 'suite', label: 'Luxury Suite', desc: 'Premium suite with balcony', price: '€150+' },
];

const VEHICLES = [
  { value: 'none', label: 'No Vehicle' },
  { value: 'motorcycle', label: 'Motorcycle', price: '+€25' },
  { value: 'car', label: 'Passenger Car', price: '+€55' },
  { value: 'van', label: 'Van / Minibus', price: '+€90' },
  { value: 'truck', label: 'Truck / HGV', price: '+€150' },
];

type Step = 'journey' | 'passengers' | 'contact' | 'confirmed';

export default function BookPage() {
  const [step, setStep] = useState<Step>('journey');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ reference: string; vessel: string; estimated_price: number } | null>(null);

  const [form, setForm] = useState({
    route: 'Piraeus-Heraklion',
    date: '',
    cabin: 'deck',
    vehicle: 'none',
    adults: '1',
    children: '0',
    name: '',
    email: '',
    special_requests: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const selectedRoute = ROUTES.find(r => r.value === form.route)!;
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  async function submit() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, adults: parseInt(form.adults), children: parseInt(form.children) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Booking failed');
      setResult(json);
      setStep('confirmed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Booking failed. Please try again.');
    } finally { setLoading(false); }
  }

  const inputCls = "w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5";

  const steps: { key: Step; label: string }[] = [
    { key: 'journey', label: 'Journey' },
    { key: 'passengers', label: 'Passengers' },
    { key: 'contact', label: 'Contact' },
  ];

  if (step === 'confirmed' && result) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Booking Confirmed</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">A confirmation has been sent to <strong>{form.email}</strong></p>
          </div>
          <div className="bg-[#001A4D] rounded-xl p-5 text-center">
            <div className="text-[#C9A84C] text-xs font-bold uppercase tracking-wider mb-1">Booking Reference</div>
            <div className="text-white text-3xl font-bold tracking-widest">{result.reference}</div>
          </div>
          <div className="text-left space-y-2 bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Route</span>
              <span className="font-medium text-gray-900 dark:text-slate-100">{form.route.replace('-', ' → ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Vessel</span>
              <span className="font-medium text-gray-900 dark:text-slate-100">{result.vessel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Date</span>
              <span className="font-medium text-gray-900 dark:text-slate-100">{new Date(form.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-slate-700 pt-2 mt-2">
              <span className="text-gray-700 dark:text-slate-300 font-semibold">Estimated Total</span>
              <span className="font-bold text-[#003087] dark:text-blue-400 text-base">€{result.estimated_price.toFixed(0)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500">Please arrive at the port 90 minutes before departure. Keep your booking reference accessible.</p>
          <button onClick={() => { setStep('journey'); setForm(f => ({ ...f, name: '', email: '', date: '', special_requests: '' })); setResult(null); }}
            className="btn-secondary text-sm w-full">
            Make Another Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#003087] flex items-center justify-center">
            <Anchor className="w-5 h-5 text-[#C9A84C]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#001A4D] dark:text-slate-100">Reserve Your Ferry</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Minoan Lines · Aegean & Adriatic Routes</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 px-1">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
              step === s.key ? 'bg-[#003087] text-white' :
              steps.findIndex(x => x.key === step) > i ? 'bg-green-500 text-white' :
              'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400')}>
              {steps.findIndex(x => x.key === step) > i ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={clsx('text-xs font-medium', step === s.key ? 'text-[#003087] dark:text-blue-400' : 'text-gray-400 dark:text-slate-500')}>{s.label}</span>
            {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300 dark:text-slate-600 ml-auto" />}
          </div>
        ))}
      </div>

      {/* Step 1: Journey */}
      {step === 'journey' && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Ship className="w-4 h-4 text-[#003087]" /> Journey Details
          </h2>

          <div>
            <label className={labelCls}>Route</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROUTES.map(r => (
                <button key={r.value} type="button" onClick={() => set('route', r.value)}
                  className={clsx('p-3 rounded-lg border-2 text-left transition-colors',
                    form.route === r.value
                      ? 'border-[#003087] bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600')}>
                  <div className="font-medium text-sm text-gray-900 dark:text-slate-100">{r.label}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Departs {r.departure} · {r.duration}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}><Calendar className="w-3.5 h-3.5 inline mr-1" />Travel Date</label>
            <input type="date" value={form.date} min={minDate} onChange={e => set('date', e.target.value)} required className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Accommodation</label>
            <div className="grid grid-cols-2 gap-2">
              {CABINS.map(c => (
                <button key={c.value} type="button" onClick={() => set('cabin', c.value)}
                  className={clsx('p-3 rounded-lg border-2 text-left transition-colors',
                    form.cabin === c.value
                      ? 'border-[#003087] bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300')}>
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-sm text-gray-900 dark:text-slate-100">{c.label}</div>
                    <div className="text-xs font-semibold text-[#003087] dark:text-blue-400">{c.price}</div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Vehicle Transport (optional)</label>
            <select value={form.vehicle} onChange={e => set('vehicle', e.target.value)} className={inputCls}>
              {VEHICLES.map(v => (
                <option key={v.value} value={v.value}>{v.label}{v.price ? ` ${v.price}` : ''}</option>
              ))}
            </select>
          </div>

          <button onClick={() => setStep('passengers')} disabled={!form.date}
            className="btn-primary w-full flex items-center justify-center gap-2">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Passengers */}
      {step === 'passengers' && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#003087]" /> Passengers
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Adults (12+)</label>
              <select value={form.adults} onChange={e => set('adults', e.target.value)} className={inputCls}>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Children (2–11)</label>
              <select value={form.children} onChange={e => set('children', e.target.value)} className={inputCls}>
                {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Special Requests (optional)</label>
            <textarea value={form.special_requests} onChange={e => set('special_requests', e.target.value)}
              rows={3} placeholder="Wheelchair assistance, dietary requirements, connecting cabin, etc."
              className={inputCls} />
          </div>

          {/* Summary card */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-sm space-y-2">
            <div className="font-semibold text-gray-700 dark:text-slate-300 text-xs uppercase tracking-wide mb-2">Booking Summary</div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Route</span><span className="font-medium dark:text-slate-100">{form.route.replace('-', ' → ')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Date</span><span className="font-medium dark:text-slate-100">{form.date ? new Date(form.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }) : '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Departs</span><span className="font-medium dark:text-slate-100">{selectedRoute.departure}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Cabin</span><span className="font-medium dark:text-slate-100">{CABINS.find(c => c.value === form.cabin)?.label}</span></div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep('journey')} className="btn-secondary flex-1 text-sm">Back</button>
            <button onClick={() => setStep('contact')} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Contact */}
      {step === 'contact' && (
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#003087]" /> Contact Details
          </h2>

          <div>
            <label className={labelCls}><User className="w-3.5 h-3.5 inline mr-1" />Full Name</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="As shown on your ID / passport" required className={inputCls} />
          </div>

          <div>
            <label className={labelCls}><Mail className="w-3.5 h-3.5 inline mr-1" />Email Address</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="Confirmation will be sent here" required className={inputCls} />
          </div>

          {/* Final summary */}
          <div className="bg-[#001A4D] rounded-xl p-4 text-sm space-y-2">
            <div className="text-[#C9A84C] text-xs font-bold uppercase tracking-wide mb-2">Reservation Summary</div>
            {[
              ['Route', form.route.replace('-', ' → ')],
              ['Date', form.date ? new Date(form.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : ''],
              ['Vessel', VESSEL_MAP[form.route]],
              ['Departs', selectedRoute.departure],
              ['Accommodation', CABINS.find(c => c.value === form.cabin)?.label || ''],
              ['Passengers', `${form.adults} Adult${parseInt(form.adults) !== 1 ? 's' : ''}${parseInt(form.children) > 0 ? ` + ${form.children} Child${parseInt(form.children) !== 1 ? 'ren' : ''}` : ''}`],
              ['Vehicle', VEHICLES.find(v => v.value === form.vehicle)?.label || 'None'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-blue-300 text-xs">{k}</span>
                <span className="text-white text-xs font-medium">{v}</span>
              </div>
            ))}
          </div>

          {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg p-3 text-sm">{error}</div>}

          <div className="flex gap-2">
            <button onClick={() => setStep('passengers')} className="btn-secondary flex-1 text-sm">Back</button>
            <button onClick={submit} disabled={loading || !form.name || !form.email}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</> : <><CheckCircle className="w-4 h-4" /> Confirm Booking</>}
            </button>
          </div>

          <p className="text-xs text-gray-400 dark:text-slate-500 text-center">A booking confirmation will be sent to your email immediately upon confirmation.</p>
        </div>
      )}
    </div>
  );
}

const VESSEL_MAP: Record<string, string> = {
  'Piraeus-Heraklion': 'Knossos Palace',
  'Piraeus-Chania': 'Festos Palace',
  'Heraklion-Piraeus': 'Mykonos Palace',
  'Chania-Piraeus': 'Kydon Palace',
};
