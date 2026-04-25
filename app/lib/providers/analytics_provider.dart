import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/ticket.dart';
import '../services/api_service.dart';

const _defaultRoutes = [
  'Piraeus-Heraklion', 'Piraeus-Chania',
  'Ancona-Patras', 'Venice-Igoumenitsa',
  'Patras-Ancona', 'Igoumenitsa-Venice',
];

final selectedRouteProvider = StateProvider<String>((ref) => _defaultRoutes.first);
final forecastPeriodsProvider = StateProvider<int>((ref) => 90);
final availableRoutesProvider = Provider<List<String>>((ref) => _defaultRoutes);

final forecastProvider = FutureProvider.autoDispose<ForecastSummary>((ref) async {
  final route = ref.watch(selectedRouteProvider);
  final periods = ref.watch(forecastPeriodsProvider);
  return ApiService.instance.runForecast(route: route, periods: periods);
});

final performanceSummaryProvider =
    StateNotifierProvider<PerformanceSummaryNotifier, AsyncValue<Map<String, dynamic>?>>((ref) {
  return PerformanceSummaryNotifier();
});

class PerformanceSummaryNotifier extends StateNotifier<AsyncValue<Map<String, dynamic>?>> {
  PerformanceSummaryNotifier() : super(const AsyncValue.data(null));

  Future<void> fetch(String query) async {
    state = const AsyncValue.loading();
    try {
      final data = await ApiService.instance.fetchPerformanceSummary(query);
      state = AsyncValue.data(data);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}