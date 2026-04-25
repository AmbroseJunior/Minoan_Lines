import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../models/ticket.dart';
import '../../providers/ticket_provider.dart';
import '../../widgets/risk_badge.dart';
import '../../widgets/stat_card.dart';

class HelpdeskScreen extends ConsumerStatefulWidget {
  const HelpdeskScreen({super.key});
  @override
  ConsumerState<HelpdeskScreen> createState() => _HelpdeskScreenState();
}

class _HelpdeskScreenState extends ConsumerState<HelpdeskScreen> {
  bool _showForm = false;
  final _titleCtrl = TextEditingController();
  final _descCtrl  = TextEditingController();
  final _nameCtrl  = TextEditingController();

  @override
  void dispose() {
    _titleCtrl.dispose(); _descCtrl.dispose(); _nameCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ticketsAsync = ref.watch(ticketsProvider);
    final selected     = ref.watch(selectedTicketProvider);
    final formState    = ref.watch(ticketFormProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: MinoanTheme.navy,
        title: const Text('IT Helpdesk Triage'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            tooltip: 'New ticket',
            onPressed: () => setState(() => _showForm = true),
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(children: [
            // Stats
            Padding(
              padding: const EdgeInsets.all(14),
              child: ticketsAsync.when(
                loading: () => const SizedBox(height: 70),
                error: (e, _) => Text('Error: $e'),
                data: (tickets) => Row(children: [
                  Expanded(child: StatCard(label: 'Open',        value: '${tickets.where((t) => t.status == "open").length}',        icon: Icons.inbox,          color: Colors.blue)),
                  const SizedBox(width: 8),
                  Expanded(child: StatCard(label: 'Critical',    value: '${tickets.where((t) => t.priority == "critical").length}',  icon: Icons.priority_high,  color: MinoanTheme.danger)),
                  const SizedBox(width: 8),
                  Expanded(child: StatCard(label: 'SLA Breached',value: '${tickets.where((t) => t.slaBreached == 1).length}',        icon: Icons.timer_off,      color: MinoanTheme.warning)),
                  const SizedBox(width: 8),
                  Expanded(child: StatCard(label: 'Resolved',    value: '${tickets.where((t) => t.status == "resolved").length}',    icon: Icons.check_circle,   color: MinoanTheme.success)),
                ]),
              ),
            ),

            // Filter
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 10),
              child: Row(children: [
                const Text('Filter:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                const SizedBox(width: 8),
                ...[null, 'open', 'in_progress', 'resolved'].map((s) {
                  final label = s ?? 'All';
                  final active = ref.watch(ticketFilterProvider) == s;
                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: FilterChip(
                      label: Text(label, style: TextStyle(fontSize: 11, color: active ? Colors.white : Colors.grey[700])),
                      selected: active,
                      selectedColor: MinoanTheme.blue,
                      onSelected: (_) => ref.read(ticketFilterProvider.notifier).state = s,
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                    ),
                  );
                }),
              ]),
            ),

            // List + detail
            Expanded(
              child: ticketsAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(child: Text('Error: $e')),
                data: (tickets) {
                  final isWide = MediaQuery.sizeOf(context).width > 700;
                  return isWide
                      ? Row(children: [
                          SizedBox(width: 280, child: _ticketList(tickets)),
                          const VerticalDivider(width: 1),
                          Expanded(child: _ticketDetail(selected)),
                        ])
                      : selected != null
                          ? _ticketDetail(selected)
                          : _ticketList(tickets);
                },
              ),
            ),
          ]),

