import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../theme/app_theme.dart';

class AdminMetricCardsWidget extends StatelessWidget {
  final Map<String, dynamic> stats;

  const AdminMetricCardsWidget({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.width >= 600;

    if (isTablet) {
      return Row(
        children: [
          Expanded(child: _buildGeelaCard()),
          const SizedBox(width: 16),
          Expanded(child: _buildSookhaCard()),
          const SizedBox(width: 16),
          Expanded(child: _buildSegregationCard()),
        ],
      );
    }

    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _buildGeelaCard()),
            const SizedBox(width: 12),
            Expanded(child: _buildSookhaCard()),
          ],
        ),
        const SizedBox(height: 12),
        _buildSegregationCard(),
      ],
    );
  }

  Widget _buildGeelaCard() {
    return _MetricCard(
      label: 'TOTAL GEELA KACHRA',
      sublabel: 'Wet Waste this week',
      value:
          '${(stats['geelaKachra'] as int).toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')} kg',
      trend: stats['geelaTrend'] as String,
      isTrendPositive: stats['geelaPositive'] as bool,
      accentColor: AppTheme.primaryGreen,
    );
  }

  Widget _buildSookhaCard() {
    return _MetricCard(
      label: 'TOTAL SOOKHA KACHRA',
      sublabel: 'Dry Waste this week',
      value:
          '${(stats['sookhaKachra'] as int).toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')} kg',
      trend: stats['sookhaTrend'] as String,
      isTrendPositive: stats['sookhaPositive'] as bool,
      accentColor: AppTheme.secondaryBlue,
    );
  }

  Widget _buildSegregationCard() {
    final percent = stats['segregationPercent'] as double;
    return Container(
      padding: const EdgeInsets.all(16),
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
          Text(
            'SAHI SEGREGATION %',
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppTheme.mutedText,
              letterSpacing: 0.08,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(
                '${percent.toStringAsFixed(1)}%',
                style: GoogleFonts.inter(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primaryGreen,
                  fontFeatures: const [FontFeature.tabularFigures()],
                ),
              ),
              const Spacer(),
            ],
          ),
          const SizedBox(height: 10),
          Stack(
            children: [
              Container(
                height: 14,
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.charcoal, width: 2),
                ),
              ),
              FractionallySizedBox(
                widthFactor: percent / 100,
                child: Container(
                  height: 14,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryGreen,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Efficiency Rating: Excellent!',
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppTheme.primaryGreen,
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String label;
  final String sublabel;
  final String value;
  final String trend;
  final bool isTrendPositive;
  final Color accentColor;

  const _MetricCard({
    required this.label,
    required this.sublabel,
    required this.value,
    required this.trend,
    required this.isTrendPositive,
    required this.accentColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
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
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppTheme.mutedText,
              letterSpacing: 0.06,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: accentColor,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(
                isTrendPositive
                    ? Icons.trending_up_rounded
                    : Icons.trending_down_rounded,
                size: 16,
                color: isTrendPositive
                    ? AppTheme.primaryGreen
                    : AppTheme.alertRed,
              ),
              const SizedBox(width: 4),
              Text(
                trend,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: isTrendPositive
                      ? AppTheme.primaryGreen
                      : AppTheme.alertRed,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            sublabel,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w400,
              color: AppTheme.mutedText,
            ),
          ),
        ],
      ),
    );
  }
}
