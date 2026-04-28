import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../theme/app_theme.dart';

class AdminActionsWidget extends StatelessWidget {
  final ValueChanged<String> onAction;

  const AdminActionsWidget({super.key, required this.onAction});

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.width >= 600;

    if (isTablet) {
      return Row(
        children: [
          Expanded(
            child: _ActionButton(
              label: 'Truck Bulayein?',
              icon: Icons.local_shipping_rounded,
              color: AppTheme.primaryGreen,
              onTap: () => onAction('truck'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _ActionButton(
              label: 'Announcement Karo',
              icon: Icons.campaign_rounded,
              color: AppTheme.secondaryBlue,
              onTap: () => onAction('announcement'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _ActionButton(
              label: 'Naya Area?',
              icon: Icons.map_rounded,
              color: Colors.white,
              textColor: AppTheme.onSurface,
              onTap: () => onAction('area'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _ActionButton(
              label: 'Settings Section',
              icon: Icons.settings_rounded,
              color: Colors.white,
              textColor: AppTheme.onSurface,
              onTap: () => onAction('settings'),
            ),
          ),
        ],
      );
    }

    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _ActionButton(
                label: 'Truck Bulayein?',
                icon: Icons.local_shipping_rounded,
                color: AppTheme.primaryGreen,
                onTap: () => onAction('truck'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ActionButton(
                label: 'Announcement Karo',
                icon: Icons.campaign_rounded,
                color: AppTheme.secondaryBlue,
                onTap: () => onAction('announcement'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _ActionButton(
                label: 'Naya Area?',
                icon: Icons.map_rounded,
                color: Colors.white,
                textColor: AppTheme.onSurface,
                onTap: () => onAction('area'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ActionButton(
                label: 'Settings Section',
                icon: Icons.settings_rounded,
                color: Colors.white,
                textColor: AppTheme.onSurface,
                onTap: () => onAction('settings'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _ActionButton extends StatefulWidget {
  final String label;
  final IconData icon;
  final Color color;
  final Color? textColor;
  final VoidCallback onTap;

  const _ActionButton({
    required this.label,
    required this.icon,
    required this.color,
    this.textColor,
    required this.onTap,
  });

  @override
  State<_ActionButton> createState() => _ActionButtonState();
}

class _ActionButtonState extends State<_ActionButton> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final effectiveTextColor = widget.textColor ?? Colors.white;

    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        curve: Curves.easeOutCubic,
        transform: _pressed
            ? (Matrix4.identity()..translate(2.0, 2.0))
            : Matrix4.identity(),
        height: AppTheme.buttonHeight,
        decoration: BoxDecoration(
          color: widget.color,
          borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
          border: Border.all(
            color: AppTheme.charcoal,
            width: AppTheme.borderWidth,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(widget.icon, color: effectiveTextColor, size: 26),
            const SizedBox(height: 4),
            Text(
              widget.label,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: effectiveTextColor,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
