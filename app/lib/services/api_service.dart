import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import '../core/config.dart';
import '../models/vessel.dart';
import '../models/ticket.dart';

/// Central HTTP client for FastAPI backend.
/// All AI endpoints, vessel ops, helpdesk, compliance, analytics.
class ApiService {
  ApiService._();
  static final ApiService instance = ApiService._();

  late final Dio _dio = Dio(BaseOptions(
    baseUrl: AppConfig.apiBaseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 60),
    headers: {'Content-Type': 'application/json'},
  ))
    ..interceptors.add(_LogInterceptor())
    ..interceptors.add(_RetryInterceptor());

  // ── Vessels ───────────────────────────────────────────────────────────────

  Future<List<VesselStatus>> fetchVessels() async {
    final res = await _dio.get<List>('/vessels');
    return res.data!.map((e) => VesselStatus.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<VesselStatus> fetchVesselStatus(String name) async {
    final res = await _dio.get<Map<String, dynamic>>(
      '/vessels/${Uri.encodeComponent(name)}/status',
    );
    return VesselStatus.fromJson(res.data!);
  }

  Future<DelayPrediction> fetchDelayPrediction(String name) async {
    final res = await _dio.get<Map<String, dynamic>>(
      '/vessels/${Uri.encodeComponent(name)}/delay-prediction',
    );
    return DelayPrediction.fromJson(res.data!);
  }

  Future<String> queryVessels(String question) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/vessels/query',
      data: {'question': question},
    );
    return res.data!['answer'] as String;
  }

  // ── Tickets ───────────────────────────────────────────────────────────────

  Future<List<Ticket>> fetchTickets({String? status, String? priority}) async {
    final res = await _dio.get<List>('/tickets', queryParameters: {
      if (status != null) 'status': status,
      if (priority != null) 'priority': priority,
    });
    return res.data!.map((e) => Ticket.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Ticket> createTicket({
    required String title,
    required String description,
    String? submittedBy,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>('/tickets', data: {
      'title': title,
      'description': description,
      if (submittedBy != null) 'submitted_by': submittedBy,
    });
    return Ticket.fromJson(res.data!);
  }

  Future<Ticket> updateTicket(String id, Map<String, dynamic> data) async {
    final res = await _dio.patch<Map<String, dynamic>>('/tickets/$id', data: data);
    return Ticket.fromJson(res.data!);
  }

  // ── Compliance ────────────────────────────────────────────────────────────

  Future<ReportSummary> generateReport({
    required String reportType,
    required String reportPeriod,
    String? vesselName,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>('/reports/generate', data: {
      'report_type': reportType,
      'report_period': reportPeriod,
      if (vesselName != null) 'vessel_name': vesselName,
    });
    return ReportSummary.fromJson(res.data!);
  }

  Future<ReportSummary?> fetchLatestReport(String type) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/reports/$type/latest');
      return ReportSummary.fromJson(res.data!);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      rethrow;
    }
  }

  Future<Map<String, dynamic>> ingestFuelData(Map<String, dynamic> data) async {
    final res = await _dio.post<Map<String, dynamic>>('/compliance/fuel-data', data: data);
    return res.data!;
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  Future<ForecastSummary> runForecast({
    required String route,
    int periods = 90,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>('/analytics/forecast', data: {
      'route': route,
      'periods': periods,
    });
    return ForecastSummary.fromJson(res.data!);
  }

  Future<Map<String, dynamic>> fetchPerformanceSummary(String query) async {
    final res = await _dio.get<Map<String, dynamic>>(
      '/analytics/performance-summary',
      queryParameters: {'query': query},
    );
    return res.data!;
  }

  // ── Streaming chat (SSE) ──────────────────────────────────────────────────

  /// Returns a Stream of text chunks from the Claude customer agent.
  /// Also emits special events as control messages (session_id, escalation).
  Stream<ChatEvent> streamChat({
    required String message,
    String? sessionId,
  }) async* {
    final response = await _dio.post<ResponseBody>(
      '/chat',
      data: {'message': message, if (sessionId != null) 'session_id': sessionId},
      options: Options(responseType: ResponseType.stream),
    );

    final stream = response.data!.stream;
    final buffer = StringBuffer();

    await for (final chunk in stream) {
      buffer.write(utf8.decode(chunk));
      final raw = buffer.toString();
      final lines = raw.split('\n');

      // Keep incomplete last line in buffer
      buffer.clear();
      if (!raw.endsWith('\n')) {
        buffer.write(lines.removeLast());
      }

      for (final line in lines) {
        if (!line.startsWith('data: ')) continue;
        final data = line.substring(6).trim();
        if (data.isEmpty) continue;

        try {
          final parsed = jsonDecode(data) as Map<String, dynamic>;
          final type = parsed['type'] as String?;

          if (type == 'session') {
            yield ChatEvent.session(parsed['session_id'] as String);
          } else if (type == 'chunk') {
            yield ChatEvent.text(parsed['text'] as String);
          } else if (type == 'done') {
            yield ChatEvent.done(
              escalate: parsed['escalate'] as bool? ?? false,
              confidence: (parsed['confidence'] as num?)?.toDouble() ?? 1.0,
            );
          }
        } catch (_) {
          // non-JSON line, skip
        }
      }
    }
  }

  Future<List<Map<String, dynamic>>> fetchChatHistory(String sessionId) async {
    final res = await _dio.get<Map<String, dynamic>>('/chat/$sessionId/history');
    final msgs = res.data!['messages'] as List;
    return msgs.cast<Map<String, dynamic>>();
  }
}

// ── Chat event model ─────────────────────────────────────────────────────────

enum ChatEventType { session, text, done }

class ChatEvent {
  final ChatEventType type;
  final String? text;
  final String? sessionId;
  final bool escalate;
  final double confidence;

  const ChatEvent._({
    required this.type,
    this.text,
    this.sessionId,
    this.escalate = false,
    this.confidence = 1.0,
  });

  factory ChatEvent.session(String id) =>
      ChatEvent._(type: ChatEventType.session, sessionId: id);
  factory ChatEvent.text(String t) =>
      ChatEvent._(type: ChatEventType.text, text: t);
  factory ChatEvent.done({bool escalate = false, double confidence = 1.0}) =>
      ChatEvent._(type: ChatEventType.done, escalate: escalate, confidence: confidence);
}

// ── Interceptors ──────────────────────────────────────────────────────────────

class _LogInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // ignore: avoid_print
    print('[ApiService] ${err.requestOptions.method} ${err.requestOptions.path} → ${err.response?.statusCode}');
    handler.next(err);
  }
}

class _RetryInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Surface clean error messages
    if (err.response?.statusCode == 429) {
      handler.reject(
        DioException(
          requestOptions: err.requestOptions,
          message: 'Rate limit exceeded. Please wait a moment.',
          type: DioExceptionType.badResponse,
        ),
      );
      return;
    }
    handler.next(err);
  }
}