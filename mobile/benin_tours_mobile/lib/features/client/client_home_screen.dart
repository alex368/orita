import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/app_colors.dart';
import '../../data/models.dart';
import '../../shared/design_widgets.dart';
import '../app_controller.dart';

class ClientHomeScreen extends StatefulWidget {
  const ClientHomeScreen({super.key, required this.controller});

  final AppController controller;

  @override
  State<ClientHomeScreen> createState() => _ClientHomeScreenState();
}

class _ClientHomeScreenState extends State<ClientHomeScreen> {
  int selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      _ClientOverview(controller: widget.controller),
      _BookingsPage(controller: widget.controller),
      _QrScannerPage(controller: widget.controller),
      _MessagesPage(controller: widget.controller),
      _ProfilePage(controller: widget.controller),
    ];

    return Scaffold(
      body: pages[selectedIndex],
      bottomNavigationBar: OritaBottomNav(
        items: const [
          OritaNavItem(label: 'Accueil', icon: Icons.home_rounded),
          OritaNavItem(
            label: 'Réserv.',
            icon: Icons.confirmation_number_outlined,
          ),
          OritaNavItem(label: 'Scanner', icon: Icons.qr_code_scanner_rounded),
          OritaNavItem(label: 'Messages', icon: Icons.chat_bubble_outline),
          OritaNavItem(label: 'Profil', icon: Icons.person_outline),
        ],
        selectedIndex: selectedIndex,
        onSelected: (index) => setState(() => selectedIndex = index),
        highlightIndex: 2,
      ),
    );
  }
}

class _OritaMark extends StatelessWidget {
  const _OritaMark();

  @override
  Widget build(BuildContext context) {
    return const BrandMark();
  }
}

class _OritaHeader extends StatelessWidget {
  const _OritaHeader({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 24),
      decoration: BoxDecoration(
        color: AppColors.ink,
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(28)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.18),
            blurRadius: 22,
            offset: const Offset(0, 12),
          ),
        ],
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
                  Text(
                    'ORITA',
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: AppColors.gold,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    title,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.white.withValues(alpha: 0.78),
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

class _ClientOverview extends StatelessWidget {
  const _ClientOverview({required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final client = controller.client;
    return RefreshIndicator(
      onRefresh: controller.refreshAll,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          _OritaHeader(
            title:
                'Bonjour ${client?.firstName.isEmpty ?? true ? 'voyageur' : client!.firstName}',
            subtitle: 'Votre conciergerie premium pour explorer le Bénin.',
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Expanded(
                  child: MetricCard(
                    label: 'Réservations',
                    value: controller.bookings.length.toString(),
                    icon: Icons.event_available_outlined,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: MetricCard(
                    label: 'Documents',
                    value: '${controller.bookings.length * 2}',
                    icon: Icons.folder_copy_outlined,
                  ),
                ),
              ],
            ),
          ),
          _CatalogueSection(
            title: 'Parcours',
            items: controller.tours,
            controller: controller,
          ),
          _CatalogueSection(
            title: 'Chauffeurs',
            items: controller.drivers,
            controller: controller,
          ),
          _CatalogueSection(
            title: 'Location',
            items: controller.rentals,
            controller: controller,
          ),
          _CatalogueSection(
            title: 'Bons plans',
            items: controller.goodPlans,
            controller: controller,
          ),
        ],
      ),
    );
  }
}

class _CatalogueSection extends StatelessWidget {
  const _CatalogueSection({
    required this.title,
    required this.items,
    required this.controller,
  });

  final String title;
  final List<CatalogueItem> items;
  final AppController controller;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionTitle(title: title),
        if (items.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: EmptyState(
              icon: Icons.travel_explore_outlined,
              message: 'Aucun contenu disponible pour le moment.',
            ),
          )
        else
          SizedBox(
            height: 362,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              scrollDirection: Axis.horizontal,
              itemCount: items.length,
              separatorBuilder: (_, _) => const SizedBox(width: 12),
              itemBuilder: (context, index) =>
                  _CatalogueCard(item: items[index], controller: controller),
            ),
          ),
      ],
    );
  }
}

class _CatalogueCard extends StatelessWidget {
  const _CatalogueCard({required this.item, required this.controller});

  final CatalogueItem item;
  final AppController controller;

