import 'package:supabase_flutter/supabase_flutter.dart';

/// Thin wrapper around the Supabase client.
/// Used for real-time subscriptions and direct table reads
/// (audit logs, conversation history).
class SupabaseService {
  SupabaseService._();
  static final SupabaseService instance = SupabaseService._();

  SupabaseClient get client => Supabase.instance.client;

  // ── Voyage events real-time stream ────────────────────────────────────────

  Stream<List<Map<String, dynamic>>> watchVoyageEvents() =>
      client
          .from('voyage_events')
          .stream(primaryKey: ['id'])
          .order('created_at', ascending: false)
          .limit(50);

  // ── Ticket real-time stream ───────────────────────────────────────────────

  Stream<List<Map<String, dynamic>>> watchTickets() =>
      client
          .from('tickets')
          .stream(primaryKey: ['id'])
          .order('created_at', ascending: false)
          .limit(100);

  // ── Conversation history ──────────────────────────────────────────────────

  Future<List<Map<String, dynamic>>> getConversationMessages(
    String sessionId,
  ) async {
    final res = await client
        .from('conversation_messages')
        .select()
        .eq('session_id', sessionId)
        .order('created_at');
    return List<Map<String, dynamic>>.from(res as List);
  }

  // ── Compliance reports ────────────────────────────────────────────────────

  Stream<List<Map<String, dynamic>>> watchComplianceReports() =>
      client
          .from('compliance_reports')
          .stream(primaryKey: ['id'])
          .order('created_at', ascending: false)
          .limit(20);

  // ── Fuel consumption records ──────────────────────────────────────────────

  Future<List<Map<String, dynamic>>> getFuelRecords({
    String? vesselName,
  }) async {
    var query = client.from('fuel_consumption_records').select();
    if (vesselName != null) {
      query = query.eq('vessel_name', vesselName) as dynamic;
    }
    final res = await (query as dynamic).order('departure_time', ascending: false).limit(200);
    return List<Map<String, dynamic>>.from(res as List);
  }
}