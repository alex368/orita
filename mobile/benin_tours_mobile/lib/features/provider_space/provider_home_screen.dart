import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../core/app_colors.dart';
import '../../data/models.dart';
import '../../shared/design_widgets.dart';
import '../app_controller.dart';

class ProviderHomeScreen extends StatefulWidget {
  const ProviderHomeScreen({super.key, required this.controller});

  final AppController controller;

  @override
  State<ProviderHomeScreen> createState() => _ProviderHomeScreenState();
}

class _ProviderHomeScreenState extends State<ProviderHomeScreen> {
  int selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      _ProviderDashboardPage(controller: widget.controller),
      _MissionsPage(controller: widget.controller),
      _ProviderMessagesPage(controller: widget.controller),
      _LedgerPage(controller: widget.controller),
      _ProviderProfilePage(controller: widget.controller),
    ];

    return Scaffold(
      body: pages[selectedIndex],
      bottomNavigationBar: OritaBottomNav(
        items: const [
          OritaNavItem(label: 'Home', icon: Icons.home_rounded),
          OritaNavItem(label: 'Missions', icon: Icons.route_outlined),
          OritaNavItem(label: 'Chat', icon: Icons.chat_bubble_outline),
          OritaNavItem(label: 'Gains', icon: Icons.receipt_long_outlined),
          OritaNavItem(label: 'Profil', icon: Icons.person_outline),
        ],
        selectedIndex: selectedIndex,
        onSelected: (index) => setState(() => selectedIndex = index),
        highlightIndex: 2,
      ),
    );
  }
}

