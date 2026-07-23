import 'package:flutter/material.dart';

import '../../core/app_colors.dart';
import '../../shared/design_widgets.dart';
import '../app_controller.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key, required this.controller});

  final AppController controller;

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  final emailController = TextEditingController(
    text: 'client@benintours.local',
  );
  final passwordController = TextEditingController(text: 'admin123');
  final phoneController = TextEditingController();
  final codeController = TextEditingController();
  final resetPasswordController = TextEditingController();
  bool registerMode = false;
  bool resetMode = false;
  bool codeStep = false;
  bool rememberMe = true;
  bool termsAccepted = false;
  bool passwordVisible = false;
  bool resetPasswordVisible = false;

  @override
  void dispose() {
    firstNameController.dispose();
    lastNameController.dispose();
    emailController.dispose();
    passwordController.dispose();
    phoneController.dispose();
    codeController.dispose();
    resetPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SizedBox.expand(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final horizontalPadding = constraints.maxWidth > 520
                  ? (constraints.maxWidth - 430) / 2
                  : 20.0;

              return ListView(
                padding: EdgeInsets.fromLTRB(
                  horizontalPadding,
                  18,
                  horizontalPadding,
                  24,
                ),
                children: [
                  _AuthTopBar(
                    registerMode: registerMode,
                    resetMode: resetMode,
                    onBack: codeStep
                        ? () => setState(() => codeStep = false)
                        : null,
                    onModePressed: widget.controller.isLoading
                        ? null
                        : () {
                            setState(() {
                              registerMode = !registerMode;
                              resetMode = false;
                              codeStep = false;
                              codeController.clear();
                              resetPasswordController.clear();
                            });
                          },
                  ),
                  const SizedBox(height: 30),
                  const _AuthLogoHero(),
                  const SizedBox(height: 38),
                  if (registerMode && !codeStep) ...[
                    _Field(controller: firstNameController, label: 'Prénom'),
                    _Field(controller: lastNameController, label: 'Nom'),
                    _Field(controller: phoneController, label: 'Téléphone'),
                  ],
                  if (!codeStep)
                    _Field(controller: emailController, label: 'Email'),
                  if (!codeStep && !resetMode)
                    _Field(
                      controller: passwordController,
                      label: 'Mot de passe',
                      obscureText: !passwordVisible,
                      suffix: IconButton(
                        onPressed: () =>
                            setState(() => passwordVisible = !passwordVisible),
                        icon: Icon(
                          passwordVisible
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          color: AppColors.muted,
                        ),
                      ),
                    ),
                  if (!registerMode && !resetMode && !codeStep)
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: widget.controller.isLoading
                            ? null
                            : _openPasswordReset,
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.only(bottom: 8),
                          minimumSize: const Size(0, 0),
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: Text(
                          'Mot de passe oublié ?',
                          style: TextStyle(
                            color: AppColors.muted.withValues(alpha: 0.86),
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    ),
                  if (codeStep)
                    _Field(
                      controller: codeController,
                      label: 'Code de vérification',
                      keyboardType: TextInputType.number,
                    ),
                  if (resetMode && codeStep)
                    _Field(
                      controller: resetPasswordController,
                      label: 'Nouveau mot de passe',
                      obscureText: !resetPasswordVisible,
                      suffix: IconButton(
                        onPressed: () => setState(
                          () => resetPasswordVisible = !resetPasswordVisible,
                        ),
                        icon: Icon(
                          resetPasswordVisible
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          color: AppColors.muted,
                        ),
                      ),
                    ),
                  if (!codeStep && !resetMode) ...[
                    const SizedBox(height: 2),
                    if (registerMode)
                      _TermsRow(
                        value: termsAccepted,
                        onChanged: (value) =>
                            setState(() => termsAccepted = value),
                      )
                    else
                      _RememberRow(
                        value: rememberMe,
                        onChanged: (value) =>
                            setState(() => rememberMe = value),
                      ),
                  ],
                  if (widget.controller.errorMessage != null) ...[
                    const SizedBox(height: 12),
                    _ErrorBanner(message: widget.controller.errorMessage!),
                  ],
                  const SizedBox(height: 24),
                  SizedBox(
                    height: 58,
                    child: FilledButton(
                      onPressed: widget.controller.isLoading ? null : _submit,
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.black,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      child: Text(
                        _buttonLabel,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 56),
                  _AuthModeSwitch(
                    registerMode: registerMode,
                    resetMode: resetMode,
                    onPressed: widget.controller.isLoading
                        ? null
                        : () {
                            setState(() {
                              registerMode = resetMode ? false : !registerMode;
                              resetMode = false;
                              codeStep = false;
                              termsAccepted = false;
                              codeController.clear();
                              resetPasswordController.clear();
                            });
                          },
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  String get _buttonLabel {
    if (widget.controller.isLoading) {
      return 'Chargement...';
    }
    if (resetMode && codeStep) {
      return 'Réinitialiser le mot de passe';
    }
    if (resetMode) {
      return 'Recevoir le code';
    }
    if (codeStep) {
      return 'Valider le code';
    }
    return registerMode ? 'Créer le compte' : 'Connexion';
  }

  void _openPasswordReset() {
    setState(() {
      resetMode = true;
      registerMode = false;
      codeStep = false;
      codeController.clear();
      resetPasswordController.clear();
    });
  }

  Future<void> _submit() async {
    if (resetMode) {
      if (codeStep) {
        await widget.controller.resetPassword(
          code: codeController.text.trim(),
          newPassword: resetPasswordController.text,
        );
        if (!mounted) {
          return;
        }
        if (widget.controller.errorMessage == null) {
          passwordController.text = resetPasswordController.text;
          codeController.clear();
          resetPasswordController.clear();
          setState(() {
            resetMode = false;
            registerMode = false;
            codeStep = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Mot de passe réinitialisé. Vous pouvez vous connecter.',
              ),
            ),
          );
        }
        return;
      }

      await widget.controller.requestPasswordReset(
        email: emailController.text.trim(),
      );
      if (widget.controller.errorMessage == null) {
        setState(() => codeStep = true);
      }
      return;
    }

    if (codeStep) {
      await widget.controller.verifyCode(codeController.text.trim());
      return;
    }

    if (registerMode) {
      if (!termsAccepted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Vous devez accepter les conditions d’utilisation pour créer un compte.',
            ),
          ),
        );
        return;
      }

      await widget.controller.register(
        firstName: firstNameController.text.trim(),
        lastName: lastNameController.text.trim(),
        email: emailController.text.trim(),
        password: passwordController.text,
        phone: phoneController.text.trim(),
      );
    } else {
      await widget.controller.requestCode(
        email: emailController.text.trim(),
        password: passwordController.text,
      );
    }

    if (widget.controller.errorMessage == null) {
      setState(() => codeStep = true);
    }
  }
}

class _Field extends StatelessWidget {
  const _Field({
    required this.controller,
    required this.label,
    this.obscureText = false,
    this.keyboardType,
    this.suffix,
  });

  final TextEditingController controller;
  final String label;
  final bool obscureText;
  final TextInputType? keyboardType;
  final Widget? suffix;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.ink,
              fontSize: 15,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: controller,
            obscureText: obscureText,
            keyboardType: keyboardType,
            decoration: InputDecoration(
              hintText: _hintFor(label),
              suffixIcon: suffix,
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 22,
                vertical: 20,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(15),
                borderSide: BorderSide(
                  color: AppColors.ink.withValues(alpha: 0.12),
                  width: 1.2,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(15),
                borderSide: const BorderSide(color: AppColors.gold, width: 1.4),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(15),
                borderSide: const BorderSide(color: AppColors.danger),
              ),
              hintStyle: TextStyle(
                color: AppColors.muted.withValues(alpha: 0.66),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _hintFor(String label) {
    return switch (label) {
      'Email' => 'client@orita.local',
      'Mot de passe' => '••••••••••',
      'Code de vérification' => '123456',
      'Prénom' => 'Alex',
      'Nom' => 'Ganvo',
      'Téléphone' => '+229 97 12 34 56',
      _ => label,
    };
  }
}

class _AuthTopBar extends StatelessWidget {
  const _AuthTopBar({
    required this.registerMode,
    required this.resetMode,
    this.onBack,
    this.onModePressed,
  });

  final bool registerMode;
  final bool resetMode;
  final VoidCallback? onBack;
  final VoidCallback? onModePressed;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (onBack != null)
          IconButton(
            onPressed: onBack,
            icon: const Icon(Icons.arrow_back, color: AppColors.ink),
          ),
        Expanded(
          child: Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: resetMode ? onModePressed : null,
              child: Text(
                resetMode ? 'Connexion ?' : '',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: AppColors.muted.withValues(alpha: 0.86),
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _AuthLogoHero extends StatelessWidget {
  const _AuthLogoHero();

  @override
  Widget build(BuildContext context) {
    return Center(child: const BrandMark(size: 92));
  }
}

class _RememberRow extends StatelessWidget {
  const _RememberRow({required this.value, required this.onChanged});

  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(
          child: Text(
            'Se souvenir de moi',
            style: TextStyle(color: AppColors.ink, fontWeight: FontWeight.w800),
          ),
        ),
        Switch(
          value: value,
          onChanged: onChanged,
          activeThumbColor: Colors.white,
          activeTrackColor: AppColors.gold,
          inactiveThumbColor: Colors.white,
          inactiveTrackColor: AppColors.border,
        ),
      ],
    );
  }
}

class _TermsRow extends StatelessWidget {
  const _TermsRow({required this.value, required this.onChanged});

  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => onChanged(!value),
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Checkbox(
              value: value,
              onChanged: (checked) => onChanged(checked ?? false),
              activeColor: AppColors.gold,
              checkColor: Colors.black,
              side: BorderSide(
                color: AppColors.ink.withValues(alpha: 0.28),
                width: 1.4,
              ),
            ),
            const SizedBox(width: 4),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 11),
                child: RichText(
                  text: TextSpan(
                    style: const TextStyle(
                      color: AppColors.muted,
                      height: 1.35,
                      fontWeight: FontWeight.w700,
                    ),
                    children: const [
                      TextSpan(text: 'J’accepte les '),
                      TextSpan(
                        text: 'conditions d’utilisation',
                        style: TextStyle(
                          color: AppColors.ink,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      TextSpan(text: ' et la politique de confidentialité.'),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AuthModeSwitch extends StatelessWidget {
  const _AuthModeSwitch({
    required this.registerMode,
    required this.resetMode,
    required this.onPressed,
  });

  final bool registerMode;
  final bool resetMode;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Wrap(
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          Text(
            registerMode || resetMode
                ? 'Vous avez déjà un compte ? '
                : 'Pas de compte ? ',
            style: TextStyle(
              color: AppColors.muted.withValues(alpha: 0.72),
              fontWeight: FontWeight.w700,
            ),
          ),
          TextButton(
            onPressed: onPressed,
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: const Size(0, 0),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              registerMode || resetMode ? 'Connexion' : 'Inscription',
              style: const TextStyle(
                color: AppColors.ink,
                fontSize: 16,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.danger.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.danger.withValues(alpha: 0.18)),
      ),
      child: Text(
        message,
        style: const TextStyle(
          color: AppColors.danger,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
