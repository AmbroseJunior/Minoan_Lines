/// IntegraMind AI × Minoan Lines
/// Central app configuration — values injected at build time via --dart-define.
library;

class AppConfig {
  AppConfig._();

  static const String supabaseUrl =
      String.fromEnvironment('SUPABASE_URL', defaultValue: '');

  static const String supabaseAnonKey =
      String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: '');

  static const String apiBaseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:8000');

  static const String appName    = 'Minoan AI Platform';
  static const String appVersion = '1.0.0';
  static const String builtBy    = 'IntegraMind AI';
  static const String clientName = 'Minoan Lines S.A.';
  static const String aiModel    = 'deepseek-chat';

  static const List<String> vessels = [
    'Knossos Palace', 'Festos Palace', 'Mykonos Palace', 'Kydon Palace',
    'Santorini Palace', 'Europa Palace', 'Cruise Olympia', 'Cruise Europa',
  ];
}