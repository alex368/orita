import 'package:flutter/material.dart';

import '../core/app_colors.dart';

class BrandHeader extends StatelessWidget {
  const BrandHeader({
    super.key,
    required this.title,
    required this.subtitle,
    this.trailing,
  });

  final String title;
  final String subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 22),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.black, Color(0xFF211506), AppColors.gold],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          stops: [0, 0.66, 1],
        ),
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(30)),
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const BrandMark(),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: const Color(0xFFFFF6DF).withValues(alpha: 0.84),
                    ),
                  ),
                ],
              ),
            ),
            ?trailing,
          ],
        ),
      ),
    );
  }
}

class BrandMark extends StatelessWidget {
  const BrandMark({super.key, this.size = 48});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.black,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.gold.withValues(alpha: 0.42)),
        boxShadow: [
          BoxShadow(
            color: AppColors.gold.withValues(alpha: 0.16),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(11),
        child: Image.asset(
          'assets/brand/orita-icon.jpg',
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (_, _, _) => const Text(
            'OR',
            style: TextStyle(
              color: AppColors.gold,
              fontWeight: FontWeight.w900,
              fontSize: 16,
            ),
          ),
        ),
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle({super.key, required this.title, this.action});

  final String title;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 8),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
                color: AppColors.ink,
              ),
            ),
          ),
          ?action,
        ],
      ),
    );
  }
}

class MetricCard extends StatelessWidget {
  const MetricCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: AppColors.gold),
            const SizedBox(height: 16),
            Text(label, style: const TextStyle(color: AppColors.muted)),
            const SizedBox(height: 4),
            Text(
              value,
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900),
            ),
          ],
        ),
      ),
    );
  }
}

class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final color = switch (label.toLowerCase()) {
      String value when value.contains('confirm') => AppColors.success,
      String value
          when value.contains('pending') || value.contains('attente') =>
        AppColors.warning,
      String value when value.contains('refus') || value.contains('annul') =>
        AppColors.danger,
      _ => AppColors.gold,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w700,
          fontSize: 12,
        ),
      ),
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.icon, required this.message});

  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(22),
        child: Row(
          children: [
            Icon(icon, color: AppColors.muted),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: AppColors.muted),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class OritaNavItem {
  const OritaNavItem({required this.label, required this.icon});

  final String label;
  final IconData icon;
}

class OritaBottomNav extends StatelessWidget {
  const OritaBottomNav({
    super.key,
    required this.items,
    required this.selectedIndex,
    required this.onSelected,
    this.highlightIndex,
  });

  final List<OritaNavItem> items;
  final int selectedIndex;
  final ValueChanged<int> onSelected;
  final int? highlightIndex;

  @override
  Widget build(BuildContext context) {
    final effectiveHighlight =
        highlightIndex ?? (items.length >= 3 ? items.length ~/ 2 : -1);

    return SafeArea(
      top: false,
      child: Container(
        margin: const EdgeInsets.fromLTRB(14, 8, 14, 12),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: AppColors.ink.withValues(alpha: 0.06)),
          boxShadow: [
            BoxShadow(
              color: AppColors.ink.withValues(alpha: 0.10),
              blurRadius: 26,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Row(
          children: [
            for (var index = 0; index < items.length; index++)
              Expanded(
                flex: index == effectiveHighlight ? 13 : 10,
                child: _OritaBottomNavButton(
                  item: items[index],
                  selected: selectedIndex == index,
                  highlighted: index == effectiveHighlight,
                  onTap: () => onSelected(index),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _OritaBottomNavButton extends StatelessWidget {
  const _OritaBottomNavButton({
    required this.item,
    required this.selected,
    required this.highlighted,
    required this.onTap,
  });

  final OritaNavItem item;
  final bool selected;
  final bool highlighted;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final activeColor = highlighted ? Colors.white : AppColors.black;
    final inactiveColor = AppColors.ink.withValues(alpha: 0.72);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(highlighted ? 24 : 18),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 2),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              curve: Curves.easeOutCubic,
              width: highlighted ? 58 : 42,
              height: highlighted ? 58 : 36,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: highlighted
                    ? AppColors.black
                    : selected
                    ? AppColors.goldSoft
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(highlighted ? 23 : 16),
                border: highlighted
                    ? Border.all(color: AppColors.gold.withValues(alpha: 0.40))
                    : null,
                boxShadow: highlighted
                    ? [
                        BoxShadow(
                          color: AppColors.black.withValues(alpha: 0.18),
                          blurRadius: 18,
                          offset: const Offset(0, 8),
                        ),
                      ]
                    : null,
              ),
              child: Icon(
                item.icon,
                size: highlighted ? 30 : 25,
                color: selected || highlighted ? activeColor : inactiveColor,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              item.label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: selected ? AppColors.black : inactiveColor,
                fontSize: highlighted ? 10 : 11,
                fontWeight: selected ? FontWeight.w900 : FontWeight.w700,
                height: 1.05,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
