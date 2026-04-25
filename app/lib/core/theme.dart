import 'package:flutter/material.dart';

class MinoanTheme {
  MinoanTheme._();

  // ── Brand colours ────────────────────────────────────────────────────────
  static const Color blue  = Color(0xFF003087);
  static const Color gold  = Color(0xFFC9A84C);
  static const Color navy  = Color(0xFF001A4D);
  static const Color light = Color(0xFFE8F0FB);

  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF97316);
  static const Color danger  = Color(0xFFEF4444);
  static const Color grey    = Color(0xFF6B7280);

  // ── Priority colours ──────────────────────────────────────────────────────
  static Color priorityColor(String priority) => switch (priority.toLowerCase()) {
    'critical' => danger,
    'high'     => warning,
    'medium'   => const Color(0xFFEAB308),
    _          => success,
  };

  static Color statusColor(String status) => switch (status.toLowerCase()) {
    'open'        => const Color(0xFF3B82F6),
    'in_progress' => const Color(0xFF8B5CF6),
    'resolved'    => success,
    'escalated'   => warning,
    _             => grey,
  };

  // ── Risk colours (delay probability) ─────────────────────────────────────
  static Color riskColor(double probability) {
    if (probability > 0.70) return danger;
    if (probability > 0.40) return warning;
    return success;
  }

  // ── Material Theme ────────────────────────────────────────────────────────
  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: blue,
      primary: blue,
      secondary: gold,
      surface: const Color(0xFFF9FAFB),
    ),
    scaffoldBackgroundColor: const Color(0xFFF3F4F6),
    fontFamily: 'Inter',
    appBarTheme: const AppBarTheme(
      backgroundColor: navy,
      foregroundColor: Colors.white,
      elevation: 0,
      titleTextStyle: TextStyle(
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: Colors.white,
      ),
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      color: Colors.white,
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: blue, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      filled: true,
      fillColor: Colors.white,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: blue,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        textStyle: const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600),
      ),
    ),
    chipTheme: ChipThemeData(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
    ),
  );
}