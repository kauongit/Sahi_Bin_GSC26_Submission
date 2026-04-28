
import '../../core/app_export.dart';
import '../../services/firebase_service.dart';

class PuraaniListScreen extends StatefulWidget {
  const PuraaniListScreen({super.key});

  @override
  State<PuraaniListScreen> createState() => _PuraaniListScreenState();
}

class _PuraaniListScreenState extends State<PuraaniListScreen> {
  final _firestoreService = FirestoreService();
  List<Map<String, dynamic>> _scanHistory = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
    _firestoreService.scanHistoryStream.listen((history) {
      if (mounted) setState(() => _scanHistory = history);
    });
  }

  void _loadHistory() {
    setState(() {
      _scanHistory = _firestoreService.getScanHistory();
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      body: SafeArea(
        child: Column(
          children: [
            _buildAppBar(),
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: AppTheme.primaryGreen,
                      ),
                    )
                  : _scanHistory.isEmpty
                  ? _buildEmptyState()
                  : _buildHistoryList(),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomTabBar(),
    );
  }

  Widget _buildAppBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppTheme.charcoal, width: 2)),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: const Icon(
              Icons.arrow_back_rounded,
              color: AppTheme.onSurface,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              'Puraani List',
              style: GoogleFonts.inter(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppTheme.onSurface,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainerLow,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: AppTheme.charcoal, width: 2),
            ),
            child: Text(
              '${_scanHistory.length} Scans',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppTheme.onSurface,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainerLow,
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.charcoal, width: 2),
            ),
            child: const Icon(
              Icons.history_rounded,
              color: AppTheme.mutedText,
              size: 40,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Koi scan nahi mila',
            style: GoogleFonts.inter(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: AppTheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Pehle Scan tab mein jaake\nHousehold ID scan karein.',
            style: GoogleFonts.inter(fontSize: 15, color: AppTheme.mutedText),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGreen,
              minimumSize: const Size(180, 52),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: const BorderSide(color: AppTheme.charcoal, width: 2),
              ),
            ),
            onPressed: () => Navigator.pop(context),
            icon: const Icon(
              Icons.qr_code_scanner_rounded,
              color: Colors.white,
            ),
            label: Text(
              'Scan Karein',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryList() {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _scanHistory.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (ctx, i) => _buildScanCard(_scanHistory[i]),
    );
  }

  Widget _buildScanCard(Map<String, dynamic> scan) {
    final status = scan['status'] as String? ?? 'pending_review';
    final isReviewed = status == 'reviewed';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.charcoal, width: 2),
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: isReviewed
                  ? AppTheme.primaryGreen
                  : AppTheme.secondaryBlue,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              isReviewed ? Icons.check_rounded : Icons.qr_code_rounded,
              color: Colors.white,
              size: 28,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  scan['householdId'] as String? ?? 'Unknown ID',
                  style: GoogleFonts.robotoMono(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.onSurface,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  scan['location'] as String? ?? 'Unknown Location',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: AppTheme.mutedText,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  scan['timestamp'] as String? ?? '',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.mutedText,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: isReviewed
                  ? const Color(0xFFD1FAE5)
                  : const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                color: isReviewed
                    ? AppTheme.primaryGreen
                    : AppTheme.secondaryBlue,
                width: 1.5,
              ),
            ),
            child: Text(
              isReviewed ? 'Reviewed' : 'Pending',
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: isReviewed
                    ? AppTheme.primaryGreen
                    : AppTheme.secondaryBlue,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomTabBar() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppTheme.charcoal, width: 2)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 72,
          child: Row(
            children: [
              _buildTabItem(0, Icons.home_rounded, 'Dashboard', false),
              _buildTabItem(1, Icons.qr_code_scanner_rounded, 'Scan', false),
              _buildTabItem(2, Icons.history_rounded, 'Puraani List', true),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabItem(int index, IconData icon, String label, bool isActive) {
    return Expanded(
      child: GestureDetector(
        onTap: () {
          if (index == 0) {
            Navigator.pushNamedAndRemoveUntil(
              context,
              AppRoutes.adminDashboardScreen,
              (route) => false,
            );
          } else if (index == 1) {
            Navigator.pop(context);
          }
        },
        child: Container(
          color: isActive ? AppTheme.primaryGreen : Colors.white,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                color: isActive ? Colors.white : AppTheme.onSurface,
                size: 26,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: isActive ? Colors.white : AppTheme.onSurface,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
