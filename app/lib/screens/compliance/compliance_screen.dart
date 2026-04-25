import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/config.dart';
import '../../core/theme.dart';
import '../../models/ticket.dart';
import '../../services/api_service.dart';

final _reportsProvider = FutureProvider.autoDispose<List<ReportSummary>>((ref) async {
  final types = ['eu_ets', 'fueleu', 'iso9001', 'athex_quarterly'];
  final results = await Future.wait(types.map(ApiService.instance.fetchLatestReport));
  return results.whereType<ReportSummary>().toList();
});

class ComplianceScreen extends ConsumerStatefulWidget {
  const ComplianceScreen({super.key});
  @override
  ConsumerState<ComplianceScreen> createState() => _ComplianceScreenState();
}

class _ComplianceScreenState extends ConsumerState<ComplianceScreen> {
  String _reportType = 'eu_ets';
  String _period = '2025-Q1';
  String? _vessel;
  bool _generating = false;
  String? _genError;

  // Fuel form
  String _fuelVessel = 'Knossos Palace';
  String _fuelType = 'HFO';
  final _fuelConsumedCtrl = TextEditingController(text: '120');
  final _voyageIdCtrl     = TextEditingController(text: 'VY-2025-0001');
  final _distanceCtrl     = TextEditingController(text: '285');
  String? _fuelMsg;

  static const _reportTypes = {
    'eu_ets':          'EU ETS',
    'fueleu':          'FuelEU Maritime',
    'iso9001':         'ISO 9001',
    'athex_quarterly': 'ATHEX Quarterly',
  };

