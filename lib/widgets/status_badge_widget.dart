import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

enum BadgeStatus { clear, inProgress, alert, active, resolved }

class StatusBadgeWidget extends StatelessWidget {
  final BadgeStatus status;
  final String? customLabel;

  const StatusBadgeWidget({super.key, required this.status, this.customLabel});

  @override
  Widget build(BuildContext context) {
    final config = _getConfig();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: config.bgColor,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: config.borderColor, width: 2.5),
      ),
      child: Text(
        customLabel ?? config.label,
        style: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: config.textColor,
          letterSpacing: 0.04,
        ),
      ),
    );
  }

  _BadgeConfig _getConfig() {
    switch (status) {
      case BadgeStatus.clear:
        return _BadgeConfig(
          label: 'CLEAR',
          bgColor: const Color(0xFFECFDF5),
          borderColor: const Color(0xFF059669),
          textColor: const Color(0xFF059669),
        );
      case BadgeStatus.inProgress:
        return _BadgeConfig(
          label: 'IN PROGRESS',
          bgColor: const Color(0xFFFFFBEB),
          borderColor: const Color(0xFFD97706),
          textColor: const Color(0xFFD97706),
        );
      case BadgeStatus.alert:
        return _BadgeConfig(
          label: 'ALERT',
          bgColor: const Color(0xFFFEF2F2),
          borderColor: const Color(0xFFDC2626),
          textColor: const Color(0xFFDC2626),
        );
      case BadgeStatus.active:
        return _BadgeConfig(
          label: 'ACTIVE',
          bgColor: const Color(0xFFEFF6FF),
          borderColor: const Color(0xFF2563EB),
          textColor: const Color(0xFF2563EB),
        );
      case BadgeStatus.resolved:
        return _BadgeConfig(
          label: 'RESOLVED',
          bgColor: const Color(0xFFF3F4F6),
          borderColor: const Color(0xFF6B7280),
          textColor: const Color(0xFF6B7280),
        );
    }
  }
}

class _BadgeConfig {
  final String label;
  final Color bgColor;
  final Color borderColor;
  final Color textColor;
  _BadgeConfig({
    required this.label,
    required this.bgColor,
    required this.borderColor,
    required this.textColor,
  });
}
