import 'package:flutter/material.dart';

import 'core/api_client.dart';
import 'core/api_config.dart';
import 'core/app_colors.dart';
import 'core/session_store.dart';
import 'data/benin_tours_repository.dart';
import 'features/app_controller.dart';
import 'features/auth/auth_screen.dart';
import 'features/client/client_home_screen.dart';
import 'features/provider_space/provider_home_screen.dart';
import 'shared/design_widgets.dart';

void main() {
  runApp(const BeninToursApp());
}

class BeninToursApp extends StatefulWidget {
  const BeninToursApp({super.key});

  @override
  State<BeninToursApp> createState() => _BeninToursAppState();
}

class _BeninToursAppState extends State<BeninToursApp> {
  late final AppController controller;

  @override
  void initState() {
    super.initState();
    final config = ApiConfig.fromEnvironment();
    controller = AppController(
      repository: BeninToursRepository(api: ApiClient(config: config)),
      sessionStore: SessionStore(),
    )..restoreSession();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return MaterialApp(
          title: 'orita',
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
            colorScheme: ColorScheme.fromSeed(
              seedColor: AppColors.ink,
              primary: AppColors.ink,
              secondary: AppColors.gold,
              surface: AppColors.surface,
            ),
            scaffoldBackgroundColor: AppColors.sand,
            useMaterial3: true,
            fontFamily: 'Roboto',
            cardTheme: CardThemeData(
              elevation: 0,
              color: AppColors.surface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: const BorderSide(color: AppColors.border),
              ),
            ),
            filledButtonTheme: FilledButtonThemeData(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.gold,
                foregroundColor: AppColors.ink,
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            datePickerTheme: DatePickerThemeData(
              backgroundColor: AppColors.surface,
              surfaceTintColor: Colors.transparent,
              elevation: 18,
              shadowColor: Colors.black.withValues(alpha: 0.18),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
                side: const BorderSide(color: AppColors.border),
              ),
              headerBackgroundColor: AppColors.black,
              headerForegroundColor: Colors.white,
              dividerColor: AppColors.border,
              dayForegroundColor: WidgetStateProperty.resolveWith((states) {
                if (states.contains(WidgetState.disabled)) {
                  return AppColors.muted.withValues(alpha: 0.36);
                }
                if (states.contains(WidgetState.selected)) {
                  return Colors.white;
                }
                return AppColors.ink;
              }),
              dayBackgroundColor: WidgetStateProperty.resolveWith((states) {
                if (states.contains(WidgetState.selected)) {
                  return AppColors.black;
                }
                return null;
              }),
              todayForegroundColor: WidgetStateProperty.resolveWith((states) {
                if (states.contains(WidgetState.selected)) {
                  return Colors.white;
                }
                return AppColors.gold;
              }),
              todayBorder: const BorderSide(color: AppColors.gold, width: 1.4),
              rangePickerBackgroundColor: AppColors.surface,
              rangePickerSurfaceTintColor: Colors.transparent,
              rangePickerHeaderBackgroundColor: AppColors.black,
              rangePickerHeaderForegroundColor: Colors.white,
              rangeSelectionBackgroundColor: AppColors.goldSoft,
              rangeSelectionOverlayColor: WidgetStateProperty.all(
                AppColors.gold.withValues(alpha: 0.12),
              ),
              dayOverlayColor: WidgetStateProperty.all(
                AppColors.gold.withValues(alpha: 0.12),
              ),
            ),
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(
                foregroundColor: AppColors.ink,
                textStyle: const TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
          ),
          home: _SplashGate(controller: controller),
        );
      },
    );
  }
}

class _SplashGate extends StatefulWidget {
  const _SplashGate({required this.controller});

  final AppController controller;

  @override
  State<_SplashGate> createState() => _SplashGateState();
}

class _SplashGateState extends State<_SplashGate> {
  bool _minimumSplashElapsed = false;

  @override
  void initState() {
    super.initState();
    Future<void>.delayed(const Duration(milliseconds: 1400), () {
      if (mounted) {
        setState(() => _minimumSplashElapsed = true);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final showSplash = widget.controller.isBooting || !_minimumSplashElapsed;

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 420),
      switchInCurve: Curves.easeOutCubic,
      switchOutCurve: Curves.easeInCubic,
      child: showSplash
          ? const OritaSplashScreen(key: ValueKey('orita-splash'))
          : _HomeGate(
              key: const ValueKey('orita-home'),
              controller: widget.controller,
            ),
    );
  }
}

class OritaSplashScreen extends StatelessWidget {
  const OritaSplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: AppColors.black,
      body: SafeArea(child: Center(child: _SplashBrand())),
    );
  }
}

class _SplashBrand extends StatelessWidget {
  const _SplashBrand();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 118,
          height: 118,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.black,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: AppColors.gold.withValues(alpha: 0.42)),
            boxShadow: [
              BoxShadow(
                color: AppColors.gold.withValues(alpha: 0.22),
                blurRadius: 36,
                spreadRadius: 2,
                offset: const Offset(0, 18),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Image.asset(
              'assets/brand/orita-icon.jpg',
              fit: BoxFit.cover,
            ),
          ),
        ),
        const SizedBox(height: 24),
        const Text(
          'ORITA',
          style: TextStyle(
            color: AppColors.gold,
            fontSize: 28,
            fontWeight: FontWeight.w900,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Voyage, guides et services',
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.72),
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 30),
        SizedBox(
          width: 132,
          child: LinearProgressIndicator(
            minHeight: 3,
            color: AppColors.gold,
            backgroundColor: Colors.white.withValues(alpha: 0.12),
            borderRadius: const BorderRadius.all(Radius.circular(999)),
          ),
        ),
      ],
    );
  }
}

class _HomeGate extends StatelessWidget {
  const _HomeGate({super.key, required this.controller});

  final AppController controller;

  @override
  Widget build(BuildContext context) {
    if (controller.isBooting) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (!controller.isAuthenticated) {
      return AuthScreen(controller: controller);
    }

    return RoleShell(controller: controller);
  }
}

class RoleShell extends StatefulWidget {
  const RoleShell({super.key, required this.controller});

  final AppController controller;

  @override
  State<RoleShell> createState() => _RoleShellState();
}

class _RoleShellState extends State<RoleShell> {
  int selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final tabs = <_RoleTab>[
      _RoleTab(
        label: 'Client',
        icon: Icons.person_outline,
        screen: ClientHomeScreen(controller: widget.controller),
      ),
      if (widget.controller.hasProviderAccess)
        _RoleTab(
          label: widget.controller.providerLabel,
          icon: Icons.badge_outlined,
          screen: ProviderHomeScreen(controller: widget.controller),
        ),
    ];

    if (tabs.length == 1) {
      selectedIndex = 0;
      return tabs.first.screen;
    }

    final currentIndex = selectedIndex.clamp(0, tabs.length - 1);

    return Scaffold(
      body: tabs[currentIndex].screen,
      bottomNavigationBar: OritaBottomNav(
        items: [
          for (final tab in tabs)
            OritaNavItem(label: tab.label, icon: tab.icon),
        ],
        selectedIndex: currentIndex,
        onSelected: (index) => setState(() => selectedIndex = index),
        highlightIndex: -1,
      ),
    );
  }
}

class _RoleTab {
  const _RoleTab({
    required this.label,
    required this.icon,
    required this.screen,
  });

  final String label;
  final IconData icon;
  final Widget screen;
}
