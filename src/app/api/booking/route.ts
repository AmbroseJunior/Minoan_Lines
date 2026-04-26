import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const VESSEL_MAP: Record<string, string> = {
  'Piraeus-Heraklion': 'Knossos Palace',
  'Piraeus-Chania': 'Festos Palace',
  'Heraklion-Piraeus': 'Mykonos Palace',
  'Chania-Piraeus': 'Kydon Palace',
};

const DEPARTURE_TIMES: Record<string, string> = {
  'Piraeus-Heraklion': '21:00',
  'Piraeus-Chania': '20:30',
  'Heraklion-Piraeus': '21:00',
  'Chania-Piraeus': '20:00',
};

const DURATION: Record<string, string> = {
  'Piraeus-Heraklion': '9 hours',
  'Piraeus-Chania': '8 hours',
  'Heraklion-Piraeus': '9 hours',
  'Chania-Piraeus': '8 hours',
};

function generateRef() {
  return 'ML' + Math.random().toString(36).toUpperCase().slice(2, 10);
}

function formatRoute(route: string) {
  return route.replace('-', ' → ');
}

function cabinLabel(type: string) {
  const labels: Record<string, string> = {
    deck: 'Deck Seat (Economy)',
    inside: 'Inside Cabin',
    outside: 'Outside Cabin with Sea View',
    suite: 'Luxury Suite',
  };
  return labels[type] || type;
}

function vehicleLabel(type: string) {
  const labels: Record<string, string> = {
    none: 'No vehicle',
    motorcycle: 'Motorcycle',
    car: 'Passenger Car',
    van: 'Van / Minibus',
    truck: 'Truck / HGV',
  };
  return labels[type] || type;
}

