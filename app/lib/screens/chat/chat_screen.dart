import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../services/api_service.dart';

final _sessionIdProvider = StateProvider<String?>((ref) => null);

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});
  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _ctrl = TextEditingController();
  final _scroll = ScrollController();
  final List<_Msg> _messages = [];
  bool _streaming = false;
  bool _escalated = false;

  @override
  void dispose() {
    _ctrl.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 200), curve: Curves.easeOut);
      }
    });
  }

  Future<void> _send() async {
    final text = _ctrl.text.trim();
    if (text.isEmpty || _streaming) return;
    _ctrl.clear();

    setState(() {
      _messages.add(_Msg(role: 'user', content: text));
      _messages.add(_Msg(role: 'assistant', content: ''));
      _streaming = true;
    });
    _scrollToBottom();

    final sessionId = ref.read(_sessionIdProvider);
    String fullText = '';

    try {
      await for (final event in ApiService.instance.streamChat(
        message: text,
        sessionId: sessionId,
      )) {
        switch (event.type) {
          case ChatEventType.session:
            ref.read(_sessionIdProvider.notifier).state = event.sessionId;
          case ChatEventType.text:
            fullText += event.text!;
            setState(() => _messages.last = _Msg(role: 'assistant', content: fullText));
            _scrollToBottom();
          case ChatEventType.done:
            setState(() {
              _escalated = event.escalate;
              _streaming = false;
            });
        }
      }
    } catch (e) {
      setState(() {
        _messages.last = _Msg(role: 'assistant', content: 'Connection error. Please try again.');
        _streaming = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final sessionId = ref.watch(_sessionIdProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: MinoanTheme.navy,
        title: const Text('Customer Support Agent'),
        actions: [
          if (sessionId != null)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Center(
                child: Text(
                  'Session: ${sessionId.substring(0, 8)}…',
                  style: const TextStyle(color: Colors.blue, fontSize: 11, fontFamily: 'monospace'),
                ),
              ),
            ),
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            tooltip: 'New session',
            onPressed: () {
              ref.read(_sessionIdProvider.notifier).state = null;
              setState(() { _messages.clear(); _escalated = false; });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Capability chips
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: const [
                _CapChip('Greek + English'),
                SizedBox(width: 6),
                _CapChip('Booking Policies'),
                SizedBox(width: 6),
                _CapChip('Strike Procedures'),
                SizedBox(width: 6),
                _CapChip('Auto-Escalation < 75%'),
              ]),
            ),
          ),

          // Escalation banner
          if (_escalated)
            Container(
              width: double.infinity,
              color: const Color(0xFFFFFBEB),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              child: const Row(children: [
                Icon(Icons.warning_amber, color: Color(0xFFD97706), size: 16),
                SizedBox(width: 8),
                Text('Escalated to human agent — please hold.',
                    style: TextStyle(color: Color(0xFF92400E), fontSize: 12)),
              ]),
            ),

          // Messages
          Expanded(
            child: _messages.isEmpty
                ? _emptyState()
                : ListView.builder(
                    controller: _scroll,
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length,
                    itemBuilder: (_, i) => _MessageBubble(msg: _messages[i], streaming: _streaming && i == _messages.length - 1),
                  ),
          ),

          // Input bar
          Container(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: SafeArea(
              top: false,
              child: Row(children: [
                Expanded(
                  child: TextField(
                    controller: _ctrl,
                    decoration: const InputDecoration(
                      hintText: 'Ask about routes, bookings, schedules…',
                      isDense: true,
                    ),
                    onSubmitted: (_) => _send(),
                    enabled: !_streaming,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: _streaming ? null : _send,
                  style: IconButton.styleFrom(backgroundColor: MinoanTheme.blue),
                  icon: _streaming
                      ? const SizedBox(width: 18, height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.send, color: Colors.white, size: 18),
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _emptyState() => Center(
    child: Column(mainAxisSize: MainAxisSize.min, children: [
      Icon(Icons.chat_bubble_outline, size: 48, color: Colors.grey.shade300),
      const SizedBox(height: 12),
      Text('Ask me anything about Minoan Lines',
          style: TextStyle(color: Colors.grey.shade500, fontSize: 14)),
      const SizedBox(height: 4),
      Text('Routes · Bookings · Schedules · Strike procedures',
          style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
    ]),
  );
}

class _Msg {
  final String role;
  final String content;
  const _Msg({required this.role, required this.content});
}

class _MessageBubble extends StatelessWidget {
  final _Msg msg;
  final bool streaming;
  const _MessageBubble({required this.msg, required this.streaming});

  @override
  Widget build(BuildContext context) {
    final isUser = msg.role == 'user';
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            CircleAvatar(radius: 14, backgroundColor: MinoanTheme.blue,
                child: const Icon(Icons.smart_toy, size: 14, color: Colors.white)),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: isUser ? MinoanTheme.blue : Colors.white,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(14),
                  topRight: const Radius.circular(14),
                  bottomLeft: Radius.circular(isUser ? 14 : 2),
                  bottomRight: Radius.circular(isUser ? 2 : 14),
                ),
                border: isUser ? null : Border.all(color: const Color(0xFFE5E7EB)),
              ),
              child: streaming && msg.content.isEmpty
                  ? Row(mainAxisSize: MainAxisSize.min, children: [
                      _Dot(delay: 0), const SizedBox(width: 3),
                      _Dot(delay: 150), const SizedBox(width: 3),
                      _Dot(delay: 300),
                    ])
                  : Text(msg.content,
                      style: TextStyle(
                        color: isUser ? Colors.white : Colors.black87,
                        fontSize: 13, height: 1.5,
                      )),
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: 8),
            CircleAvatar(radius: 14, backgroundColor: Colors.grey.shade300,
                child: const Icon(Icons.person, size: 14, color: Colors.white)),
          ],
        ],
      ),
    );
  }
}

class _Dot extends StatefulWidget {
  final int delay;
  const _Dot({required this.delay});
  @override
  State<_Dot> createState() => _DotState();
}

class _DotState extends State<_Dot> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 600))
    ..repeat(reverse: true);

  @override
  void dispose() { _c.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) => FadeTransition(
    opacity: _c,
    child: Container(width: 6, height: 6,
        decoration: const BoxDecoration(color: Colors.grey, shape: BoxShape.circle)),
  );
}

class _CapChip extends StatelessWidget {
  final String label;
  const _CapChip(this.label);
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    decoration: BoxDecoration(
      color: MinoanTheme.light,
      borderRadius: BorderRadius.circular(20),
    ),
    child: Text(label, style: const TextStyle(fontSize: 11, color: MinoanTheme.blue, fontWeight: FontWeight.w500)),
  );
}