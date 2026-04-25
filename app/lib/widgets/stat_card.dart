import 'package:flutter/material.dart';

class StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const StatCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(icon, size: 14, color: color),
              const SizedBox(width: 5),
              Flexible(child: Text(label,
                  style: TextStyle(fontSize: 11, color: Colors.grey[600], fontWeight: FontWeight.w500),
                  overflow: TextOverflow.ellipsis)),
            ]),
            const SizedBox(height: 6),
            Text(value, style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
      ),
    );
  }
}