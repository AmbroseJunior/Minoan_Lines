/// IntegraMind AI × Minoan Lines
/// Central app configuration — reads from .env at runtime.
library;

import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  AppConfig._();

  static String get supabaseUrl =>
      dotenv.env['SUPABASE_URL'] ?? '';

  static String get supabaseAnonKey =>
      dotenv.env['SUPABASE_ANON_KEY'] ?? '';

  static String get apiBaseUrl =>
      dotenv.env['API_BASE_URL'] ?? 'http://localhost:8000';

  // Minoan Lines brand
  static const String appName = 'Minoan AI Platform';
  static const String appVersion = '1.0.0';
  static const String builtBy = 'IntegraMind AI';
  static const String clientName = 'Minoan Lines S.A.';
  static const String aiModel = 'claude-sonnet-4-20250514';

  static const List<String> vessels = [
    'Knossos Palace',
    'Festos Palace',
    'Mykonos Palace',
    'Kydon Palace',
    'Santorini Palace',
    'Europa Palace',
    'Cruise Olympia',
    'Cruise Europa',
  ];
}