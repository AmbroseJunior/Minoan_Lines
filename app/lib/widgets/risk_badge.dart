import 'package:flutter/material.dart';
import '../core/theme.dart';

class RiskBadge extends StatelessWidget {
  final double probability;
  const RiskBadge({super.key, required this.probability});

  @override
  Widget build(BuildContext context) {
    final color = MinoanTheme.riskColor(probability);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        '${(probability * 100).toStringAsFixed(0)}%',
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color),
      ),
    );
  }
}

class PriorityChip extends StatelessWidget {
  final String priority;
  const PriorityChip({super.key, required this.priority});

  @override
  Widget build(BuildContext context) {
    final color = MinoanTheme.priorityColor(priority);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(priority,
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
    );
  }
}

class StatusChip extends StatelessWidget {
  final String status;
  const StatusChip({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final color = MinoanTheme.statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(status.replaceAll('_', ' '),
          style: TextStyle(fontSize: 10, color: color)),
    );
  }
}