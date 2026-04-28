import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../theme/app_theme.dart';

class AdminAlertsWidget extends StatelessWidget {
  final List<Map<String, dynamic>> alerts;
  final ValueChanged<String> onMarkResolved;

  const AdminAlertsWidget({
    super.key,
    required this.alerts,
    required this.onMarkResolved,
  });

  @override
  Widget build(BuildContext context) {
    final activeAlerts = alerts.where((a) => !(a['resolved'] as bool)).toList();

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
        border: Border.all(
          color: AppTheme.charcoal,
          width: AppTheme.borderWidth,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildAlertsHeader(activeAlerts.length),
          if (activeAlerts.isEmpty)
            _buildNoAlerts()
          else
            ...List.generate(
              activeAlerts.length,
              (i) => _buildAlertItem(activeAlerts[i], i, activeAlerts.length),
            ),
        ],
      ),
    );
  }

  Widget _buildAlertsHeader(int count) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: AppTheme.alertRed,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(5),
          topRight: Radius.circular(5),
        ),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_rounded, color: Colors.white, size: 22),
          const SizedBox(width: 8),
          Text(
            'Mixed Waste!',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
          const Spacer(),
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 1.5),
            ),
            child: Center(
              child: Text(
                '$count',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.alertRed,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoAlerts() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const Icon(
            Icons.check_circle_rounded,
            color: AppTheme.primaryGreen,
            size: 40,
          ),
          const SizedBox(height: 8),
          Text(
            'Koi alert nahi! Sahi Hai!',
            style: GoogleFonts.inter(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppTheme.primaryGreen,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildAlertItem(Map<String, dynamic> alert, int index, int total) {
    final isLast = index == total - 1;
    return Dismissible(
      key: Key(alert['id'] as String),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: AppTheme.primaryGreen,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_rounded, color: Colors.white, size: 24),
            const SizedBox(height: 4),
            Text(
              'Resolve',
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
      confirmDismiss: (direction) async {
        onMarkResolved(alert['id'] as String);
        return false;
      },
      child: Container(
        constraints: const BoxConstraints(minHeight: AppTheme.listRowMinHeight),
        decoration: BoxDecoration(
          color: const Color(0xFFFEF2F2),
          border: isLast
              ? null
              : const Border(
                  bottom: BorderSide(color: Color(0xFFFECACA), width: 1.5),
                ),
        ),
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppTheme.alertRed,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Icon(
                Icons.close_rounded,
                color: Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    alert['location'] as String,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    alert['message'] as String,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w400,
                      color: AppTheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    alert['timestamp'] as String,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.mutedText,
                      letterSpacing: 0.04,
                    ),
                  ),
                ],
              ),
            ),
            GestureDetector(
              onTap: () => onMarkResolved(alert['id'] as String),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.primaryGreen,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppTheme.charcoal, width: 1.5),
                ),
                child: Text(
                  'Resolve',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
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
