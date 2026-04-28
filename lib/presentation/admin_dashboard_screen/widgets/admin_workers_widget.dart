import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../theme/app_theme.dart';
import '../../../widgets/custom_image_widget.dart';

class AdminWorkersWidget extends StatelessWidget {
  final List<Map<String, dynamic>> workers;

  const AdminWorkersWidget({super.key, required this.workers});

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
          ...List.generate(
            workers.length,
            (i) => _buildWorkerRow(workers[i], i),
          ),
          _buildViewAllButton(),
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
      child: Text(
        'Active Workers',
        style: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w800,
          color: AppTheme.onSurface,
        ),
      ),
    );
  }

  Widget _buildWorkerRow(Map<String, dynamic> worker, int index) {
    final percent = worker['completionPercent'] as int;
    final isLast = index == workers.length - 1;

    return Container(
      constraints: const BoxConstraints(minHeight: AppTheme.listRowMinHeight),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : const Border(
                bottom: BorderSide(color: Color(0xFFE5E7EB), width: 1.5),
              ),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.charcoal, width: 2.5),
            ),
            child: ClipOval(
              child: CustomImageWidget(
                imageUrl: worker['imageUrl'] as String,
                width: 48,
                height: 48,
                fit: BoxFit.cover,
                semanticLabel: worker['semanticLabel'] as String,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  worker['name'] as String,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.onSurface,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: Stack(
                        children: [
                          Container(
                            height: 10,
                            decoration: BoxDecoration(
                              color: AppTheme.surfaceContainerLow,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(
                                color: AppTheme.charcoal,
                                width: 1.5,
                              ),
                            ),
                          ),
                          FractionallySizedBox(
                            widthFactor: percent / 100,
                            child: Container(
                              height: 10,
                              decoration: BoxDecoration(
                                color: percent >= 70
                                    ? AppTheme.primaryGreen
                                    : percent >= 40
                                    ? AppTheme.warningAmber
                                    : AppTheme.alertRed,
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      '$percent%',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: percent >= 70
                            ? AppTheme.primaryGreen
                            : percent >= 40
                            ? AppTheme.warningAmber
                            : AppTheme.alertRed,
                        fontFeatures: const [FontFeature.tabularFigures()],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildViewAllButton() {
    return Container(
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppTheme.charcoal, width: 2)),
      ),
      child: InkWell(
        onTap: () {},
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(5),
          bottomRight: Radius.circular(5),
        ),
        child: Container(
          height: AppTheme.touchTarget,
          alignment: Alignment.center,
          child: Text(
            'VIEW ALL 24 WORKERS',
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: AppTheme.onSurface,
              letterSpacing: 0.5,
            ),
          ),
        ),
      ),
    );
  }
}
