import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/theme.dart';

class MainShell extends StatelessWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  static const _navItems = [
    _NavItem(icon: Icons.directions_boat, label: 'Vessel Ops',    path: '/'),
    _NavItem(icon: Icons.chat_bubble,     label: 'Customer Agent', path: '/chat'),
    _NavItem(icon: Icons.description,     label: 'Compliance',     path: '/compliance'),
    _NavItem(icon: Icons.confirmation_number, label: 'Helpdesk',  path: '/helpdesk'),
    _NavItem(icon: Icons.bar_chart,       label: 'Analytics',      path: '/analytics'),
  ];

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    final isWide = MediaQuery.sizeOf(context).width >= 720;

    return Scaffold(
      body: Row(
        children: [
          if (isWide) _Sidebar(location: location),
          Expanded(child: child),
        ],
      ),
      bottomNavigationBar: isWide
          ? null
          : NavigationBar(
              backgroundColor: MinoanTheme.navy,
              indicatorColor: MinoanTheme.blue,
              labelBehavior: NavigationDestinationLabelBehavior.onlyShowSelected,
              selectedIndex: _selectedIndex(location),
              onDestinationSelected: (i) => context.go(_navItems[i].path),
              destinations: _navItems
                  .map((n) => NavigationDestination(
                        icon: Icon(n.icon, color: Colors.white60),
                        selectedIcon: Icon(n.icon, color: Colors.white),
                        label: n.label,
                      ))
                  .toList(),
            ),
    );
  }

  int _selectedIndex(String location) {
    for (var i = _navItems.length - 1; i >= 0; i--) {
      if (location.startsWith(_navItems[i].path) &&
          (_navItems[i].path != '/' || location == '/')) {
        return i;
      }
    }
    return 0;
  }
}

class _Sidebar extends StatelessWidget {
  final String location;
  const _Sidebar({required this.location});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 220,
      color: MinoanTheme.navy,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Logo header
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    const Icon(Icons.directions_boat, color: MinoanTheme.gold, size: 22),
                    const SizedBox(width: 10),
                    Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Minoan Lines',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                      const Text('AI Platform',
                          style: TextStyle(color: MinoanTheme.gold, fontSize: 11)),
                    ]),
                  ]),
                  const SizedBox(height: 4),
                  const Text('by IntegraMind AI',
                      style: TextStyle(color: Color(0xFF60A5FA), fontSize: 10)),
                ],
              ),
            ),
          ),
          const Divider(color: Color(0xFF1e3a5f), height: 1),
          const SizedBox(height: 8),
          // Nav items
          ...MainShell._navItems.map((item) {
            final active = location == item.path ||
                (item.path != '/' && location.startsWith(item.path));
            return _NavTile(item: item, active: active);
          }),
          const Spacer(),
          const Divider(color: Color(0xFF1e3a5f), height: 1),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Text(
              'claude-sonnet-4-20250514 · v1.0.0',
              style: TextStyle(color: Colors.blue.shade300, fontSize: 10),
            ),
          ),
        ],
      ),
    );
  }
}

class _NavTile extends StatelessWidget {
  final _NavItem item;
  final bool active;
  const _NavTile({required this.item, required this.active});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go(item.path),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: active ? MinoanTheme.blue : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(children: [
          Icon(item.icon, size: 17, color: active ? Colors.white : const Color(0xFFBFD7F7)),
          const SizedBox(width: 10),
          Text(item.label,
              style: TextStyle(
                  color: active ? Colors.white : const Color(0xFFBFD7F7),
                  fontSize: 13,
                  fontWeight: active ? FontWeight.w600 : FontWeight.normal)),
        ]),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final String path;
  const _NavItem({required this.icon, required this.label, required this.path});
}