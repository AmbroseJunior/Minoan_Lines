import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../core/theme.dart';
import '../../models/vessel.dart';
import '../../providers/vessel_provider.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/risk_badge.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});
  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  final _queryCtrl = TextEditingController();
  VesselStatus? _selected;

  @override
  void dispose() {
    _queryCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final vesselsAsync = ref.watch(vesselsProvider);
    final queryState = ref.watch(vesselQueryProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(vesselsProvider),
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              pinned: true,
              backgroundColor: MinoanTheme.navy,
              title: const Text('Vessel Operations Dashboard'),
              actions: [
                IconButton(
                  icon: const Icon(Icons.refresh, color: Colors.white),
                  onPressed: () => ref.invalidate(vesselsProvider),
                ),
              ],
            ),
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // ── Stats row ──────────────────────────────────────────
                  vesselsAsync.when(
                    loading: () => _statsRow(null),
                    error: (e, _) => _errorBanner(e.toString()),
                    data: (vessels) => _statsRow(vessels),
                  ),
                  const SizedBox(height: 16),

                  // ── Map + fleet list ───────────────────────────────────
                  LayoutBuilder(builder: (context, c) {
                    final wide = c.maxWidth > 700;
                    return SizedBox(
                      height: 420,
                      child: wide
                          ? Row(children: [
                              Expanded(flex: 2, child: _mapCard(vesselsAsync)),
                              const SizedBox(width: 12),
                              SizedBox(width: 220, child: _fleetList(vesselsAsync)),
                            ])
                          : Column(children: [
                              SizedBox(height: 260, child: _mapCard(vesselsAsync)),
                              const SizedBox(height: 12),
                              SizedBox(height: 148, child: _fleetList(vesselsAsync)),
                            ]),
                    );
                  }),
                  const SizedBox(height: 16),

                  // ── Delay alerts ───────────────────────────────────────
                  vesselsAsync.maybeWhen(
                    data: (v) {
                      final high = v.where((x) => x.delayProbability > 0.7).toList();
                      return high.isEmpty ? const SizedBox.shrink() : _alertBanner(high);
                    },
                    orElse: () => const SizedBox.shrink(),
                  ),

                  if (vesselsAsync.hasValue) ...[
                    const SizedBox(height: 16),
                    // ── NL Query ───────────────────────────────────────
                    _nlQueryCard(queryState),
                  ],
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statsRow(List<VesselStatus>? vessels) {
    final total = vessels?.length ?? 0;
    final underway = vessels?.where((v) => v.isUnderway).length ?? 0;
    final highRisk = vessels?.where((v) => v.delayProbability > 0.7).length ?? 0;
    final inPort = vessels != null ? total - underway : 0;

    return Row(
      children: [
        Expanded(child: StatCard(label: 'Vessels',    value: '$total',    icon: Icons.directions_boat, color: MinoanTheme.blue)),
        const SizedBox(width: 10),
        Expanded(child: StatCard(label: 'Underway',   value: '$underway', icon: Icons.speed,           color: Colors.blue)),
        const SizedBox(width: 10),
        Expanded(child: StatCard(label: 'High Risk',  value: '$highRisk', icon: Icons.warning_amber,   color: highRisk > 0 ? MinoanTheme.danger : MinoanTheme.success)),
        const SizedBox(width: 10),
        Expanded(child: StatCard(label: 'In Port',    value: '$inPort',   icon: Icons.anchor,          color: MinoanTheme.grey)),
      ],
    );
  }

  Widget _mapCard(AsyncValue<List<VesselStatus>> async) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Map error: $e')),
        data: (vessels) {
          final valid = vessels.where((v) => v.latitude != null && v.longitude != null).toList();
          return FlutterMap(
            options: const MapOptions(initialCenter: LatLng(38.5, 20.0), initialZoom: 5.5),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.integramind.minoan',
              ),
              MarkerLayer(
                markers: valid.map((v) => Marker(
                  point: LatLng(v.latitude!, v.longitude!),
                  width: 32, height: 32,
                  child: GestureDetector(
                    onTap: () => setState(() => _selected = v),
                    child: Icon(
                      Icons.directions_boat,
                      color: MinoanTheme.riskColor(v.delayProbability),
                      size: 24,
                      shadows: const [Shadow(blurRadius: 4, color: Colors.black26)],
                    ),
                  ),
                )).toList(),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _fleetList(AsyncValue<List<VesselStatus>> async) {
    return Card(
      child: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (vessels) => ListView.separated(
          padding: EdgeInsets.zero,
          itemCount: vessels.length,
          separatorBuilder: (_, __) => const Divider(height: 1),
          itemBuilder: (context, i) {
            final v = vessels[i];
            final active = _selected?.name == v.name;
            return InkWell(
              onTap: () => setState(() => _selected = v),
              child: Container(
                color: active ? MinoanTheme.light : null,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: Row(children: [
                  Expanded(child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(v.name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                      Text(v.currentRoute ?? 'Route N/A',
                          style: const TextStyle(fontSize: 10, color: Colors.grey),
                          overflow: TextOverflow.ellipsis),
                    ],
                  )),
                  RiskBadge(probability: v.delayProbability),
                ]),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _alertBanner(List<VesselStatus> vessels) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: const Color(0xFFFEF2F2),
      border: Border.all(color: const Color(0xFFFCA5A5)),
      borderRadius: BorderRadius.circular(10),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          const Icon(Icons.warning_amber, color: MinoanTheme.danger, size: 16),
          const SizedBox(width: 6),
          Text('High Delay Risk Alert', style: TextStyle(color: MinoanTheme.danger, fontWeight: FontWeight.w600, fontSize: 13)),
        ]),
        const SizedBox(height: 6),
        ...vessels.map((v) => Padding(
          padding: const EdgeInsets.only(top: 3),
          child: Row(children: [
            Expanded(child: Text(v.name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF991B1B)))),
            Text('${(v.delayProbability * 100).toStringAsFixed(0)}% · ${v.currentRoute ?? ""}',
                style: const TextStyle(fontSize: 11, color: MinoanTheme.danger)),
          ]),
        )),
      ],
    ),
  );

  Widget _nlQueryCard(AsyncValue<String?> queryState) => Card(
    child: Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            const Icon(Icons.auto_awesome, color: MinoanTheme.gold, size: 16),
            const SizedBox(width: 6),
            const Text('AI Fleet Query', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          ]),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(
              child: TextField(
                controller: _queryCtrl,
                decoration: const InputDecoration(
                  hintText: 'e.g. "Which vessels are running more than 30 minutes late today?"',
                  isDense: true,
                ),
                onSubmitted: (_) => _sendQuery(),
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton(
              onPressed: queryState.isLoading ? null : _sendQuery,
              child: queryState.isLoading
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('Ask DeepSeek'),
            ),
          ]),
          queryState.when(
            loading: () => const SizedBox.shrink(),
            error: (e, _) => Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text('Error: $e', style: const TextStyle(color: MinoanTheme.danger, fontSize: 12)),
            ),
            data: (answer) => answer == null
                ? const SizedBox.shrink()
                : Container(
                    margin: const EdgeInsets.only(top: 10),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: MinoanTheme.light,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(answer, style: const TextStyle(fontSize: 13)),
                  ),
          ),
        ],
      ),
    ),
  );

  void _sendQuery() {
    final q = _queryCtrl.text.trim();
    if (q.isEmpty) return;
    ref.read(vesselQueryProvider.notifier).query(q);
  }

  Widget _errorBanner(String msg) => Container(
    padding: const EdgeInsets.all(10),
    decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(8)),
    child: Text('Error loading vessels: $msg', style: const TextStyle(color: MinoanTheme.danger, fontSize: 12)),
  );
}