import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../theme/app_theme.dart';
import '../../../widgets/status_badge_widget.dart';

class AdminLeaderboardWidget extends StatelessWidget {
  final List<Map<String, dynamic>> areas;

  const AdminLeaderboardWidget({super.key, required this.areas});

  @override
  Widget build(BuildContext context) {
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
          _buildHeader(),
          _buildTableHeader(),
          ...List.generate(areas.length, (i) => _buildAreaRow(areas[i], i)),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.charcoal, width: 2)),
      ),
      child: Row(
        children: [
          Text(
            'Kachra Collection Leaderboard',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppTheme.onSurface,
            ),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppTheme.charcoal, width: 2),
            ),
            child: Text(
              'Area Top Performers',
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppTheme.onSurface,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTableHeader() {
    return Container(
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      color: AppTheme.surfaceContainerLow,
      child: Row(
        children: [
          SizedBox(width: 44, child: Text('RANK', style: _headerStyle())),
          Expanded(flex: 3, child: Text('AREA NAME', style: _headerStyle())),
          Expanded(
            flex: 2,
            child: Text(
              'GEELA (KG)',
              style: _headerStyle(),
              textAlign: TextAlign.center,
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              'SOOKHA (KG)',
              style: _headerStyle(),
              textAlign: TextAlign.center,
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              'STATUS',
              style: _headerStyle(),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  TextStyle _headerStyle() => GoogleFonts.inter(
    fontSize: 11,
    fontWeight: FontWeight.w700,
    color: AppTheme.mutedText,
    letterSpacing: 0.06,
  );

  Widget _buildAreaRow(Map<String, dynamic> area, int index) {
    final isLast = index == areas.length - 1;
    final statusStr = area['status'] as String;
    final badgeStatus = statusStr == 'clear'
        ? BadgeStatus.clear
        : BadgeStatus.inProgress;

    return Container(
      constraints: const BoxConstraints(minHeight: AppTheme.listRowMinHeight),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : const Border(
                bottom: BorderSide(color: Color(0xFFE5E7EB), width: 1.5),
              ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          SizedBox(
            width: 44,
            child: Text(
              '0${area['rank']}',
              style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppTheme.onSurface,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  area['areaName'] as String,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.onSurface,
                  ),
                ),
                Text(
                  area['zone'] as String,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                    color: AppTheme.mutedText,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              '${area['geelaKg']}',
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppTheme.primaryGreen,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
              textAlign: TextAlign.center,
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              '${area['sookhaKg']}',
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppTheme.secondaryBlue,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
              textAlign: TextAlign.center,
            ),
          ),
          Expanded(
            flex: 2,
            child: Center(child: StatusBadgeWidget(status: badgeStatus)),
          ),
        ],
      ),
    );
  }
}