function priceEstimate(route: string, cabin: string, adults: number, children: number, vehicle: string) {
  const base: Record<string, number> = { deck: 35, inside: 65, outside: 85, suite: 150 };
  const vehicleCost: Record<string, number> = { none: 0, motorcycle: 25, car: 55, van: 90, truck: 150 };
  const childDiscount = 0.5;
  const cabinBase = base[cabin] || 35;
  const total = (cabinBase * adults) + (cabinBase * childDiscount * children) + (vehicleCost[vehicle] || 0);
  return total;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, route, date, adults = 1, children = 0, cabin = 'deck', vehicle = 'none', special_requests = '' } = body;

    if (!name || !email || !route || !date) {
      return NextResponse.json({ error: 'Name, email, route, and date are required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    const ref = generateRef();
    const vessel = VESSEL_MAP[route] || 'Minoan Lines Vessel';
    const departure = DEPARTURE_TIMES[route] || '21:00';
    const duration = DURATION[route] || 'Overnight';
    const formattedRoute = formatRoute(route);
    const travelDate = new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    const estimatedPrice = priceEstimate(route, cabin, parseInt(String(adults)), parseInt(String(children)), vehicle);
    const displayDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:Inter,system-ui,sans-serif;background:#f3f4f6;margin:0;padding:24px">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)">

    <!-- Header -->
    <div style="background:#001A4D;padding:32px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <span style="font-size:28px">⚓</span>
        <div>
          <div style="color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Minoan Lines S.A.</div>
          <div style="color:#fff;font-size:20px;font-weight:700;margin-top:2px">Booking Confirmation</div>
        </div>
      </div>
      <div style="color:#93c5fd;font-size:13px;margin-top:4px">${displayDate}</div>
    </div>

    <!-- Booking Reference Banner -->
    <div style="background:#003087;padding:16px 32px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="color:#93c5fd;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase">Booking Reference</div>
        <div style="color:#fff;font-size:24px;font-weight:700;letter-spacing:.1em;margin-top:2px">${ref}</div>
      </div>
      <div style="text-align:right">
        <div style="color:#93c5fd;font-size:11px;font-weight:600;text-transform:uppercase">Status</div>
        <div style="background:#16a34a;color:#fff;font-size:13px;font-weight:600;padding:4px 12px;border-radius:999px;margin-top:4px;display:inline-block">Confirmed</div>
      </div>
    </div>

    <div style="padding:32px">

      <!-- Greeting -->
      <p style="font-size:15px;color:#1e293b;margin:0 0 24px">Dear ${name},</p>
      <p style="font-size:14px;color:#475569;line-height:1.7;margin:0 0 28px">
        Thank you for choosing Minoan Lines. Your reservation has been confirmed. Please find your full booking summary below. We recommend arriving at the port at least 90 minutes before departure.
      </p>

      <!-- Journey Details -->
      <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px">
        <div style="background:#f8fafc;padding:14px 20px;border-bottom:1px solid #e2e8f0">
          <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Journey Details</div>
        </div>
        <div style="padding:0">
          ${[
            ['Route', formattedRoute],
            ['Vessel', vessel],
            ['Travel Date', travelDate],
            ['Departure', departure],
            ['Duration', duration],
            ['Accommodation', cabinLabel(cabin)],
            ['Passengers', `${adults} Adult${parseInt(String(adults)) !== 1 ? 's' : ''}${parseInt(String(children)) > 0 ? `, ${children} Child${parseInt(String(children)) !== 1 ? 'ren' : ''}` : ''}`],
            ['Vehicle', vehicleLabel(vehicle)],
          ].map(([label, value], i) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 20px;${i % 2 === 0 ? '' : 'background:#f8fafc;'}border-bottom:1px solid #f1f5f9">
            <span style="font-size:13px;color:#64748b;font-weight:500">${label}</span>
            <span style="font-size:13px;color:#0f172a;font-weight:600">${value}</span>
          </div>`).join('')}
          ${special_requests ? `
          <div style="padding:12px 20px">
            <div style="font-size:13px;color:#64748b;font-weight:500;margin-bottom:4px">Special Requests</div>
            <div style="font-size:13px;color:#0f172a">${special_requests}</div>
          </div>` : ''}
        </div>
      </div>

      <!-- Price Estimate -->
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:12px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:.05em">Estimated Total</div>
          <div style="font-size:11px;color:#0284c7;margin-top:2px">Final price confirmed at ticketing</div>
        </div>
        <div style="font-size:24px;font-weight:700;color:#0c4a6e">€${estimatedPrice.toFixed(0)}</div>
      </div>

      <!-- Boarding Instructions -->
      <div style="background:#fefce8;border:1px solid #fde047;border-radius:12px;padding:16px 20px;margin-bottom:28px">
        <div style="font-size:12px;font-weight:700;color:#854d0e;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Important Boarding Information</div>
        <div style="font-size:13px;color:#713f12;line-height:1.7">
          Please arrive at the port of departure at least 90 minutes before sailing. Bring a valid government-issued ID or passport. Vehicles must be at the vehicle boarding lane 2 hours prior to departure. Keep your booking reference ${ref} accessible at all times.
        </div>
      </div>

      <!-- Contact -->
      <div style="border-top:1px solid #e2e8f0;padding-top:20px;text-align:center">
        <div style="font-size:13px;color:#64748b;line-height:1.8">
          Need to modify or cancel your booking? Contact our reservations team.<br>
          <strong style="color:#003087">reservations@minoanlines.gr</strong> · +30 210 414 5700<br>
          <span style="font-size:12px;color:#94a3b8">Minoan Lines S.A., 17 Venizelou Street, Heraklion, Crete 712 02, Greece</span>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#001A4D;padding:16px 32px;text-align:center">
      <div style="font-size:11px;color:#475569">
        This is an automated booking confirmation from Minoan Lines AI Platform · Powered by <strong style="color:#C9A84C">IntegraMind AI</strong>
      </div>
    </div>
  </div>
</body>
</html>`;

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: 'Minoan Lines Reservations <reports@integramindai.com>',
      to: [email],
      subject: `Booking Confirmed: ${formattedRoute} on ${travelDate} — Ref. ${ref}`,
      html,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      reference: ref,
      vessel,
      estimated_price: estimatedPrice,
      email_id: data?.id,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Booking failed' },
      { status: 500 }
    );
  }
}