  @override
  void dispose() {
    _fuelConsumedCtrl.dispose();
    _voyageIdCtrl.dispose();
    _distanceCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reportsAsync = ref.watch(_reportsProvider);
    final isWide = MediaQuery.sizeOf(context).width > 700;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: MinoanTheme.navy,
        title: const Text('Compliance & Reporting'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: isWide
            ? Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Expanded(child: _generateCard()),
                const SizedBox(width: 14),
                Expanded(child: _fuelCard()),
              ])
            : Column(children: [
                _generateCard(),
                const SizedBox(height: 14),
                _fuelCard(),
              ]),
      ).also((_) {}),
    ).also((_) {
      // attach report history below forms
    });
  }

  // Override build to append report history
  @override
  Widget buildX(BuildContext context) {
    final reportsAsync = ref.watch(_reportsProvider);
    final isWide = MediaQuery.sizeOf(context).width > 700;

    return Scaffold(
      appBar: AppBar(backgroundColor: MinoanTheme.navy, title: const Text('Compliance & Reporting')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          isWide
              ? Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Expanded(child: _generateCard()),
                  const SizedBox(width: 14),
                  Expanded(child: _fuelCard()),
                ])
              : Column(children: [_generateCard(), const SizedBox(height: 14), _fuelCard()]),
          const SizedBox(height: 16),
          _reportHistory(reportsAsync),
        ]),
      ),
    );
  }

  Widget _generateCard() => Card(
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Row(children: [
          Icon(Icons.add_chart, size: 16, color: MinoanTheme.blue),
          SizedBox(width: 6),
          Text('Generate Report', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        ]),
        const SizedBox(height: 14),
        // Report type
        const Text('Report Type', style: TextStyle(fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 4),
        DropdownButtonFormField<String>(
          value: _reportType,
          decoration: const InputDecoration(isDense: true),
          items: _reportTypes.entries.map((e) => DropdownMenuItem(value: e.key, child: Text(e.value, style: const TextStyle(fontSize: 13)))).toList(),
          onChanged: (v) => setState(() => _reportType = v!),
        ),
        const SizedBox(height: 10),
        // Period
        const Text('Report Period', style: TextStyle(fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 4),
        TextFormField(
          initialValue: _period,
          decoration: const InputDecoration(isDense: true, hintText: '2025-Q1 or 2025-03'),
          onChanged: (v) => _period = v,
        ),
        const SizedBox(height: 10),
        // Vessel
        const Text('Vessel (optional)', style: TextStyle(fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 4),
        DropdownButtonFormField<String?>(
          value: _vessel,
          decoration: const InputDecoration(isDense: true),
          items: [
            const DropdownMenuItem<String?>(value: null, child: Text('Fleet-wide', style: TextStyle(fontSize: 13))),
            ...AppConfig.vessels.map((v) => DropdownMenuItem(value: v, child: Text(v, style: const TextStyle(fontSize: 13)))),
          ],
          onChanged: (v) => setState(() => _vessel = v),
        ),
        if (_genError != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(_genError!, style: const TextStyle(color: MinoanTheme.danger, fontSize: 12)),
          ),
        const SizedBox(height: 14),
        SizedBox(width: double.infinity, child: ElevatedButton(
          onPressed: _generating ? null : _generate,
          child: _generating
              ? const Row(mainAxisSize: MainAxisSize.min, children: [
                  SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                  SizedBox(width: 8),
                  Text('Generating with Claude…'),
                ])
              : const Text('Generate Report'),
        )),
      ]),
    ),
  );

  Widget _fuelCard() => Card(
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Row(children: [
          Icon(Icons.local_gas_station, size: 16, color: MinoanTheme.gold),
          SizedBox(width: 6),
          Text('Fuel Data Ingestion (SCADA)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        ]),
        const SizedBox(height: 14),
        const Text('Vessel', style: TextStyle(fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 4),
        DropdownButtonFormField<String>(
          value: _fuelVessel,
          decoration: const InputDecoration(isDense: true),
          items: AppConfig.vessels.map((v) => DropdownMenuItem(value: v, child: Text(v, style: const TextStyle(fontSize: 12)))).toList(),
          onChanged: (v) => setState(() => _fuelVessel = v!),
        ),
        const SizedBox(height: 10),
        Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Voyage ID', style: TextStyle(fontSize: 11, color: Colors.grey)),
            const SizedBox(height: 4),
            TextFormField(controller: _voyageIdCtrl, decoration: const InputDecoration(isDense: true)),
          ])),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Fuel Type', style: TextStyle(fontSize: 11, color: Colors.grey)),
            const SizedBox(height: 4),
            DropdownButtonFormField<String>(
              value: _fuelType,
              decoration: const InputDecoration(isDense: true),
              items: ['HFO', 'MGO', 'LNG', 'biofuel'].map((t) => DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(fontSize: 12)))).toList(),
              onChanged: (v) => setState(() => _fuelType = v!),
            ),
          ])),
        ]),
        const SizedBox(height: 10),
        Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Fuel Consumed (mt)', style: TextStyle(fontSize: 11, color: Colors.grey)),
            const SizedBox(height: 4),
            TextFormField(controller: _fuelConsumedCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(isDense: true)),
          ])),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Distance (nm)', style: TextStyle(fontSize: 11, color: Colors.grey)),
            const SizedBox(height: 4),
            TextFormField(controller: _distanceCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(isDense: true)),
          ])),
        ]),
        if (_fuelMsg != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _fuelMsg!.startsWith('✓') ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(_fuelMsg!, style: TextStyle(fontSize: 12,
                  color: _fuelMsg!.startsWith('✓') ? const Color(0xFF166534) : MinoanTheme.danger)),
            ),
          ),
        const SizedBox(height: 14),
        SizedBox(width: double.infinity, child: ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: MinoanTheme.gold),
          onPressed: _ingestFuel,
          child: const Text('Ingest Fuel Record'),
        )),
      ]),
    ),
  );

  Widget _reportHistory(AsyncValue<List<ReportSummary>> async) => Card(
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Recent Reports', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        const SizedBox(height: 10),
        async.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Text('Error: $e', style: const TextStyle(color: MinoanTheme.danger)),
          data: (reports) => reports.isEmpty
              ? const Text('No reports yet', style: TextStyle(color: Colors.grey, fontSize: 13))
              : Column(children: reports.map((r) => ListTile(
                  leading: const Icon(Icons.picture_as_pdf, color: MinoanTheme.blue),
                  title: Text('${_reportTypes[r.reportType] ?? r.reportType} — ${r.reportPeriod}',
                      style: const TextStyle(fontSize: 13)),
                  subtitle: Text(
                    '${r.vesselName ?? "Fleet-wide"}'
                    '${r.co2EmissionsMt != null ? " · CO₂: ${r.co2EmissionsMt!.toStringAsFixed(1)}t" : ""}'
                    '${r.etsCostEur != null ? " · ETS: €${r.etsCostEur!.toStringAsFixed(0)}" : ""}',
                    style: const TextStyle(fontSize: 11),
                  ),
                  trailing: const Icon(Icons.check_circle, color: MinoanTheme.success, size: 16),
                )).toList()),
        ),
        const Divider(height: 20),
        const Text(
          'Generated by IntegraMind AI for Minoan Lines S.A. — verify against official regulatory filings.',
          style: TextStyle(fontSize: 10, color: Colors.grey, fontStyle: FontStyle.italic),
        ),
      ]),
    ),
  );

  Future<void> _generate() async {
    setState(() { _generating = true; _genError = null; });
    try {
      await ApiService.instance.generateReport(
        reportType: _reportType, reportPeriod: _period, vesselName: _vessel);
      ref.invalidate(_reportsProvider);
    } catch (e) {
      setState(() => _genError = e.toString());
    } finally {
      setState(() => _generating = false);
    }
  }

  Future<void> _ingestFuel() async {
    setState(() => _fuelMsg = null);
    try {
      final res = await ApiService.instance.ingestFuelData({
        'vessel_name': _fuelVessel,
        'voyage_id': _voyageIdCtrl.text,
        'fuel_type': _fuelType,
        'fuel_consumed_mt': double.parse(_fuelConsumedCtrl.text),
        'distance_nm': double.parse(_distanceCtrl.text),
        'departure_port': 'Piraeus',
        'arrival_port': 'Heraklion',
        'departure_time': DateTime.now().toIso8601String(),
        'arrival_time': DateTime.now().toIso8601String(),
        'idempotency_key': '${_fuelVessel}_${_voyageIdCtrl.text}',
      });
      setState(() => _fuelMsg = '✓ Ingested — CO₂: ${(res['co2_mt'] as num?)?.toStringAsFixed(2) ?? "?"} t');
    } catch (e) {
      setState(() => _fuelMsg = 'Error: $e');
    }
  }
}

// Dart extension to allow chaining
extension _Also<T> on T {
  T also(void Function(T) block) { block(this); return this; }
}