          // New ticket modal
          if (_showForm) _newTicketOverlay(formState),
        ],
      ),
    );
  }

  Widget _ticketList(List<Ticket> tickets) => ListView.separated(
    padding: EdgeInsets.zero,
    itemCount: tickets.length,
    separatorBuilder: (_, __) => const Divider(height: 1),
    itemBuilder: (_, i) {
      final t = tickets[i];
      final isSelected = ref.watch(selectedTicketProvider)?.id == t.id;
      return InkWell(
        onTap: () => ref.read(selectedTicketProvider.notifier).state = t,
        child: Container(
          color: isSelected ? MinoanTheme.light : null,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(t.ticketNumber, style: const TextStyle(fontSize: 10, fontFamily: 'monospace', color: Colors.grey)),
            const SizedBox(height: 2),
            Text(t.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 5),
            Row(children: [
              PriorityChip(priority: t.priority),
              const SizedBox(width: 4),
              StatusChip(status: t.status),
              if (t.slaBreached == 1) ...[
                const SizedBox(width: 4),
                const Icon(Icons.timer_off, size: 12, color: MinoanTheme.danger),
              ],
            ]),
          ]),
        ),
      );
    },
  );

  Widget _ticketDetail(Ticket? t) {
    if (t == null) return const Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.confirmation_number, size: 48, color: Color(0xFFD1D5DB)),
        SizedBox(height: 8),
        Text('Select a ticket', style: TextStyle(color: Colors.grey)),
      ]),
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(t.ticketNumber, style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: Colors.grey)),
            const SizedBox(height: 4),
            Text(t.title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
          ])),
          PriorityChip(priority: t.priority),
          const SizedBox(width: 6),
          StatusChip(status: t.status),
        ]),
        const SizedBox(height: 16),

        // Metadata grid
        Wrap(spacing: 16, runSpacing: 10, children: [
          _meta('Category', t.category ?? '—'),
          _meta('Assigned To', t.assignedTo ?? '—'),
          _meta('Est. Resolution', t.estimatedResolutionHours != null ? '${t.estimatedResolutionHours}h' : '—'),
          _meta('AI Confidence', t.aiConfidence != null ? '${t.aiConfidence}%' : '—'),
          _meta('Submitted By', t.submittedBy ?? 'Anonymous'),
          _meta('SLA Due', t.slaDueAt ?? '—'),
        ]),
        const SizedBox(height: 16),

        // Description
        _section('Description', child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(8)),
          child: Text(t.description, style: const TextStyle(fontSize: 13)),
        )),
        const SizedBox(height: 12),

        // AI draft
        if (t.aiDraftResponse != null)
          _section('AI Draft Response', child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: MinoanTheme.light, borderRadius: BorderRadius.circular(8)),
            child: Text(t.aiDraftResponse!, style: const TextStyle(fontSize: 13)),
          )),
        const SizedBox(height: 16),

        // Status actions
        const Text('Update Status', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey)),
        const SizedBox(height: 8),
        Wrap(spacing: 8, children: ['open', 'in_progress', 'resolved', 'closed'].map((s) {
          final active = t.status == s;
          return OutlinedButton(
            style: OutlinedButton.styleFrom(
              backgroundColor: active ? MinoanTheme.blue : null,
              foregroundColor: active ? Colors.white : Colors.grey[700],
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              textStyle: const TextStyle(fontSize: 12),
            ),
            onPressed: active ? null : () {
              ref.read(ticketFormProvider.notifier).updateStatus(t.id, s, ref);
              ref.read(selectedTicketProvider.notifier).state = t.copyWith(status: s);
            },
            child: Text(s.replaceAll('_', ' ')),
          );
        }).toList()),
      ]),
    );
  }

  Widget _meta(String label, String value) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
      Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
    ],
  );

  Widget _section(String title, {required Widget child}) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey)),
      const SizedBox(height: 6),
      child,
    ],
  );

  Widget _newTicketOverlay(TicketFormState formState) => GestureDetector(
    onTap: () => setState(() => _showForm = false),
    child: Container(
      color: Colors.black45,
      child: Center(
        child: GestureDetector(
          onTap: () {},
          child: Card(
            margin: const EdgeInsets.all(24),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  const Expanded(child: Text('Submit Ticket', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => setState(() => _showForm = false)),
                ]),
                const SizedBox(height: 12),
                TextField(controller: _titleCtrl, decoration: const InputDecoration(labelText: 'Title', hintText: 'Describe the issue briefly')),
                const SizedBox(height: 10),
                TextField(controller: _descCtrl, decoration: const InputDecoration(labelText: 'Description'), maxLines: 4),
                const SizedBox(height: 10),
                TextField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Your name (optional)')),
                if (formState.error != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(formState.error!, style: const TextStyle(color: MinoanTheme.danger, fontSize: 12)),
                  ),
                const SizedBox(height: 14),
                SizedBox(width: double.infinity, child: ElevatedButton(
                  onPressed: formState.submitting ? null : () async {
                    await ref.read(ticketFormProvider.notifier).submit(
                      title: _titleCtrl.text, description: _descCtrl.text,
                      submittedBy: _nameCtrl.text.isEmpty ? null : _nameCtrl.text,
                      ref: ref,
                    );
                    if (mounted && ref.read(ticketFormProvider).error == null) {
                      setState(() => _showForm = false);
                      _titleCtrl.clear(); _descCtrl.clear(); _nameCtrl.clear();
                    }
                  },
                  child: formState.submitting
                      ? const Row(mainAxisSize: MainAxisSize.min, children: [
                          SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                          SizedBox(width: 8),
                          Text('Triaging with Claude…'),
                        ])
                      : const Text('Submit Ticket'),
                )),
              ]),
            ),
          ),
        ),
      ),
    ),
  );
}