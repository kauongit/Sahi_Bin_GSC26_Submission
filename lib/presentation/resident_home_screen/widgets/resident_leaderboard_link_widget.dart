import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../theme/app_theme.dart';

class ResidentLeaderboardLinkWidget extends StatefulWidget {
  const ResidentLeaderboardLinkWidget({super.key});

  @override
  State<ResidentLeaderboardLinkWidget> createState() =>
      _ResidentLeaderboardLinkWidgetState();
}

class _ResidentLeaderboardLinkWidgetState
    extends State<ResidentLeaderboardLinkWidget> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) => setState(() => _pressed = false),
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        curve: Curves.easeOutCubic,
        transform: _pressed
            ? (Matrix4.identity()..translate(2.0, 2.0))
            : Matrix4.identity(),
        height: AppTheme.listRowMinHeight,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
          border: Border.all(
            color: AppTheme.charcoal,
            width: AppTheme.borderWidth,
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppTheme.charcoal, width: 2),
              ),
              child: const Icon(
                Icons.bar_chart_rounded,
                color: AppTheme.alertRed,
                size: 22,
              ),
            ),
            const SizedBox(width: 16),
            Text(
              'Sabka Score',
              style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppTheme.onSurface,
              ),
            ),
            const Spacer(),
            const Icon(
              Icons.arrow_forward_rounded,
              color: AppTheme.onSurface,
              size: 26,
            ),
          ],
        ),
      ),
    );
  }
}