  void _showDetails(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) =>
            _CatalogueDetailPage(item: item, controller: controller),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 272,
      child: InkWell(
        onTap: () => _showDetails(context),
        borderRadius: BorderRadius.circular(12),
        child: Card(
          elevation: 2,
          clipBehavior: Clip.antiAlias,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: AppColors.gold.withValues(alpha: 0.26)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 118,
                color: AppColors.ink,
                child: item.imageUrl.isEmpty
                    ? const Center(
                        child: Icon(
                          Icons.landscape_outlined,
                          color: AppColors.gold,
                        ),
                      )
                    : Image.network(
                        item.imageUrl,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => const Center(
                          child: Icon(Icons.image_not_supported_outlined),
                        ),
                      ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          if (item.badge != null)
                            StatusPill(label: item.badge!),
                          const Spacer(),
                          if (item.price != null)
                            Text(
                              item.price!,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: AppColors.gold,
                                fontSize: 12,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        height: 42,
                        child: Text(
                          item.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppColors.ink,
                            fontWeight: FontWeight.w900,
                            height: 1.15,
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      SizedBox(
                        height: 22,
                        child: Text(
                          item.subtitle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: AppColors.muted),
                        ),
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        height: 20,
                        child: item.location == null
                            ? const SizedBox.shrink()
                            : _CatalogueLocationLine(location: item.location!),
                      ),
                      Expanded(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            if (item.primaryInfo != null)
                              _CatalogueInfoPill(
                                icon: _cataloguePrimaryIcon(item.kind),
                                text: item.primaryInfo!,
                              ),
                            if (item.secondaryInfo != null)
                              _CatalogueInfoPill(
                                icon: _catalogueSecondaryIcon(item.kind),
                                text: item.secondaryInfo!,
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

IconData _cataloguePrimaryIcon(String kind) {
  switch (kind) {
    case 'driver':
      return Icons.directions_car_outlined;
    case 'rental':
      return Icons.payments_outlined;
    case 'goodPlan':
      return Icons.local_offer_outlined;
    default:
      return Icons.person_outline;
  }
}

IconData _catalogueSecondaryIcon(String kind) {
  switch (kind) {
    case 'rental':
      return Icons.calendar_month_outlined;
    case 'goodPlan':
      return Icons.notes_outlined;
    default:
      return Icons.star_outline;
  }
}

class _CatalogueLocationLine extends StatelessWidget {
  const _CatalogueLocationLine({required this.location});

  final String location;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.location_on_outlined, size: 16, color: AppColors.gold),
        const SizedBox(width: 5),
        Expanded(
          child: Text(
            location,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: AppColors.ink,
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ],
    );
  }
}

class _CatalogueInfoPill extends StatelessWidget {
  const _CatalogueInfoPill({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 7),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.gold.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.gold.withValues(alpha: 0.24)),
        ),
        child: Row(
          children: [
            Icon(icon, size: 15, color: AppColors.gold),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                text,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: AppColors.ink,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CatalogueDetailPage extends StatefulWidget {
  const _CatalogueDetailPage({required this.item, required this.controller});

  final CatalogueItem item;
  final AppController controller;

  @override
  State<_CatalogueDetailPage> createState() => _CatalogueDetailPageState();
}

class _CatalogueDetailPageState extends State<_CatalogueDetailPage> {
  late CatalogueBookingOption? _selectedDriverRate =
      widget.item.bookingOptions.isEmpty
      ? null
      : widget.item.bookingOptions.first;

  void _openReservation(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => _CatalogueReservationPage(
          item: widget.item,
          controller: widget.controller,
          initialOption: _selectedDriverRate,
        ),
      ),
    );
  }

  bool get _isDriver => widget.item.kind == 'driver';

  List<String> get _visibleDetails => widget.item.details
      .where(
        (detail) =>
            !_isDriver ||
            (!detail.startsWith('Jour :') && !detail.startsWith('Mois :')),
      )
      .toList();

  @override
  Widget build(BuildContext context) {
    final item = widget.item;

    return Scaffold(
      appBar: AppBar(title: const Text('Détails')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(18),
            child: Container(
              height: 220,
              color: AppColors.ink,
              child: item.imageUrl.isEmpty
                  ? const Center(
                      child: Icon(
                        Icons.landscape_outlined,
                        color: AppColors.gold,
                      ),
                    )
                  : Image.network(
                      item.imageUrl,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => const Center(
                        child: Icon(Icons.image_not_supported_outlined),
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 18),
          if (item.badge != null)
            Align(
              alignment: Alignment.centerLeft,
              child: StatusPill(label: item.badge!),
            ),
          const SizedBox(height: 12),
          Text(
            item.title,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w900,
              color: AppColors.ink,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            item.subtitle,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 15,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Informations',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.ink,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          for (final detail in _visibleDetails)
            _DetailInfoRow(
              icon: Icons.check_circle_outline,
              text: detail,
              color: AppColors.gold,
            ),
          if (_isDriver && item.bookingOptions.isNotEmpty)
            _DriverRateSwitch(
              options: item.bookingOptions,
              selected: _selectedDriverRate ?? item.bookingOptions.first,
              onChanged: (option) {
                setState(() => _selectedDriverRate = option);
              },
            ),
          if (item.canReserve && item.bookingOptions.isNotEmpty) ...[
            const SizedBox(height: 18),
            FilledButton.icon(
              onPressed: () => _openReservation(context),
              icon: const Icon(Icons.calendar_month_outlined),
              label: const Text('Réserver'),
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(52),
                backgroundColor: AppColors.ink,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _DetailInfoRow extends StatelessWidget {
  const _DetailInfoRow({
    required this.icon,
    required this.text,
    required this.color,
  });

  final IconData icon;
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                color: AppColors.ink,
                height: 1.35,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DriverRateSwitch extends StatelessWidget {
  const _DriverRateSwitch({
    required this.options,
    required this.selected,
    required this.onChanged,
  });

  final List<CatalogueBookingOption> options;
  final CatalogueBookingOption selected;
  final ValueChanged<CatalogueBookingOption> onChanged;

  String _label(CatalogueBookingOption option) =>
      option.days >= 30 ? 'Mois' : 'Jour';

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 2, bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Tarif',
            style: TextStyle(color: AppColors.ink, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                for (final option in options)
                  Expanded(
                    child: GestureDetector(
                      onTap: () => onChanged(option),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: option == selected
                              ? AppColors.gold
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          _label(option),
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: option == selected
                                ? Colors.black
                                : AppColors.muted,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            selected.label,
            style: const TextStyle(
              color: AppColors.ink,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _CatalogueReservationPage extends StatefulWidget {
  const _CatalogueReservationPage({
    required this.item,
    required this.controller,
    this.initialOption,
  });

  final CatalogueItem item;
  final AppController controller;
  final CatalogueBookingOption? initialOption;

  @override
  State<_CatalogueReservationPage> createState() =>
      _CatalogueReservationPageState();
}

class _CatalogueReservationPageState extends State<_CatalogueReservationPage> {
  DateTime? _date;
  DateTime? _startDate;
  DateTime? _endDate;
  late CatalogueBookingOption _option =
      widget.initialOption ?? widget.item.bookingOptions.first;
  bool _isSubmitting = false;

  bool get _isRental => widget.item.kind == 'rental';

  CatalogueBookingOption? get _dailyRentalOption =>
      _firstBookingOption((option) => option.days == 1);

  CatalogueBookingOption? get _monthlyRentalOption =>
      _firstBookingOption((option) => option.days >= 30);

  CatalogueBookingOption? _firstBookingOption(
    bool Function(CatalogueBookingOption option) test,
  ) {
    for (final option in widget.item.bookingOptions) {
      if (test(option)) {
        return option;
      }
    }
    return null;
  }

  int get _rentalNights {
    final start = _startDate;
    final end = _endDate;
    if (start == null || end == null || !end.isAfter(start)) {
      return 0;
    }
    return end.difference(start).inDays;
  }

  int get _rentalTotalFcfa {
    final nights = _rentalNights;
    if (nights <= 0) {
      return 0;
    }

    final dailyPrice = _dailyRentalOption?.priceFcfa ?? 0;
    final monthlyPrice = _monthlyRentalOption?.priceFcfa ?? 0;
    if (monthlyPrice <= 0) {
      return nights * dailyPrice;
    }

    final months = nights ~/ 30;
    final remainingDays = nights % 30;
    return (months * monthlyPrice) + (remainingDays * dailyPrice);
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final selected = await showDatePicker(
      context: context,
      initialDate: _date ?? now.add(const Duration(days: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
      helpText: 'Choisir une date',
      cancelText: 'Annuler',
      confirmText: 'Valider',
      fieldLabelText: 'Date de début',
      fieldHintText: 'jj/mm/aaaa',
    );
    if (selected != null) {
      setState(() => _date = selected);
    }
  }

  Future<void> _pickRentalPeriod() async {
    final today = DateTime.now();
    final firstDate = DateTime(today.year, today.month, today.day);
    final selected = await showDateRangePicker(
      context: context,
      initialDateRange: _startDate != null && _endDate != null
          ? DateTimeRange(start: _startDate!, end: _endDate!)
          : DateTimeRange(
              start: firstDate,
              end: firstDate.add(const Duration(days: 1)),
            ),
      firstDate: firstDate,
      lastDate: firstDate.add(const Duration(days: 365)),
      helpText: 'Choisir les dates',
      cancelText: 'Annuler',
      confirmText: 'Valider',
      saveText: 'Valider',
      fieldStartLabelText: 'Date de début',
      fieldEndLabelText: 'Date de fin',
    );

    if (selected != null) {
      setState(() {
        _startDate = selected.start;
        _endDate = selected.end;
      });
    }
  }

  Future<void> _submit() async {
    if (_isRental) {
      await _submitRental();
      return;
    }

    if (_date == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Choisissez une date de début.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    final bookingId = await widget.controller.reserveCatalogueItem(
      item: widget.item,
      option: _option,
      date: _date!,
    );

    if (!mounted) {
      return;
    }

    setState(() => _isSubmitting = false);

    if (bookingId == null || bookingId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Impossible de créer la réservation.')),
      );
      return;
    }

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text('Réservation #$bookingId créée.')));
    Navigator.of(context).pop();
    Navigator.of(context).pop();
  }

  Future<void> _submitRental() async {
    final start = _startDate;
    final end = _endDate;
    if (start == null || end == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Choisissez une date de début et de fin.'),
        ),
      );
      return;
    }
    if (!end.isAfter(start)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('La date de fin doit être après la date de début.'),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    final bookingId = await widget.controller.reserveRentalItem(
      item: widget.item,
      startDate: start,
      endDate: end,
    );

    if (!mounted) {
      return;
    }

    setState(() => _isSubmitting = false);

    if (bookingId == null || bookingId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Impossible de créer la réservation.')),
      );
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Demande de location #$bookingId créée.')),
    );
    Navigator.of(context).pop();
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final client = widget.controller.client;
    final dateLabel = _date == null
        ? 'Choisir une date'
        : '${_date!.day.toString().padLeft(2, '0')}/${_date!.month.toString().padLeft(2, '0')}/${_date!.year}';
    final startLabel = _startDate == null
        ? 'Début'
        : '${_startDate!.day.toString().padLeft(2, '0')}/${_startDate!.month.toString().padLeft(2, '0')}/${_startDate!.year}';
    final endLabel = _endDate == null
        ? 'Fin'
        : '${_endDate!.day.toString().padLeft(2, '0')}/${_endDate!.month.toString().padLeft(2, '0')}/${_endDate!.year}';

    return Scaffold(
      appBar: AppBar(title: const Text('Réserver')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          Text(
            widget.item.title,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: AppColors.ink,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            client?.fullName ?? '',
            style: const TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 20),
          if (_isRental) ...[
            Text(
              'Dates du séjour',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: _pickRentalPeriod,
              icon: const Icon(Icons.date_range_outlined),
              label: Text('$startLabel → $endLabel'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                alignment: Alignment.centerLeft,
              ),
            ),
            const SizedBox(height: 12),
            _RentalPriceSummary(
              nights: _rentalNights,
              totalFcfa: _rentalTotalFcfa,
              dailyPriceFcfa: _dailyRentalOption?.priceFcfa ?? 0,
              monthlyPriceFcfa: _monthlyRentalOption?.priceFcfa ?? 0,
            ),
          ] else ...[
            Text(
              'Date de début',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              onPressed: _pickDate,
              icon: const Icon(Icons.calendar_today_outlined),
              label: Text(dateLabel),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                alignment: Alignment.centerLeft,
              ),
            ),
            const SizedBox(height: 18),
            Text(
              widget.item.kind == 'driver' ? 'Durée de location' : 'Durée',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            for (final option in widget.item.bookingOptions)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: InkWell(
                  onTap: () => setState(() => _option = option),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: option == _option
                          ? AppColors.gold.withValues(alpha: 0.12)
                          : Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: option == _option
                            ? AppColors.gold
                            : AppColors.border,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          option == _option
                              ? Icons.radio_button_checked
                              : Icons.radio_button_unchecked,
                          color: AppColors.gold,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                option.label,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              Text(
                                '${option.days} jour${option.days > 1 ? 's' : ''}',
                                style: const TextStyle(color: AppColors.muted),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            const SizedBox(height: 18),
          ],
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.sand,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: const Text(
              'Mode test : le paiement est simulé comme sur le site. La réservation sera ajoutée à vos QR codes.',
              style: TextStyle(color: AppColors.muted, height: 1.35),
            ),
          ),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: _isSubmitting ? null : _submit,
            icon: const Icon(Icons.check_circle_outline),
            label: Text(
              _isSubmitting
                  ? 'Création en cours...'
                  : _isRental
                  ? 'Finaliser la demande'
                  : 'Confirmer la réservation',
            ),
            style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(52),
              backgroundColor: AppColors.ink,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class _RentalPriceSummary extends StatelessWidget {
  const _RentalPriceSummary({
    required this.nights,
    required this.totalFcfa,
    required this.dailyPriceFcfa,
    required this.monthlyPriceFcfa,
  });

  final int nights;
  final int totalFcfa;
  final int dailyPriceFcfa;
  final int monthlyPriceFcfa;

  String _money(int amount) {
    final value = amount.toString();
    final buffer = StringBuffer();
    for (var i = 0; i < value.length; i++) {
      final position = value.length - i;
      buffer.write(value[i]);
      if (position > 1 && position % 3 == 1) {
        buffer.write(' ');
      }
    }
    return '${buffer.toString()} FCFA';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Prix estimé',
            style: TextStyle(color: AppColors.ink, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _PriceTile(
                  label: 'Nuits',
                  value: nights > 0 ? '$nights' : '-',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _PriceTile(
                  label: 'Total',
                  value: totalFcfa > 0 ? _money(totalFcfa) : '-',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Base : ${_money(dailyPriceFcfa)} / jour'
            '${monthlyPriceFcfa > 0 ? ' · ${_money(monthlyPriceFcfa)} / mois' : ''}',
            style: const TextStyle(color: AppColors.muted, height: 1.35),
          ),
        ],
      ),
    );
  }
}

class _PriceTile extends StatelessWidget {
  const _PriceTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              color: AppColors.ink,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _BookingsPage extends StatefulWidget {
  const _BookingsPage({required this.controller});

  final AppController controller;

  @override
  State<_BookingsPage> createState() => _BookingsPageState();
}

class _BookingsPageState extends State<_BookingsPage> {
  static const int _initialItems = 4;
  static const int _loadStep = 4;

  final _scrollController = ScrollController();
  final _searchController = TextEditingController();
  String _typeFilter = 'all';
  String _statusFilter = 'all';
  int _visibleCount = _initialItems;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_loadMoreOnScroll);
    _searchController.addListener(_resetVisibleItems);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _resetVisibleItems() {
    setState(() => _visibleCount = _initialItems);
  }

  List<BookingItem> _filteredBookings() {
    final query = _searchController.text.trim().toLowerCase();
    return widget.controller.bookings.where((booking) {
      final matchesType = _typeFilter == 'all' || booking.type == _typeFilter;
      final matchesStatus =
          _statusFilter == 'all' || booking.status == _statusFilter;
      final matchesSearch =
          query.isEmpty ||
          booking.title.toLowerCase().contains(query) ||
          booking.id.toLowerCase().contains(query) ||
          booking.status.toLowerCase().contains(query) ||
          booking.price.toLowerCase().contains(query);
      return matchesType && matchesStatus && matchesSearch;
    }).toList();
  }

  void _loadMoreOnScroll() {
    if (!_scrollController.hasClients) {
      return;
    }

    final filteredBookings = _filteredBookings();
    if (_visibleCount >= filteredBookings.length) {
      return;
    }

    final position = _scrollController.position;
    if (position.pixels >= position.maxScrollExtent - 160) {
      setState(() {
        _visibleCount = (_visibleCount + _loadStep).clamp(
          0,
          filteredBookings.length,
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookings = widget.controller.bookings;
    final filteredBookings = _filteredBookings();
    final visibleBookings = filteredBookings.take(_visibleCount).toList();
    final hasMore = _visibleCount < filteredBookings.length;

    return _ClientListPage(
      title: 'Mes réservations',
      subtitle: 'Suivi des parcours et chauffeurs réservés.',
      controller: _scrollController,
      child: bookings.isEmpty
          ? const EmptyState(
              icon: Icons.confirmation_number_outlined,
              message: 'Aucune réservation liée à ce compte.',
            )
          : Column(
              children: [
                _BookingsFilters(
                  searchController: _searchController,
                  typeFilter: _typeFilter,
                  statusFilter: _statusFilter,
                  statuses: bookings.map((booking) => booking.status).toSet(),
                  total: filteredBookings.length,
                  onTypeChanged: (value) {
                    setState(() {
                      _typeFilter = value;
                      _visibleCount = _initialItems;
                    });
                  },
                  onStatusChanged: (value) {
                    setState(() {
                      _statusFilter = value;
                      _visibleCount = _initialItems;
                    });
                  },
                ),
                const SizedBox(height: 12),
                if (filteredBookings.isEmpty)
                  const EmptyState(
                    icon: Icons.search_off_outlined,
                    message: 'Aucune réservation ne correspond au filtre.',
                  )
                else
                  for (final booking in visibleBookings)
                    _BookingQrCard(booking: booking),
                if (hasMore) const _InfiniteScrollLoader(),
              ],
            ),
    );
  }
}

class _BookingsFilters extends StatelessWidget {
  const _BookingsFilters({
    required this.searchController,
    required this.typeFilter,
    required this.statusFilter,
    required this.statuses,
    required this.total,
    required this.onTypeChanged,
    required this.onStatusChanged,
  });

  final TextEditingController searchController;
  final String typeFilter;
  final String statusFilter;
  final Set<String> statuses;
  final int total;
  final ValueChanged<String> onTypeChanged;
  final ValueChanged<String> onStatusChanged;

  @override
  Widget build(BuildContext context) {
    final statusItems = [
      const DropdownMenuItem(value: 'all', child: Text('Tous statuts')),
      for (final status in statuses.where((status) => status.isNotEmpty))
        DropdownMenuItem(value: status, child: Text(status)),
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          children: [
            TextField(
              controller: searchController,
              decoration: InputDecoration(
                hintText: 'Rechercher une réservation...',
                prefixIcon: const Icon(Icons.search, color: AppColors.gold),
                filled: true,
                fillColor: AppColors.sand,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    initialValue: typeFilter,
                    items: const [
                      DropdownMenuItem(value: 'all', child: Text('Tous types')),
                      DropdownMenuItem(value: 'tour', child: Text('Parcours')),
                      DropdownMenuItem(
                        value: 'driver',
                        child: Text('Chauffeur'),
                      ),
                    ],
                    onChanged: (value) {
                      if (value != null) {
                        onTypeChanged(value);
                      }
                    },
                    decoration: InputDecoration(
                      prefixIcon: const Icon(
                        Icons.category_outlined,
                        color: AppColors.gold,
                      ),
                      filled: true,
                      fillColor: AppColors.sand,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    initialValue: statusFilter,
                    items: statusItems,
                    onChanged: (value) {
                      if (value != null) {
                        onStatusChanged(value);
                      }
                    },
                    decoration: InputDecoration(
                      prefixIcon: const Icon(
                        Icons.verified_outlined,
                        color: AppColors.gold,
                      ),
                      filled: true,
                      fillColor: AppColors.sand,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(
                  Icons.qr_code_2_outlined,
                  size: 18,
                  color: AppColors.gold,
                ),
                const SizedBox(width: 8),
                Text(
                  '$total QR codes',
                  style: const TextStyle(
                    color: AppColors.muted,
                    fontWeight: FontWeight.w700,
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

class _BookingQrCard extends StatelessWidget {
  const _BookingQrCard({required this.booking});

  final BookingItem booking;

  void _showTicket(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => _BookingTicketPage(booking: booking),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: BorderSide(color: AppColors.gold.withValues(alpha: 0.18)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          booking.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w900),
                        ),
                      ),
                      const SizedBox(width: 8),
                      StatusPill(label: booking.status),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${booking.duration} · ${booking.price}',
                    style: const TextStyle(color: AppColors.muted),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'QR ORITA réservation #${booking.id}',
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            InkWell(
              onTap: () => _showTicket(context),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: 92,
                height: 92,
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.gold.withValues(alpha: 0.34),
                  ),
                ),
                child: QrImageView(
                  data: booking.qrCodePayload,
                  backgroundColor: Colors.white,
                  padding: EdgeInsets.zero,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BookingTicketPage extends StatelessWidget {
  const _BookingTicketPage({required this.booking});

  final BookingItem booking;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ticket')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [_TicketCard(booking: booking)],
      ),
    );
  }
}

class _TicketCard extends StatelessWidget {
  const _TicketCard({required this.booking});

  final BookingItem booking;

  @override
  Widget build(BuildContext context) {
    final typeLabel = booking.type == 'driver' ? 'Chauffeur' : 'Parcours';
    final dateLabel = _ticketDate(booking.date);
    final code = booking.id.length > 6
        ? booking.id.substring(booking.id.length - 6).toUpperCase()
        : booking.id.toUpperCase();

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: AppColors.ink.withValues(alpha: 0.08),
            blurRadius: 24,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(color: AppColors.ink),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const _OritaMark(),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'ORITA',
                        style: TextStyle(
                          color: AppColors.gold.withValues(alpha: 0.9),
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    StatusPill(label: booking.status),
                  ],
                ),
                const SizedBox(height: 22),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Text(
                        typeLabel.toUpperCase(),
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.72),
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                        ),
                      ),
                    ),
                    Text(
                      'ORITA-$code',
                      style: TextStyle(
                        color: AppColors.gold.withValues(alpha: 0.96),
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  booking.title,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _TicketInfoCell(
                        label: 'TYPE',
                        value: typeLabel,
                        icon: Icons.category_outlined,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _TicketInfoCell(
                        label: 'DATE',
                        value: dateLabel,
                        icon: Icons.calendar_today_outlined,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _TicketInfoCell(
                        label: 'DURÉE',
                        value: booking.duration,
                        icon: Icons.schedule_outlined,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _TicketInfoCell(
                        label: 'MONTANT',
                        value: booking.price,
                        icon: Icons.payments_outlined,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                const _TicketPerforation(),
                const SizedBox(height: 20),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.gold.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: AppColors.gold.withValues(alpha: 0.24),
                    ),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.confirmation_number_outlined,
                            color: AppColors.gold,
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Carte d’embarquement réservation #${booking.id}',
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                color: AppColors.ink,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      Center(
                        child: Container(
                          width: 230,
                          height: 230,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: QrImageView(
                            data: booking.qrCodePayload,
                            backgroundColor: Colors.white,
                            padding: EdgeInsets.zero,
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      const Text(
                        'Présentez ce QR code au prestataire au départ.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppColors.muted,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TicketInfoCell extends StatelessWidget {
  const _TicketInfoCell({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 82),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.sand,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.gold, size: 20),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 11,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value.isEmpty ? 'À confirmer' : value,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: AppColors.ink,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _TicketPerforation extends StatelessWidget {
  const _TicketPerforation();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 22,
          height: 22,
          decoration: const BoxDecoration(
            color: AppColors.sand,
            shape: BoxShape.circle,
          ),
        ),
        Expanded(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final count = (constraints.maxWidth / 12).floor();
              return Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(
                  count,
                  (_) => Container(
                    width: 5,
                    height: 2,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(999),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        Container(
          width: 22,
          height: 22,
          decoration: const BoxDecoration(
            color: AppColors.sand,
            shape: BoxShape.circle,
          ),
        ),
      ],
    );
  }
}

String _ticketDate(String value) {
  if (value.isEmpty) {
    return 'À confirmer';
  }

  final parsed = DateTime.tryParse(value);
  if (parsed == null) {
    return value;
  }

  return '${parsed.day.toString().padLeft(2, '0')}/${parsed.month.toString().padLeft(2, '0')}/${parsed.year}';
}

class _QrScannerPage extends StatefulWidget {
  const _QrScannerPage({required this.controller});

  final AppController controller;

  @override
  State<_QrScannerPage> createState() => _QrScannerPageState();
}

class _QrScannerPageState extends State<_QrScannerPage> {
  late final MobileScannerController scannerController =
      MobileScannerController(detectionSpeed: DetectionSpeed.noDuplicates);

  bool _isHandlingScan = false;
  String? _lastPayload;
  BookingItem? _matchedBooking;

  @override
  void dispose() {
    scannerController.dispose();
    super.dispose();
  }

  Future<void> _handleDetection(BarcodeCapture capture) async {
    if (_isHandlingScan) {
      return;
    }

    final payload = capture.barcodes
        .map((barcode) => barcode.rawValue?.trim())
        .whereType<String>()
        .where((value) => value.isNotEmpty)
        .firstOrNull;

    if (payload == null) {
      return;
    }

    _isHandlingScan = true;
    await scannerController.stop();
    final booking = _bookingFromPayload(payload);

    if (!mounted) {
      return;
    }

    setState(() {
      _lastPayload = payload;
      _matchedBooking = booking;
    });

    if (booking != null) {
      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => _BookingTicketPage(booking: booking),
        ),
      );
    }
  }

  BookingItem? _bookingFromPayload(String payload) {
    for (final booking in widget.controller.bookings) {
      if (payload == booking.qrCodePayload || payload.contains(booking.id)) {
        return booking;
      }
    }

    final uri = Uri.tryParse(payload);
    final id = uri?.queryParameters['id'];
    if (id == null || id.isEmpty) {
      return null;
    }

    for (final booking in widget.controller.bookings) {
      if (booking.id == id) {
        return booking;
      }
    }

    return null;
  }

  Future<void> _restartScan() async {
    setState(() {
      _isHandlingScan = false;
      _lastPayload = null;
      _matchedBooking = null;
    });
    await scannerController.start();
  }

  @override
  Widget build(BuildContext context) {
    return _ClientListPage(
      title: 'Scanner QR',
      subtitle: 'Utilisez la caméra pour scanner un ticket ou une réservation.',
      child: Column(
        children: [
          Card(
            clipBehavior: Clip.antiAlias,
            child: SizedBox(
              height: 420,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  MobileScanner(
                    controller: scannerController,
                    onDetect: _handleDetection,
                  ),
                  Container(color: Colors.black.withValues(alpha: 0.16)),
                  Center(
                    child: Container(
                      width: 250,
                      height: 250,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.white, width: 3),
                      ),
                    ),
                  ),
                  Positioned(
                    left: 18,
                    right: 18,
                    bottom: 18,
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.ink.withValues(alpha: 0.74),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Text(
                        'Placez le QR code dans le cadre pour vérifier la réservation.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          if (_lastPayload != null)
            _ScanResultCard(
              payload: _lastPayload!,
              booking: _matchedBooking,
              onRetry: _restartScan,
            )
          else
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: const [
                    Icon(Icons.camera_alt_outlined, color: AppColors.gold),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Caméra active. Aucun QR détecté pour le moment.',
                        style: TextStyle(fontWeight: FontWeight.w800),
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ScanResultCard extends StatelessWidget {
  const _ScanResultCard({
    required this.payload,
    required this.booking,
    required this.onRetry,
  });

  final String payload;
  final BookingItem? booking;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final match = booking;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  match == null
                      ? Icons.warning_amber_outlined
                      : Icons.verified_outlined,
                  color: match == null ? Colors.orange : AppColors.gold,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    match == null
                        ? 'QR détecté hors de vos réservations'
                        : 'Réservation reconnue',
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            if (match != null) ...[
              Text(match.title, style: const TextStyle(color: AppColors.ink)),
              const SizedBox(height: 4),
              Text(
                '#${match.id} · ${match.status}',
                style: const TextStyle(color: AppColors.muted),
              ),
            ] else
              Text(
                payload,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppColors.muted),
              ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.qr_code_scanner_outlined),
              label: const Text('Scanner à nouveau'),
            ),
          ],
        ),
      ),
    );
  }
}

enum _DocumentFilter { all, confirmation, facture }

class _DocumentsPage extends StatefulWidget {
  const _DocumentsPage({required this.controller});

  final AppController controller;

  @override
  State<_DocumentsPage> createState() => _DocumentsPageState();
}

class _DocumentsPageState extends State<_DocumentsPage> {
  static const int _initialItems = 3;
  static const int _loadStep = 3;

  final _scrollController = ScrollController();
  final _searchController = TextEditingController();
  _DocumentFilter _filter = _DocumentFilter.all;
  int _visibleCount = _initialItems;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_loadMoreOnScroll);
    _searchController.addListener(_resetVisibleItems);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _resetVisibleItems() {
    setState(() => _visibleCount = _initialItems);
  }

  void _loadMoreOnScroll() {
    if (!_scrollController.hasClients) {
      return;
    }

    final filteredBookings = _filteredBookings();
    if (_visibleCount >= filteredBookings.length) {
      return;
    }

    final position = _scrollController.position;
    if (position.pixels >= position.maxScrollExtent - 160) {
      setState(() {
        _visibleCount = (_visibleCount + _loadStep).clamp(
          0,
          filteredBookings.length,
        );
      });
    }
  }

  List<BookingItem> _filteredBookings() {
    final query = _searchController.text.trim().toLowerCase();
    if (query.isEmpty) {
      return widget.controller.bookings;
    }

    return widget.controller.bookings.where((booking) {
      return booking.title.toLowerCase().contains(query) ||
          booking.id.toLowerCase().contains(query) ||
          booking.status.toLowerCase().contains(query);
    }).toList();
  }

  Future<void> _openDocument(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    final opened = await launchUrl(uri, webOnlyWindowName: '_blank');
    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Impossible d’ouvrir le document PDF.')),
      );
    }
  }

  Future<void> _downloadDocument(BuildContext context, String url) async {
    final separator = url.contains('?') ? '&' : '?';
    final uri = Uri.parse('$url${separator}download=1');
    final opened = await launchUrl(uri, webOnlyWindowName: '_blank');
    if (!opened && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Impossible de télécharger le PDF.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final filteredBookings = _filteredBookings();
    final visibleBookings = filteredBookings.take(_visibleCount).toList();
    final hasMore = _visibleCount < filteredBookings.length;

    return _ClientListPage(
      title: 'Mes documents',
      subtitle: 'Factures et confirmations PDF générées par réservation.',
      controller: _scrollController,
      child: widget.controller.bookings.isEmpty
          ? const EmptyState(
              icon: Icons.picture_as_pdf_outlined,
              message: 'Aucun document disponible.',
            )
          : Column(
              children: [
                _DocumentsFilters(
                  searchController: _searchController,
                  filter: _filter,
                  total: filteredBookings.length,
                  onFilterChanged: (filter) {
                    setState(() {
                      _filter = filter;
                      _visibleCount = _initialItems;
                    });
                  },
                ),
                const SizedBox(height: 12),
                if (filteredBookings.isEmpty)
                  const EmptyState(
                    icon: Icons.search_off_outlined,
                    message: 'Aucun document ne correspond au filtre.',
                  )
                else
                  for (final booking in visibleBookings)
                    _DocumentBookingCard(
                      booking: booking,
                      filter: _filter,
                      onPreview: (kind) => _openDocument(
                        context,
                        widget.controller.documentUrl(booking, kind),
                      ),
                      onDownload: (kind) => _downloadDocument(
                        context,
                        widget.controller.documentUrl(booking, kind),
                      ),
                    ),
                if (hasMore) const _InfiniteScrollLoader(),
              ],
            ),
    );
  }
}

class _DocumentsFilters extends StatelessWidget {
  const _DocumentsFilters({
    required this.searchController,
    required this.filter,
    required this.total,
    required this.onFilterChanged,
  });

  final TextEditingController searchController;
  final _DocumentFilter filter;
  final int total;
  final ValueChanged<_DocumentFilter> onFilterChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          children: [
            TextField(
              controller: searchController,
              decoration: InputDecoration(
                hintText: 'Rechercher une réservation...',
                prefixIcon: const Icon(Icons.search, color: AppColors.gold),
                filled: true,
                fillColor: AppColors.sand,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: SegmentedButton<_DocumentFilter>(
                    segments: const [
                      ButtonSegment(
                        value: _DocumentFilter.all,
                        icon: Icon(Icons.folder_copy_outlined),
                        label: Text('Tous'),
                      ),
                      ButtonSegment(
                        value: _DocumentFilter.confirmation,
                        icon: Icon(Icons.description_outlined),
                        label: Text('Conf.'),
                      ),
                      ButtonSegment(
                        value: _DocumentFilter.facture,
                        icon: Icon(Icons.receipt_long_outlined),
                        label: Text('Fact.'),
                      ),
                    ],
                    selected: {filter},
                    onSelectionChanged: (selection) =>
                        onFilterChanged(selection.first),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(
                  Icons.picture_as_pdf_outlined,
                  size: 18,
                  color: AppColors.gold,
                ),
                const SizedBox(width: 8),
                Text(
                  '$total réservations',
                  style: const TextStyle(
                    color: AppColors.muted,
                    fontWeight: FontWeight.w700,
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

class _DocumentBookingCard extends StatelessWidget {
  const _DocumentBookingCard({
    required this.booking,
    required this.filter,
    required this.onPreview,
    required this.onDownload,
  });

  final BookingItem booking;
  final _DocumentFilter filter;
  final ValueChanged<String> onPreview;
  final ValueChanged<String> onDownload;

  @override
  Widget build(BuildContext context) {
    final showConfirmation =
        filter == _DocumentFilter.all || filter == _DocumentFilter.confirmation;
    final showFacture =
        filter == _DocumentFilter.all || filter == _DocumentFilter.facture;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              booking.title,
              style: const TextStyle(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 4),
            Text(
              'Réservation #${booking.id}',
              style: const TextStyle(color: AppColors.muted),
            ),
            const SizedBox(height: 14),
            if (showConfirmation)
              _DocumentActionRow(
                label: 'Confirmation',
                icon: Icons.description_outlined,
                onPreview: () => onPreview('confirmation'),
                onDownload: () => onDownload('confirmation'),
              ),
            if (showConfirmation && showFacture) const SizedBox(height: 10),
            if (showFacture)
              _DocumentActionRow(
                label: 'Facture',
                icon: Icons.receipt_long_outlined,
                onPreview: () => onPreview('facture'),
                onDownload: () => onDownload('facture'),
              ),
          ],
        ),
      ),
    );
  }
}

class _DocumentActionRow extends StatelessWidget {
  const _DocumentActionRow({
    required this.label,
    required this.icon,
    required this.onPreview,
    required this.onDownload,
  });

  final String label;
  final IconData icon;
  final VoidCallback onPreview;
  final VoidCallback onDownload;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.sand,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.gold),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w900),
            ),
          ),
          IconButton(
            tooltip: 'Prévisualiser',
            onPressed: onPreview,
            icon: const Icon(Icons.visibility_outlined),
          ),
          IconButton(
            tooltip: 'Télécharger',
            onPressed: onDownload,
            icon: const Icon(Icons.download_outlined),
          ),
        ],
      ),
    );
  }
}

class _MessagesPage extends StatefulWidget {
  const _MessagesPage({required this.controller});

  final AppController controller;

  @override
  State<_MessagesPage> createState() => _MessagesPageState();
}

class _MessagesPageState extends State<_MessagesPage> {
  static const int _initialItems = 6;
  static const int _loadStep = 5;

  late List<_MessageConversation> _conversations;
  final _scrollController = ScrollController();
  int _visibleCount = _initialItems;
  bool _autoLoadScheduled = false;

  @override
  void initState() {
    super.initState();
    _conversations = _buildConversations();
    _scrollController.addListener(_loadMoreOnScroll);
  }

  @override
  void didUpdateWidget(covariant _MessagesPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller.bookings != widget.controller.bookings) {
      _conversations = _buildConversations();
      _visibleCount = _visibleCount.clamp(_initialItems, _conversations.length);
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  List<_MessageConversation> _buildConversations() {
    final clientName = widget.controller.client?.fullName ?? 'Client';
    final conversations = <_MessageConversation>[
      _MessageConversation(
        id: 'support',
        name: 'Assistance ORITA',
        role: 'Support',
        subject: 'Questions générales',
        avatarUrl: '',
        messages: [
          _ChatMessage(
            author: 'ORITA',
            text:
                'Bonjour $clientName, nous suivons vos réservations, documents et demandes ici.',
            time: '09:00',
            fromClient: false,
          ),
          const _ChatMessage(
            author: 'Moi',
            text: 'Je veux être accompagné sur mon séjour.',
            time: '09:04',
            fromClient: true,
          ),
        ],
      ),
    ];

    for (final booking in widget.controller.bookings) {
      final isDriver = booking.type == 'driver';
      final person = isDriver ? booking.title : 'Guide / équipe parcours';
      final catalogueItem = _catalogueItemForBooking(booking);
      conversations.add(
        _MessageConversation(
          id: booking.id,
          name: person,
          role: isDriver ? 'Chauffeur' : 'Parcours',
          subject: 'Réservation #${booking.id}',
          avatarUrl: catalogueItem?.imageUrl ?? '',
          messages: [
            _ChatMessage(
              author: 'ORITA',
              text:
                  'Conversation ouverte pour ${booking.title}. Statut actuel : ${booking.status}.',
              time: '10:00',
              fromClient: false,
            ),
            _ChatMessage(
              author: person,
              text: isDriver
                  ? 'Je reste disponible pour confirmer le point de départ et les horaires.'
                  : 'Nous préparons les étapes, les horaires et les contacts utiles.',
              time: '10:08',
              fromClient: false,
            ),
          ],
        ),
      );
    }

    return conversations;
  }

  CatalogueItem? _catalogueItemForBooking(BookingItem booking) {
    final items = booking.type == 'driver'
        ? widget.controller.drivers
        : widget.controller.tours;

    for (final item in items) {
      if (item.id == booking.driverId ||
          item.id == booking.tourId ||
          item.title == booking.title) {
        return item;
      }
    }

    return null;
  }

  void _openConversation(_MessageConversation conversation) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => _ConversationChatPage(conversation: conversation),
      ),
    );
  }

  void _loadMoreOnScroll() {
    if (!_scrollController.hasClients ||
        _visibleCount >= _conversations.length) {
      return;
    }

    final position = _scrollController.position;
    if (position.pixels >= position.maxScrollExtent - 160) {
      _loadMore();
    }
  }

  void _loadMore() {
    if (_visibleCount >= _conversations.length) {
      return;
    }

    setState(() {
      _visibleCount = (_visibleCount + _loadStep).clamp(
        0,
        _conversations.length,
      );
    });
  }

  void _scheduleAutoLoadIfNeeded(bool hasMore) {
    if (!hasMore || _autoLoadScheduled) {
      return;
    }

    _autoLoadScheduled = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _autoLoadScheduled = false;
      if (!mounted ||
          !_scrollController.hasClients ||
          _visibleCount >= _conversations.length) {
        return;
      }

      final position = _scrollController.position;
      if (position.extentAfter < 180) {
        _loadMore();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final visibleConversations = _conversations.take(_visibleCount).toList();
    final hasMore = _visibleCount < _conversations.length;
    _scheduleAutoLoadIfNeeded(hasMore);

    return _ClientListPage(
      title: 'Mes messages',
      subtitle: 'Toutes vos conversations avec les personnes liées.',
      controller: _scrollController,
      child: Column(
        children: [
          for (final conversation in visibleConversations)
            _ConversationTile(
              conversation: conversation,
              onTap: () => _openConversation(conversation),
            ),
          if (hasMore) const _InfiniteScrollLoader(),
        ],
      ),
    );
  }
}

class _InfiniteScrollLoader extends StatelessWidget {
  const _InfiniteScrollLoader();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: const [
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
          SizedBox(width: 10),
          Text(
            'Chargement des conversations...',
            style: TextStyle(
              color: AppColors.muted,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageConversation {
  _MessageConversation({
    required this.id,
    required this.name,
    required this.role,
    required this.subject,
    required this.avatarUrl,
    required this.messages,
  });

  final String id;
  final String name;
  final String role;
  final String subject;
  final String avatarUrl;
  final List<_ChatMessage> messages;
}

class _ChatMessage {
  const _ChatMessage({
    required this.author,
    required this.text,
    required this.time,
    required this.fromClient,
  });

  final String author;
  final String text;
  final String time;
  final bool fromClient;
}

class _ConversationTile extends StatelessWidget {
  const _ConversationTile({required this.conversation, required this.onTap});

  final _MessageConversation conversation;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                _ConversationAvatar(
                  imageUrl: conversation.avatarUrl,
                  label: conversation.name,
                  radius: 30,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        conversation.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        conversation.role,
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
                const Icon(Icons.chevron_right, color: AppColors.muted),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ConversationChatPage extends StatefulWidget {
  const _ConversationChatPage({required this.conversation});

  final _MessageConversation conversation;

  @override
  State<_ConversationChatPage> createState() => _ConversationChatPageState();
}

class _ConversationChatPageState extends State<_ConversationChatPage> {
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
        _ChatMessage(
          author: 'Moi',
          text: text,
          time: 'Maintenant',
          fromClient: true,
        ),
      );
      widget.conversation.messages.add(
        _ChatMessage(
          author: widget.conversation.name,
          text:
              'Message reçu. Un conseiller ORITA vous répondra avec le contexte de ${widget.conversation.subject}.',
          time: 'Maintenant',
          fromClient: false,
        ),
      );
    });
    _messageController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Discussion')),
      body: SafeArea(
        child: _ChatPanel(
          conversation: widget.conversation,
          controller: _messageController,
          onSend: _sendMessage,
        ),
      ),
    );
  }
}

class _ConversationAvatar extends StatelessWidget {
  const _ConversationAvatar({
    required this.imageUrl,
    required this.label,
    required this.radius,
  });

  final String imageUrl;
  final String label;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final initials = label
        .split(' ')
        .where((part) => part.isNotEmpty)
        .take(2)
        .map((part) => part.characters.first.toUpperCase())
        .join();

    return CircleAvatar(
      radius: radius,
      backgroundColor: AppColors.gold.withValues(alpha: 0.16),
      backgroundImage: imageUrl.isEmpty ? null : NetworkImage(imageUrl),
      child: imageUrl.isEmpty
          ? Text(
              initials.isEmpty ? 'OR' : initials,
              style: const TextStyle(
                color: AppColors.ink,
                fontWeight: FontWeight.w900,
              ),
            )
          : null,
    );
  }
}

class _ChatPanel extends StatelessWidget {
  const _ChatPanel({
    required this.conversation,
    required this.controller,
    required this.onSend,
  });

  final _MessageConversation conversation;
  final TextEditingController controller;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Container(
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
                _ConversationAvatar(
                  imageUrl: conversation.avatarUrl,
                  label: conversation.name,
                  radius: 28,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        conversation.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                      Text(
                        conversation.subject,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: AppColors.muted),
                      ),
                    ],
                  ),
                ),
                StatusPill(label: conversation.role),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              itemCount: conversation.messages.length,
              itemBuilder: (context, index) {
                return _ChatBubble(message: conversation.messages[index]);
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
                    controller: controller,
                    minLines: 1,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'Votre message...',
                      filled: true,
                      fillColor: AppColors.sand,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onSubmitted: (_) => onSend(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  onPressed: onSend,
                  icon: const Icon(Icons.send_outlined),
                  tooltip: 'Envoyer',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({required this.message});

  final _ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final alignment = message.fromClient
        ? CrossAxisAlignment.end
        : CrossAxisAlignment.start;
    final color = message.fromClient ? AppColors.ink : AppColors.sand;
    final textColor = message.fromClient ? Colors.white : AppColors.ink;

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
              border: message.fromClient
                  ? null
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

class _ProfilePage extends StatefulWidget {
  const _ProfilePage({required this.controller});

  final AppController controller;

  @override
  State<_ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<_ProfilePage> {
  late final firstNameController = TextEditingController(
    text: widget.controller.client?.firstName ?? '',
  );
  late final lastNameController = TextEditingController(
    text: widget.controller.client?.lastName ?? '',
  );
  late final phoneController = TextEditingController(
    text: widget.controller.client?.phone ?? '',
  );
  late final currentPasswordController = TextEditingController();
  late final newPasswordController = TextEditingController();
  late final confirmPasswordController = TextEditingController();

  @override
  void dispose() {
    firstNameController.dispose();
    lastNameController.dispose();
    phoneController.dispose();
    currentPasswordController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _changePassword() async {
    final currentPassword = currentPasswordController.text;
    final newPassword = newPasswordController.text;
    final confirmPassword = confirmPasswordController.text;
    final messenger = ScaffoldMessenger.of(context);

    if (currentPassword.isEmpty ||
        newPassword.isEmpty ||
        confirmPassword.isEmpty) {
      messenger.showSnackBar(
        const SnackBar(
          content: Text('Renseignez les trois champs mot de passe.'),
        ),
      );
      return;
    }

    if (newPassword.length < 8) {
      messenger.showSnackBar(
        const SnackBar(
          content: Text(
            'Le nouveau mot de passe doit contenir au moins 8 caractères.',
          ),
        ),
      );
      return;
    }

    if (newPassword != confirmPassword) {
      messenger.showSnackBar(
        const SnackBar(content: Text('La confirmation ne correspond pas.')),
      );
      return;
    }

    final success = await widget.controller.changePassword(
      currentPassword: currentPassword,
      newPassword: newPassword,
    );

    if (!mounted) {
      return;
    }

    if (success) {
      currentPasswordController.clear();
      newPasswordController.clear();
      confirmPasswordController.clear();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Mot de passe mis à jour.')));
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          widget.controller.errorMessage ??
              'Impossible de modifier le mot de passe.',
        ),
      ),
    );
  }

  void _openDocuments() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => Scaffold(
          appBar: AppBar(title: const Text('Mes documents')),
          body: _DocumentsPage(controller: widget.controller),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final client = widget.controller.client;
    final fullName = client?.fullName ?? 'Client';
    final email = client?.email ?? '';
    final initials = fullName
        .split(' ')
        .where((part) => part.isNotEmpty)
        .take(2)
        .map((part) => part.characters.first.toUpperCase())
        .join();

    return _ClientListPage(
      title: 'Mon profil',
      subtitle: email,
      child: Column(
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 38,
                    backgroundColor: AppColors.gold.withValues(alpha: 0.16),
                    child: Text(
                      initials.isEmpty ? 'OR' : initials,
                      style: const TextStyle(
                        color: AppColors.ink,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          fullName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          email,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: AppColors.muted),
                        ),
                        const SizedBox(height: 8),
                        StatusPill(
                          label: client?.verified == true
                              ? 'Compte vérifié'
                              : 'Vérification en attente',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _ProfileStatCard(
                  icon: Icons.confirmation_number_outlined,
                  label: 'Réservations',
                  value: widget.controller.bookings.length.toString(),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _ProfileStatCard(
                  icon: Icons.picture_as_pdf_outlined,
                  label: 'Documents',
                  value: '${widget.controller.bookings.length * 2}',
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 8,
              ),
              leading: Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: AppColors.gold.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.picture_as_pdf_outlined,
                  color: AppColors.gold,
                ),
              ),
              title: const Text(
                'Mes documents',
                style: TextStyle(fontWeight: FontWeight.w900),
              ),
              subtitle: Text(
                '${widget.controller.bookings.length * 2} documents de réservation',
                style: const TextStyle(color: AppColors.muted),
              ),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: _openDocuments,
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Informations personnelles',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.ink,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 14),
                  _ProfileField(
                    controller: firstNameController,
                    label: 'Prénom',
                    icon: Icons.person_outline,
                  ),
                  _ProfileField(
                    controller: lastNameController,
                    label: 'Nom',
                    icon: Icons.badge_outlined,
                  ),
                  _ProfileField(
                    controller: phoneController,
                    label: 'Téléphone',
                    icon: Icons.phone_outlined,
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 4),
                  FilledButton.icon(
                    onPressed: widget.controller.isLoading
                        ? null
                        : () => widget.controller.updateProfile(
                            firstName: firstNameController.text.trim(),
                            lastName: lastNameController.text.trim(),
                            phone: phoneController.text.trim(),
                          ),
                    icon: const Icon(Icons.save_outlined),
                    label: Text(
                      widget.controller.isLoading
                          ? 'Enregistrement...'
                          : 'Enregistrer les modifications',
                    ),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size.fromHeight(52),
                      backgroundColor: AppColors.ink,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Sécurité',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.ink,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Changez votre mot de passe avec votre mot de passe actuel.',
                    style: TextStyle(color: AppColors.muted),
                  ),
                  const SizedBox(height: 14),
                  _ProfileField(
                    controller: currentPasswordController,
                    label: 'Mot de passe actuel',
                    icon: Icons.lock_outline,
                    obscureText: true,
                    textInputAction: TextInputAction.next,
                  ),
                  _ProfileField(
                    controller: newPasswordController,
                    label: 'Nouveau mot de passe',
                    icon: Icons.password_outlined,
                    obscureText: true,
                    textInputAction: TextInputAction.next,
                  ),
                  _ProfileField(
                    controller: confirmPasswordController,
                    label: 'Confirmer le nouveau mot de passe',
                    icon: Icons.verified_user_outlined,
                    obscureText: true,
                    textInputAction: TextInputAction.done,
                  ),
                  const SizedBox(height: 4),
                  FilledButton.icon(
                    onPressed: widget.controller.isLoading
                        ? null
                        : _changePassword,
                    icon: const Icon(Icons.lock_reset_outlined),
                    label: Text(
                      widget.controller.isLoading
                          ? 'Modification...'
                          : 'Modifier le mot de passe',
                    ),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size.fromHeight(52),
                      backgroundColor: AppColors.ink,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: widget.controller.logout,
            icon: const Icon(Icons.logout_outlined),
            label: const Text('Déconnexion'),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(50),
              foregroundColor: AppColors.ink,
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileStatCard extends StatelessWidget {
  const _ProfileStatCard({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: AppColors.gold),
            const SizedBox(height: 10),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppColors.muted),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: AppColors.ink,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileField extends StatelessWidget {
  const _ProfileField({
    required this.controller,
    required this.label,
    required this.icon,
    this.keyboardType,
    this.obscureText = false,
    this.textInputAction,
  });

  final TextEditingController controller;
  final String label;
  final IconData icon;
  final TextInputType? keyboardType;
  final bool obscureText;
  final TextInputAction? textInputAction;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscureText,
        textInputAction: textInputAction,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: AppColors.gold),
          filled: true,
          fillColor: AppColors.sand,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: AppColors.gold),
          ),
        ),
      ),
    );
  }
}

class _ClientListPage extends StatelessWidget {
  const _ClientListPage({
    required this.title,
    required this.subtitle,
    required this.child,
    this.controller,
  });

  final String title;
  final String subtitle;
  final Widget child;
  final ScrollController? controller;

  @override
  Widget build(BuildContext context) {
    return ListView(
      controller: controller,
      padding: EdgeInsets.zero,
      children: [
        _OritaHeader(title: title, subtitle: subtitle),
        Padding(padding: const EdgeInsets.all(20), child: child),
      ],
    );
  }
}
