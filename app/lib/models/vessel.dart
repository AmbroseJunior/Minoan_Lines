class VesselStatus {
  final String name;
  final String? mmsi;
  final String? imo;
  final double? latitude;
  final double? longitude;
  final double? speedKnots;
  final double? heading;
  final String? navStatus;
  final String? currentRoute;
  final String? departurePort;
  final String? destinationPort;
  final String? eta;
  final int delayMinutes;
  final double delayProbability;
  final String? positionUpdatedAt;

  const VesselStatus({
    required this.name,
    this.mmsi,
    this.imo,
    this.latitude,
    this.longitude,
    this.speedKnots,
    this.heading,
    this.navStatus,
    this.currentRoute,
    this.departurePort,
    this.destinationPort,
    this.eta,
    this.delayMinutes = 0,
    this.delayProbability = 0.0,
    this.positionUpdatedAt,
  });

  factory VesselStatus.fromJson(Map<String, dynamic> j) => VesselStatus(
    name: j['name'] as String,
    mmsi: j['mmsi'] as String?,
    imo: j['imo'] as String?,
    latitude: (j['latitude'] as num?)?.toDouble(),
    longitude: (j['longitude'] as num?)?.toDouble(),
    speedKnots: (j['speed_knots'] as num?)?.toDouble(),
    heading: (j['heading'] as num?)?.toDouble(),
    navStatus: j['nav_status'] as String?,
    currentRoute: j['current_route'] as String?,
    departurePort: j['departure_port'] as String?,
    destinationPort: j['destination_port'] as String?,
    eta: j['eta'] as String?,
    delayMinutes: (j['delay_minutes'] as num?)?.toInt() ?? 0,
    delayProbability: (j['delay_probability'] as num?)?.toDouble() ?? 0.0,
    positionUpdatedAt: j['position_updated_at'] as String?,
  );

  String get riskLevel {
    if (delayProbability > 0.70) return 'HIGH';
    if (delayProbability > 0.40) return 'MEDIUM';
    return 'LOW';
  }

  bool get isUnderway => (speedKnots ?? 0) > 1.0;
}

class DelayPrediction {
  final String vesselName;
  final double delayProbability;
  final int estimatedDelayMinutes;
  final String riskLevel;
  final Map<String, double> factors;

  const DelayPrediction({
    required this.vesselName,
    required this.delayProbability,
    required this.estimatedDelayMinutes,
    required this.riskLevel,
    required this.factors,
  });

  factory DelayPrediction.fromJson(Map<String, dynamic> j) => DelayPrediction(
    vesselName: j['vessel_name'] as String,
    delayProbability: (j['delay_probability'] as num).toDouble(),
    estimatedDelayMinutes: (j['estimated_delay_minutes'] as num).toInt(),
    riskLevel: j['risk_level'] as String,
    factors: Map<String, double>.from(
      (j['factors'] as Map).map((k, v) => MapEntry(k as String, (v as num).toDouble())),
    ),
  );
}