class _ProviderDashboardPage extends StatelessWidget {
  const _ProviderDashboardPage({required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final dashboard = controller.providerDashboard;
    return RefreshIndicator(
      onRefresh: controller.refreshAll,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          _OritaProviderHeader(
            title: 'ORITA ${controller.providerLabel}',
            subtitle: 'Missions, gains et validations.',
            icon: Icons.workspace_premium_outlined,
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: dashboard == null
                ? const EmptyState(
                    icon: Icons.lock_outline,
                    message:
                        'Compte guide ou chauffeur en attente de validation admin.',
                  )
                : Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: MetricCard(
                              label: 'Gains totaux',
                              value: dashboard.totalEarning,
                              icon: Icons.savings_outlined,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: MetricCard(
                              label: 'Ce mois',
                              value: dashboard.monthEarning,
                              icon: Icons.trending_up_outlined,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: MetricCard(
                              label: 'En attente',
                              value: dashboard.pendingMissions.toString(),
                              icon: Icons.hourglass_empty,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: MetricCard(
                              label: 'Terminées',
                              value: dashboard.completedMissions.toString(),
                              icon: Icons.verified_outlined,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

class _OritaProviderHeader extends StatelessWidget {
  const _OritaProviderHeader({
    required this.title,
    required this.subtitle,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 22),
      decoration: const BoxDecoration(
        color: AppColors.ink,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const _OritaMark(),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(icon, color: AppColors.gold, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          title,
                          style: Theme.of(context).textTheme.headlineSmall
                              ?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                              ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.white.withValues(alpha: 0.76),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OritaMark extends StatelessWidget {
  const _OritaMark();

  @override
  Widget build(BuildContext context) {
    return const BrandMark(size: 54);
  }
}

class _MissionsPage extends StatelessWidget {
  const _MissionsPage({required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    return _ProviderPage(
      title: 'Mes missions',
      subtitle: 'Confirmer, refuser et valider un voyage par QR code.',
      child: controller.providerMissions.isEmpty
          ? const EmptyState(
              icon: Icons.route_outlined,
              message: 'Aucune mission assignée pour le moment.',
            )
          : Column(
              children: [
                for (final mission in controller.providerMissions)
                  _MissionCard(controller: controller, mission: mission),
              ],
            ),
    );
  }
}

class _MissionCard extends StatelessWidget {
  const _MissionCard({required this.controller, required this.mission});

  final AppController controller;
  final ProviderMission mission;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          border: Border(
            left: BorderSide(
              color: AppColors.gold.withValues(alpha: 0.92),
              width: 4,
            ),
          ),
        ),
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    mission.serviceName,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
                StatusPill(label: mission.providerStatus),
              ],
            ),
            const SizedBox(height: 8),
            Text('${mission.customerName} · ${mission.earning}'),
            const SizedBox(height: 12),
            if (mission.qrCodePayload.isNotEmpty)
              _MissionQrPanel(payload: mission.qrCodePayload),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () =>
                        controller.decideMission(mission, 'refused'),
                    icon: const Icon(Icons.close),
                    label: const Text('Refuser'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () =>
                        controller.decideMission(mission, 'confirmed'),
                    icon: const Icon(Icons.check),
                    label: const Text('Confirmer'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _MissionQrPanel extends StatelessWidget {
  const _MissionQrPanel({required this.payload});

  final String payload;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.ink,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.42)),
      ),
      child: Column(
        children: [
          const Text(
            'Validation ORITA',
            style: TextStyle(
              color: AppColors.gold,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: QrImageView(
              data: payload,
              size: 150,
              backgroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class _ProviderMessagesPage extends StatelessWidget {
  const _ProviderMessagesPage({required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final conversations = controller.providerMissions
        .map(_ProviderConversation.fromMission)
        .toList();

    return _ProviderPage(
      title: 'Messages clients',
      subtitle: 'Conversations liées aux réservations assignées.',
      child: conversations.isEmpty
          ? const EmptyState(
              icon: Icons.chat_bubble_outline,
              message: 'Aucune conversation client pour le moment.',
            )
          : Column(
              children: [
                for (final conversation in conversations)
                  _ProviderConversationTile(conversation: conversation),
              ],
            ),
    );
  }
}

class _ProviderConversation {
  _ProviderConversation({
    required this.id,
    required this.clientName,
    required this.serviceName,
    required this.subject,
    required this.status,
    required this.messages,
  });

  factory _ProviderConversation.fromMission(ProviderMission mission) {
    return _ProviderConversation(
      id: mission.id,
      clientName: mission.customerName,
      serviceName: mission.serviceName,
      subject: 'Mission #${mission.id}',
      status: mission.providerStatus.isEmpty
          ? mission.bookingStatus
          : mission.providerStatus,
      messages: [
        _ProviderChatMessage(
          author: mission.customerName,
          text:
              'Bonjour, je confirme ma réservation pour ${mission.serviceName}.',
          time: '09:15',
          fromProvider: false,
        ),
        const _ProviderChatMessage(
          author: 'Moi',
          text: 'Bonjour, j’ai bien reçu la demande.',
          time: '09:22',
          fromProvider: true,
        ),
      ],
    );
  }

  final String id;
  final String clientName;
  final String serviceName;
  final String subject;
  final String status;
  final List<_ProviderChatMessage> messages;
}

class _ProviderChatMessage {
  const _ProviderChatMessage({
    required this.author,
    required this.text,
    required this.time,
    required this.fromProvider,
  });

  final String author;
  final String text;
  final String time;
  final bool fromProvider;
}

class _ProviderConversationTile extends StatelessWidget {
  const _ProviderConversationTile({required this.conversation});

  final _ProviderConversation conversation;

  void _openChat(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) =>
            _ProviderConversationChatPage(conversation: conversation),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: () => _openChat(context),
        borderRadius: BorderRadius.circular(16),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                _ProviderClientAvatar(name: conversation.clientName),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        conversation.clientName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        conversation.serviceName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.muted,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        conversation.subject,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.muted,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                StatusPill(label: conversation.status),
                const SizedBox(width: 6),
                const Icon(Icons.chevron_right, color: AppColors.muted),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ProviderConversationChatPage extends StatefulWidget {
  const _ProviderConversationChatPage({required this.conversation});

  final _ProviderConversation conversation;

  @override
  State<_ProviderConversationChatPage> createState() =>
      _ProviderConversationChatPageState();
}

class _ProviderConversationChatPageState
    extends State<_ProviderConversationChatPage> {
  final _messageController = TextEditingController();

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) {
      return;
    }

    setState(() {
      widget.conversation.messages.add(
        _ProviderChatMessage(
          author: 'Moi',
          text: text,
          time: 'Maintenant',
          fromProvider: true,
        ),
      );
      widget.conversation.messages.add(
        _ProviderChatMessage(
          author: widget.conversation.clientName,
          text: 'Merci, je reste disponible pour les précisions.',
          time: 'Maintenant',
          fromProvider: false,
        ),
      );
    });
    _messageController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Discussion client'),
        backgroundColor: AppColors.ink,
        foregroundColor: Colors.white,
        iconTheme: const IconThemeData(color: AppColors.gold),
      ),
      body: SafeArea(
        child: Container(
          width: double.infinity,
          height: double.infinity,
          color: AppColors.surface,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 14),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(bottom: BorderSide(color: AppColors.border)),
                ),
                child: Row(
                  children: [
                    _ProviderClientAvatar(name: widget.conversation.clientName),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.conversation.clientName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.w900),
                          ),
                          Text(
                            widget.conversation.serviceName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: AppColors.muted),
                          ),
                        ],
                      ),
                    ),
                    StatusPill(label: widget.conversation.status),
                  ],
                ),
              ),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                  itemCount: widget.conversation.messages.length,
                  itemBuilder: (context, index) {
                    return _ProviderChatBubble(
                      message: widget.conversation.messages[index],
                    );
                  },
                ),
              ),
              Container(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 16),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(top: BorderSide(color: AppColors.border)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _messageController,
                        minLines: 1,
                        maxLines: 3,
                        decoration: InputDecoration(
                          hintText: 'Votre message...',
                          filled: true,
                          fillColor: AppColors.surface,
                          prefixIcon: const Icon(
                            Icons.lock_outline,
                            color: AppColors.gold,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(
                              color: AppColors.border,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: const BorderSide(color: AppColors.gold),
                          ),
                        ),
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      onPressed: _sendMessage,
                      icon: const Icon(Icons.send_outlined),
                      tooltip: 'Envoyer',
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProviderClientAvatar extends StatelessWidget {
  const _ProviderClientAvatar({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    final initials = name
        .split(' ')
        .where((part) => part.isNotEmpty)
        .take(2)
        .map((part) => part.characters.first.toUpperCase())
        .join();

    return CircleAvatar(
      radius: 30,
      backgroundColor: AppColors.gold.withValues(alpha: 0.18),
      child: Text(
        initials.isEmpty ? 'CL' : initials,
        style: const TextStyle(
          color: AppColors.ink,
          fontWeight: FontWeight.w900,
        ),
      ),
    );
  }
}

class _ProviderChatBubble extends StatelessWidget {
  const _ProviderChatBubble({required this.message});

  final _ProviderChatMessage message;

  @override
  Widget build(BuildContext context) {
    final alignment = message.fromProvider
        ? CrossAxisAlignment.end
        : CrossAxisAlignment.start;
    final color = message.fromProvider ? AppColors.ink : AppColors.sand;
    final textColor = message.fromProvider ? AppColors.gold : AppColors.ink;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: alignment,
        children: [
          Text(
            '${message.author} · ${message.time}',
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Container(
            constraints: const BoxConstraints(maxWidth: 520),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(16),
              border: message.fromProvider
                  ? Border.all(color: AppColors.gold.withValues(alpha: 0.52))
                  : Border.all(color: AppColors.border),
            ),
            child: Text(
              message.text,
              style: TextStyle(color: textColor, height: 1.35),
            ),
          ),
        ],
      ),
    );
  }
}

class _LedgerPage extends StatelessWidget {
  const _LedgerPage({required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    return _ProviderPage(
      title: 'Historique financier',
      subtitle: 'Factures, paiements et remboursements.',
      child: controller.ledger.isEmpty
          ? const EmptyState(
              icon: Icons.receipt_long_outlined,
              message: 'Aucun mouvement financier.',
            )
          : Column(
              children: [
                for (final item in controller.ledger)
                  Card(
                    child: ListTile(
                      leading: const CircleAvatar(
                        backgroundColor: AppColors.ink,
                        child: Icon(
                          Icons.receipt_outlined,
                          color: AppColors.gold,
                        ),
                      ),
                      title: Text(item.label),
                      subtitle: Text(item.invoiceNumber),
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [Text(item.amount), Text(item.paymentStatus)],
                      ),
                    ),
                  ),
              ],
            ),
    );
  }
}

class _ProviderProfilePage extends StatelessWidget {
  const _ProviderProfilePage({required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final profile = controller.providerProfile;
    return _ProviderPage(
      title: 'Profil professionnel',
      subtitle: 'Informations guide ou chauffeur.',
      child: profile == null
          ? const EmptyState(
              icon: Icons.badge_outlined,
              message: 'Aucun profil professionnel validé.',
            )
          : Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const CircleAvatar(
                          backgroundColor: AppColors.ink,
                          child: Icon(
                            Icons.workspace_premium_outlined,
                            color: AppColors.gold,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            profile.fullName,
                            style: Theme.of(context).textTheme.titleLarge
                                ?.copyWith(fontWeight: FontWeight.w900),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    StatusPill(label: profile.validationStatus),
                    const SizedBox(height: 12),
                    Text('Localisation : ${profile.location}'),
                    Text('Zone : ${profile.zone}'),
                    Text('Rôles : ${profile.roles.join(', ')}'),
                  ],
                ),
              ),
            ),
    );
  }
}

class _ProviderPage extends StatelessWidget {
  const _ProviderPage({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.zero,
      children: [
        _OritaProviderHeader(
          title: title,
          subtitle: subtitle,
          icon: Icons.workspace_premium_outlined,
        ),
        Padding(padding: const EdgeInsets.all(20), child: child),
      ],
    );
  }
}
