import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../theme/app_theme.dart';

class ResidentGreenScoreWidget extends StatefulWidget {
  final Map<String, dynamic> data;

  const ResidentGreenScoreWidget({super.key, required this.data});

  @override
  State<ResidentGreenScoreWidget> createState() =>
      _ResidentGreenScoreWidgetState();
}

class _ResidentGreenScoreWidgetState extends State<ResidentGreenScoreWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _progressController;
  late Animation<double> _progressAnimation;

  @override
  void initState() {
    super.initState();
    final score = widget.data['greenScore'] as int;
    final max = widget.data['maxScore'] as int;

    _progressController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _progressAnimation = Tween<double>(begin: 0, end: score / max).animate(
      CurvedAnimation(parent: _progressController, curve: Curves.easeOutCubic),
    );

    _progressController.forward();
  }

  @override
  void dispose() {
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final score = widget.data['greenScore'] as int;
    final message = widget.data['scoreMessage'] as String;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.primaryGreen,
        borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
        border: Border.all(
          color: AppTheme.charcoal,
          width: AppTheme.borderWidth,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Aapka Green Score:',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const Spacer(),
              Text(
                '$score',
                style: GoogleFonts.inter(
                  fontSize: 40,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  fontFeatures: const [FontFeature.tabularFigures()],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          AnimatedBuilder(
            animation: _progressAnimation,
            builder: (context, child) {
              return Stack(
                children: [
                  Container(
                    height: 20,
                    decoration: BoxDecoration(
                      color: const Color(0xFF004D33),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                  FractionallySizedBox(
                    widthFactor: _progressAnimation.value,
                    child: Container(
                      height: 20,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 12),
          Text(
            message,
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}
