import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../theme/app_theme.dart';
import '../../../routes/app_routes.dart';

class AdminSidebarWidget extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onNavChanged;
  final VoidCallback onExportReport;

  const AdminSidebarWidget({
    super.key,
    required this.selectedIndex,
    required this.onNavChanged,
    required this.onExportReport,
  });

  static const List<_NavItem> _navItems = [
    _NavItem(
      Icons.bar_chart_rounded,
      Icons.bar_chart_outlined,
      'Collection Stats',
    ),
    _NavItem(
      Icons.leaderboard_rounded,
      Icons.leaderboard_outlined,
      'Area Leaderboard',
    ),
    _NavItem(
      Icons.people_rounded,
      Icons.people_outline_rounded,
      'Worker Status',
    ),
    _NavItem(
      Icons.warning_amber_rounded,
      Icons.warning_amber_outlined,
      'Alerts Log',
    ),
    _NavItem(
      Icons.qr_code_scanner_rounded,
      Icons.qr_code_outlined,
      'Kachra Scan',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
      decoration: const BoxDecoration(
        color: Color(0xFF111827),
        border: Border(right: BorderSide(color: AppTheme.charcoal, width: 2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 8),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: _navItems.length,
              itemBuilder: (context, index) => _buildNavItem(context, index),
            ),
          ),
          _buildBottomSection(context),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFF374151), width: 1)),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppTheme.primaryGreen,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.white, width: 2),
            ),
            child: const Icon(
              Icons.recycling_rounded,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Sahi Bin',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primaryGreen,
                ),
              ),
              Text(
                'Sahi Hai! Admin',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF9CA3AF),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(BuildContext context, int index) {
    final item = _navItems[index];
    final isSelected = selectedIndex == index;

    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: InkWell(
        onTap: () {
          if (index == 4) {
            // Kachra Scan
            Navigator.pushNamed(context, AppRoutes.kachraScanScreen);
          } else {
            onNavChanged(index);
          }
        },
        borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
        splashColor: AppTheme.primaryGreen.withAlpha(51),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOutCubic,
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primaryGreen : Colors.transparent,
            borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
            border: isSelected
                ? Border.all(color: Colors.white.withAlpha(77), width: 1)
                : null,
          ),
          child: Row(
            children: [
              Icon(
                isSelected ? item.activeIcon : item.icon,
                color: isSelected ? Colors.white : const Color(0xFF9CA3AF),
                size: 22,
              ),
              const SizedBox(width: 12),
              Text(
                item.label,
                style: GoogleFonts.inter(
                  fontSize: 15,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected ? Colors.white : const Color(0xFF9CA3AF),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Color(0xFF374151), width: 1)),
      ),
      child: Column(
        children: [
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: onExportReport,
              icon: const Icon(
                Icons.download_rounded,
                color: Colors.white,
                size: 20,
              ),
              label: Text(
                'Export Report',
                style: GoogleFonts.inter(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.secondaryBlue,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
                  side: const BorderSide(color: Colors.white, width: 2),
                ),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NavItem {
  final IconData activeIcon;
  final IconData icon;
  final String label;
  const _NavItem(this.activeIcon, this.icon, this.label);
}
