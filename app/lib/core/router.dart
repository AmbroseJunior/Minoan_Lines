import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../screens/main_shell.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/chat/chat_screen.dart';
import '../screens/compliance/compliance_screen.dart';
import '../screens/helpdesk/helpdesk_screen.dart';
import '../screens/analytics/analytics_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    ShellRoute(
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        GoRoute(path: '/',           builder: (c, s) => const DashboardScreen()),
        GoRoute(path: '/chat',       builder: (c, s) => const ChatScreen()),
        GoRoute(path: '/compliance', builder: (c, s) => const ComplianceScreen()),
        GoRoute(path: '/helpdesk',   builder: (c, s) => const HelpdeskScreen()),
        GoRoute(path: '/analytics',  builder: (c, s) => const AnalyticsScreen()),
      ],
    ),
  ],
);