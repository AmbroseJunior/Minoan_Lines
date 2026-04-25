class Ticket {
  final String id;
  final String ticketNumber;
  final String title;
  final String description;
  final String? category;
  final String priority;
  final String status;
  final String? assignedTo;
  final String? aiDraftResponse;
  final int? aiConfidence;
  final int? estimatedResolutionHours;
  final String? slaDueAt;
  final int slaBreached;
  final String? submittedBy;
  final String createdAt;
  final String updatedAt;

  const Ticket({
    required this.id,
    required this.ticketNumber,
    required this.title,
    required this.description,
    this.category,
    required this.priority,
    required this.status,
    this.assignedTo,
    this.aiDraftResponse,
    this.aiConfidence,
    this.estimatedResolutionHours,
    this.slaDueAt,
    required this.slaBreached,
    this.submittedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Ticket.fromJson(Map<String, dynamic> j) => Ticket(
    id: j['id'] as String,
    ticketNumber: j['ticket_number'] as String,
    title: j['title'] as String,
    description: j['description'] as String,
    category: j['category'] as String?,
    priority: j['priority'] as String? ?? 'medium',
    status: j['status'] as String? ?? 'open',
    assignedTo: j['assigned_to'] as String?,
    aiDraftResponse: j['ai_draft_response'] as String?,
    aiConfidence: (j['ai_confidence'] as num?)?.toInt(),
    estimatedResolutionHours: (j['estimated_resolution_hours'] as num?)?.toInt(),
    slaDueAt: j['sla_due_at'] as String?,
    slaBreached: (j['sla_breached'] as num?)?.toInt() ?? 0,
    submittedBy: j['submitted_by'] as String?,
    createdAt: j['created_at'] as String? ?? '',
    updatedAt: j['updated_at'] as String? ?? '',
  );

  Ticket copyWith({String? status, String? resolution}) => Ticket(
    id: id, ticketNumber: ticketNumber, title: title, description: description,
    category: category, priority: priority, status: status ?? this.status,
    assignedTo: assignedTo, aiDraftResponse: aiDraftResponse,
    aiConfidence: aiConfidence, estimatedResolutionHours: estimatedResolutionHours,
    slaDueAt: slaDueAt, slaBreached: slaBreached, submittedBy: submittedBy,
    createdAt: createdAt, updatedAt: updatedAt,
  );
}

class ReportSummary {
  final String id;
  final String reportType;
  final String reportPeriod;
  final String? vesselName;
  final String status;
  final String? pdfPath;
  final double? co2EmissionsMt;
  final double? etsCostEur;
  final String createdAt;

  const ReportSummary({
    required this.id,
    required this.reportType,
    required this.reportPeriod,
    this.vesselName,
    required this.status,
    this.pdfPath,
    this.co2EmissionsMt,
    this.etsCostEur,
    required this.createdAt,
  });

  factory ReportSummary.fromJson(Map<String, dynamic> j) => ReportSummary(
    id: j['id'] as String,
    reportType: j['report_type'] as String,
    reportPeriod: j['report_period'] as String,
    vesselName: j['vessel_name'] as String?,
    status: j['status'] as String? ?? 'generated',
    pdfPath: j['pdf_path'] as String?,
    co2EmissionsMt: (j['co2_emissions_mt'] as num?)?.toDouble(),
    etsCostEur: (j['ets_cost_eur'] as num?)?.toDouble(),
    createdAt: j['created_at'] as String? ?? '',
  );
}

class ForecastSummary {
  final String route;
  final String model;
  final int periodsForecast;
  final double avgDailyPassengers;
  final String peakDay;
  final double peakPassengers;
  final double avgDailyRevenueEur;
  final double avgOccupancyPct;
  final List<ForecastDataPoint> forecastSample;

  const ForecastSummary({
    required this.route,
    required this.model,
    required this.periodsForecast,
    required this.avgDailyPassengers,
    required this.peakDay,
    required this.peakPassengers,
    required this.avgDailyRevenueEur,
    required this.avgOccupancyPct,
    required this.forecastSample,
  });

  factory ForecastSummary.fromJson(Map<String, dynamic> j) => ForecastSummary(
    route: j['route'] as String,
    model: j['model'] as String,
    periodsForecast: (j['periods_forecast'] as num).toInt(),
    avgDailyPassengers: (j['avg_daily_passengers'] as num).toDouble(),
    peakDay: j['peak_day'] as String,
    peakPassengers: (j['peak_passengers'] as num).toDouble(),
    avgDailyRevenueEur: (j['avg_daily_revenue_eur'] as num).toDouble(),
    avgOccupancyPct: (j['avg_occupancy_pct'] as num).toDouble(),
    forecastSample: (j['forecast_sample'] as List)
        .map((e) => ForecastDataPoint.fromJson(e as Map<String, dynamic>))
        .toList(),
  );
}

class ForecastDataPoint {
  final String ds;
  final double yhat;
  final double occupancyPct;
  final double revenueEur;

  const ForecastDataPoint({
    required this.ds,
    required this.yhat,
    required this.occupancyPct,
    required this.revenueEur,
  });

  factory ForecastDataPoint.fromJson(Map<String, dynamic> j) => ForecastDataPoint(
    ds: j['ds'] as String,
    yhat: (j['yhat'] as num).toDouble(),
    occupancyPct: (j['occupancy_pct'] as num?)?.toDouble() ?? 0,
    revenueEur: (j['revenue_eur'] as num?)?.toDouble() ?? 0,
  );
}