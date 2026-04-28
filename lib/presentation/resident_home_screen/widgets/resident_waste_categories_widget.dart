import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../theme/app_theme.dart';

class ResidentWasteCategoriesWidget extends StatelessWidget {
  const ResidentWasteCategoriesWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _WasteCategoryCard(
            label: 'Geela\nKachra',
            icon: Icons.eco_rounded,
            backgroundColor: AppTheme.primaryGreen,
            onTap: () {},
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _WasteCategoryCard(
            label: 'Sookha\nKachra',
            icon: Icons.recycling_rounded,
            backgroundColor: AppTheme.secondaryBlue,
            onTap: () {},
          ),
        ),
      ],
    );
  }
}

class _WasteCategoryCard extends StatefulWidget {
  final String label;
  final IconData icon;
  final Color backgroundColor;
  final VoidCallback onTap;

  const _WasteCategoryCard({
    required this.label,
    required this.icon,
    required this.backgroundColor,
    required this.onTap,
  });

  @override
  State<_WasteCategoryCard> createState() => _WasteCategoryCardState();
}

class _WasteCategoryCardState extends State<_WasteCategoryCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
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
        height: 160,
        decoration: BoxDecoration(
          color: widget.backgroundColor,
          borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
          border: Border.all(
            color: AppTheme.charcoal,
            width: AppTheme.borderWidth,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(widget.icon, color: Colors.white, size: 52),
            const SizedBox(height: 12),
            Text(
              widget.label,
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                height: 1.2,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
