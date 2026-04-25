import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/vessel.dart';
import '../services/api_service.dart';

// ── Vessel list ───────────────────────────────────────────────────────────────

final vesselsProvider = FutureProvider.autoDispose<List<VesselStatus>>((ref) async {
  return ApiService.instance.fetchVessels();
});

// ── Selected vessel ───────────────────────────────────────────────────────────

final selectedVesselProvider = StateProvider<VesselStatus?>((ref) => null);

// ── NL query answer ───────────────────────────────────────────────────────────

final vesselQueryProvider =
    StateNotifierProvider<VesselQueryNotifier, AsyncValue<String?>>((ref) {
  return VesselQueryNotifier();
});

class VesselQueryNotifier extends StateNotifier<AsyncValue<String?>> {
  VesselQueryNotifier() : super(const AsyncValue.data(null));

  Future<void> query(String question) async {
    state = const AsyncValue.loading();
    try {
      final answer = await ApiService.instance.queryVessels(question);
      state = AsyncValue.data(answer);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  void clear() => state = const AsyncValue.data(null);
}