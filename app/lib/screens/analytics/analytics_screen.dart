import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/theme.dart';
import '../../providers/analytics_provider.dart';
import '../../widgets/stat_card.dart';

class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});
  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  final _queryCtrl = TextEditingController(
      text: 'Summarise Q3 performance vs forecast and flag underperforming routes');

  @override
  void dispose() { _queryCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final routes       = ref.watch(availableRoutesProvider);
    final selectedRoute = ref.watch(selectedRouteProvider);
    final periods      = ref.watch(forecastPeriodsProvider);
    final forecastAsync = ref.watch(forecastProvider);
    final summaryState = ref.watch(performanceSummaryProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: MinoanTheme.navy,
        title: const Text('Demand & Revenue Intelligence'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

          // ── Controls ───────────────────────────────────────────────────────
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Forecast Settings', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                const SizedBox(height: 12),
                Row(children: [
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Route', style: TextStyle(fontSize: 11, color: Colors.grey)),
                    const SizedBox(height: 4),
                    DropdownButtonFormField<String>(
                      value: selectedRoute,
                      decoration: const InputDecoration(isDense: true),
                      items: routes.map((r) => DropdownMenuItem(
                        value: r,
                        child: Text(r.replaceAll('-', ' → '), style: const TextStyle(fontSize: 12)),
                      )).toList(),
                      onChanged: (v) => ref.read(selectedRouteProvider.notifier).state = v!,
                    ),
                  ])),
                  const SizedBox(width: 12),
                  SizedBox(width: 110, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Forecast Days', style: TextStyle(fontSize: 11, color: Colors.grey)),
                    const SizedBox(height: 4),
                    TextFormField(
                      initialValue: periods.toString(),
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(isDense: true),
                      onChanged: (v) {
                        final n = int.tryParse(v);
                        if (n != null && n > 0) ref.read(forecastPeriodsProvider.notifier).state = n;
                      },
                    ),
                  ])),
                  const SizedBox(width: 12),
                  Padding(
                    padding: const EdgeInsets.only(top: 16),
                    child: ElevatedButton(
                      onPressed: () => ref.invalidate(forecastProvider),
                      child: const Text('Run Forecast'),
                    ),
                  ),
                ]),
              ]),
            ),
          ),
          const SizedBox(height: 14),

          // ── Forecast results ───────────────────────────────────────────────
          forecastAsync.when(
            loading: () => const Center(child: Padding(
              padding: EdgeInsets.symmetric(vertical: 40),
              child: CircularProgressIndicator(),
            )),
            error: (e, _) => Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text('Forecast error: $e', style: const TextStyle(color: MinoanTheme.danger)),
              ),
            ),
            data: (forecast) => Column(children: [
              // Stats row
              Row(children: [
                Expanded(child: StatCard(label: 'Avg Daily Pax',    value: forecast.avgDailyPassengers.toStringAsFixed(0), icon: Icons.people,   color: MinoanTheme.blue)),
                const SizedBox(width: 8),
                Expanded(child: StatCard(label: 'Avg Occupancy',    value: '${forecast.avgOccupancyPct.toStringAsFixed(1)}%', icon: Icons.airline_seat_recline_normal, color: Colors.green)),
                const SizedBox(width: 8),
                Expanded(child: StatCard(label: 'Avg Daily Revenue',value: '€${forecast.avgDailyRevenueEur.toStringAsFixed(0)}', icon: Icons.euro, color: MinoanTheme.gold)),
                const SizedBox(width: 8),
                Expanded(child: StatCard(label: 'Model',            value: forecast.model.toUpperCase(), icon: Icons.analytics, color: Colors.purple)),
              ]),
              const SizedBox(height: 14),

              // Chart
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('7-Day Preview — ${selectedRoute.replaceAll("-", " → ")}',
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 220,
                      child: LineChart(LineChartData(
                        gridData: FlGridData(
                          show: true,
                          getDrawingHorizontalLine: (_) => FlLine(color: Colors.grey.shade100, strokeWidth: 1),
                        ),
                        titlesData: FlTitlesData(
                          leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40,
                            getTitlesWidget: (v, _) => Text(v.toInt().toString(), style: const TextStyle(fontSize: 9, color: Colors.grey)))),
                          bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 22,
                            getTitlesWidget: (v, _) {
                              final i = v.toInt();
                              if (i >= 0 && i < forecast.forecastSample.length) {
                                final d = DateTime.tryParse(forecast.forecastSample[i].ds);
                                return Text(d != null ? '${d.day}/${d.month}' : '', style: const TextStyle(fontSize: 9, color: Colors.grey));
                              }
                              return const SizedBox.shrink();
                            })),
                          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        ),
                        borderData: FlBorderData(show: false),
                        lineBarsData: [
                          LineChartBarData(
                            spots: forecast.forecastSample.asMap().entries.map((e) =>
                                FlSpot(e.key.toDouble(), e.value.yhat)).toList(),
                            isCurved: true,
                            color: MinoanTheme.blue,
                            barWidth: 2.5,
                            belowBarData: BarAreaData(show: true, color: MinoanTheme.blue.withOpacity(0.08)),
                            dotData: const FlDotData(show: false),
                          ),
                        ],
                      )),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Peak: ${DateTime.tryParse(forecast.peakDay) != null ? _fmtDate(DateTime.parse(forecast.peakDay)) : forecast.peakDay}'
                      ' — ${forecast.peakPassengers.toStringAsFixed(0)} passengers',
                      style: const TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                  ]),
                ),
              ),
            ]),
          ),
          const SizedBox(height: 14),

          // ── NL performance summary ──────────────────────────────────────────
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Row(children: [
                  Icon(Icons.auto_awesome, color: MinoanTheme.gold, size: 16),
                  SizedBox(width: 6),
                  Text('AI Performance Summary', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                ]),
                const SizedBox(height: 10),
                Row(children: [
                  Expanded(child: TextField(
                    controller: _queryCtrl,
                    decoration: const InputDecoration(isDense: true),
                  )),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: summaryState.isLoading
                        ? null
                        : () => ref.read(performanceSummaryProvider.notifier).fetch(_queryCtrl.text),
                    child: summaryState.isLoading
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Ask DeepSeek'),
                  ),
                ]),
                summaryState.when(
                  loading: () => const SizedBox.shrink(),
                  error: (e, _) => Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text('Error: $e', style: const TextStyle(color: MinoanTheme.danger, fontSize: 12)),
                  ),
                  data: (data) => data == null ? const SizedBox.shrink() : Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: MinoanTheme.light, borderRadius: BorderRadius.circular(8)),
                      child: Text(data['ai_summary'] as String? ?? '', style: const TextStyle(fontSize: 13, height: 1.5)),
                    ),
                  ),
                ),
              ]),
            ),
          ),
        ]),
      ),
    );
  }

  String _fmtDate(DateTime d) =>
      '${_weekday(d.weekday)}, ${d.day} ${_month(d.month)} ${d.year}';

  String _weekday(int w) => const ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][w - 1];
  String _month(int m) => const ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1];
}