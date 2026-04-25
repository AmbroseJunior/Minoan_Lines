import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/ticket.dart';
import '../services/api_service.dart';

final ticketFilterProvider = StateProvider<String?>((ref) => null);

final ticketsProvider = FutureProvider.autoDispose<List<Ticket>>((ref) async {
  final status = ref.watch(ticketFilterProvider);
  return ApiService.instance.fetchTickets(status: status);
});

final selectedTicketProvider = StateProvider<Ticket?>((ref) => null);

final ticketFormProvider =
    StateNotifierProvider<TicketFormNotifier, TicketFormState>((ref) {
  return TicketFormNotifier();
});

class TicketFormState {
  final bool submitting;
  final String? error;
  final Ticket? lastCreated;
  const TicketFormState({this.submitting = false, this.error, this.lastCreated});
  TicketFormState copyWith({bool? submitting, String? error, Ticket? lastCreated}) =>
      TicketFormState(
        submitting: submitting ?? this.submitting,
        error: error,
        lastCreated: lastCreated ?? this.lastCreated,
      );
}

class TicketFormNotifier extends StateNotifier<TicketFormState> {
  TicketFormNotifier() : super(const TicketFormState());

  Future<void> submit({
    required String title,
    required String description,
    String? submittedBy,
    required WidgetRef ref,
  }) async {
    state = state.copyWith(submitting: true, error: null);
    try {
      final ticket = await ApiService.instance.createTicket(
        title: title,
        description: description,
        submittedBy: submittedBy,
      );
      state = state.copyWith(submitting: false, lastCreated: ticket);
      ref.invalidate(ticketsProvider);
    } catch (e) {
      state = state.copyWith(submitting: false, error: e.toString());
    }
  }

  Future<void> updateStatus(
    String id,
    String status,
    WidgetRef ref,
  ) async {
    await ApiService.instance.updateTicket(id, {'status': status});
    ref.invalidate(ticketsProvider);
  }
}