import '../../core/app_export.dart';
import '../../services/firebase_service.dart';
import './widgets/admin_actions_widget.dart';
import './widgets/admin_alerts_widget.dart';
import './widgets/admin_leaderboard_widget.dart';
import './widgets/admin_metric_cards_widget.dart';
import './widgets/admin_sidebar_widget.dart';
import './widgets/admin_workers_widget.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen>
    with TickerProviderStateMixin {
  int _selectedNavIndex = 0;
  bool _isLoading = true;

  final _firestoreService = FirestoreService();
  final _authService = FirebaseAuthService();

  late AnimationController _contentController;
  late Animation<double> _contentFade;

  Map<String, dynamic> _statsData = {};
  List<Map<String, dynamic>> _areasMaps = [];
  List<Map<String, dynamic>> _alertsMaps = [];
  List<Map<String, dynamic>> _workersMaps = [];

  @override
  void initState() {
    super.initState();
    _contentController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _contentFade = CurvedAnimation(
      parent: _contentController,
      curve: Curves.easeOutCubic,
    );
    _loadInitialData();
    _setupRealtimeListeners();
  }

  void _loadInitialData() {
    setState(() {
      _statsData = _firestoreService.getStats();
      _areasMaps = _firestoreService.getAreas();
      _alertsMaps = _firestoreService.getAlerts();
      _workersMaps = _firestoreService.getWorkers();
    });
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        setState(() => _isLoading = false);
        _contentController.forward();
      }
    });
  }

  void _setupRealtimeListeners() {
    _firestoreService.alertsStream.listen((alerts) {
      if (mounted) setState(() => _alertsMaps = alerts);
    });
    _firestoreService.areasStream.listen((areas) {
      if (mounted) setState(() => _areasMaps = areas);
    });
    _firestoreService.workersStream.listen((workers) {
      if (mounted) setState(() => _workersMaps = workers);
    });
  }

  @override
  void dispose() {
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _markAlertResolved(String alertId) async {
    await _firestoreService.markAlertResolved(alertId);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppTheme.primaryGreen,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: const BorderSide(color: AppTheme.charcoal, width: 2),
          ),
          content: Text(
            'Alert marked as resolved. Sahi Hai!',
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  void _handleAction(String action) {
    switch (action) {
      case 'truck':
        _showTruckDispatchDialog();
        break;
      case 'announcement':
        _showAnnouncementDialog();
        break;
      case 'area':
        _showNewAreaDialog();
        break;
      case 'export':
        _exportReport();
        break;
      case 'settings':
        _showSettingsDialog();
        break;
    }
  }

  void _showTruckDispatchDialog() {
    String selectedArea = _areasMaps.isNotEmpty
        ? _areasMaps[0]['areaName'] as String
        : '';
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
            side: const BorderSide(color: AppTheme.charcoal, width: 3),
          ),
          title: Row(
            children: [
              const Icon(
                Icons.local_shipping_rounded,
                color: AppTheme.primaryGreen,
                size: 28,
              ),
              const SizedBox(width: 10),
              Text(
                'Truck Bulayein?',
                style: GoogleFonts.inter(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Area select karein:',
                style: GoogleFonts.inter(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.charcoal, width: 2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: selectedArea.isEmpty ? null : selectedArea,
                    isExpanded: true,
                    hint: Text(
                      'Area chunein',
                      style: GoogleFonts.inter(fontSize: 14),
                    ),
                    items: _areasMaps
                        .map(
                          (a) => DropdownMenuItem<String>(
                            value: a['areaName'] as String,
                            child: Text(
                              a['areaName'] as String,
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        )
                        .toList(),
                    onChanged: (v) =>
                        setDialogState(() => selectedArea = v ?? ''),
                  ),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text(
                'Cancel',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w700,
                  color: AppTheme.mutedText,
                ),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryGreen,
                minimumSize: const Size(120, 48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                  side: const BorderSide(color: AppTheme.charcoal, width: 2),
                ),
              ),
              onPressed: () async {
                Navigator.pop(ctx);
                await _firestoreService.dispatchTruck(selectedArea);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: AppTheme.primaryGreen,
                      behavior: SnackBarBehavior.floating,
                      content: Text(
                        '🚛 Truck dispatched to $selectedArea!',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  );
                }
              },
              child: Text(
                'Dispatch!',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAnnouncementDialog() {
    final controller = TextEditingController();
    String selectedArea = 'All Areas';
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
            side: const BorderSide(color: AppTheme.charcoal, width: 3),
          ),
          title: Row(
            children: [
              const Icon(
                Icons.campaign_rounded,
                color: AppTheme.secondaryBlue,
                size: 28,
              ),
              const SizedBox(width: 10),
              Text(
                'Announcement Karo',
                style: GoogleFonts.inter(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: controller,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Message likhein...',
                  hintStyle: GoogleFonts.inter(color: AppTheme.mutedText),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                      color: AppTheme.charcoal,
                      width: 2,
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(
                      color: AppTheme.charcoal,
                      width: 2,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.charcoal, width: 2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: selectedArea,
                    isExpanded: true,
                    items:
                        [
                              'All Areas',
                              ..._areasMaps.map((a) => a['areaName'] as String),
                            ]
                            .map(
                              (a) => DropdownMenuItem<String>(
                                value: a,
                                child: Text(
                                  a,
                                  style: GoogleFonts.inter(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            )
                            .toList(),
                    onChanged: (v) =>
                        setDialogState(() => selectedArea = v ?? 'All Areas'),
                  ),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text(
                'Cancel',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w700,
                  color: AppTheme.mutedText,
                ),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.secondaryBlue,
                minimumSize: const Size(120, 48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                  side: const BorderSide(color: AppTheme.charcoal, width: 2),
                ),
              ),
              onPressed: () async {
                if (controller.text.trim().isEmpty) return;
                Navigator.pop(ctx);
                await _firestoreService.sendAnnouncement(
                  controller.text.trim(),
                  selectedArea,
                );
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: AppTheme.secondaryBlue,
                      behavior: SnackBarBehavior.floating,
                      content: Text(
                        '📢 Announcement sent to $selectedArea!',
                        style: GoogleFonts.inter(
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  );
                }
              },
              child: Text(
                'Send!',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showNewAreaDialog() {
    final nameController = TextEditingController();
    final zoneController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
          side: const BorderSide(color: AppTheme.charcoal, width: 3),
        ),
        title: Row(
          children: [
            const Icon(Icons.map_rounded, color: AppTheme.onSurface, size: 28),
            const SizedBox(width: 10),
            Text(
              'Naya Area Add Karein',
              style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: InputDecoration(
                labelText: 'Area Name',
                hintText: 'e.g. Lajpat Nagar',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(
                    color: AppTheme.charcoal,
                    width: 2,
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(
                    color: AppTheme.charcoal,
                    width: 2,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: zoneController,
              decoration: InputDecoration(
                labelText: 'Zone',
                hintText: 'e.g. Zone 2 — South Delhi',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(
                    color: AppTheme.charcoal,
                    width: 2,
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(
                    color: AppTheme.charcoal,
                    width: 2,
                  ),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Cancel',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: AppTheme.mutedText,
              ),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(120, 48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: const BorderSide(color: AppTheme.charcoal, width: 2),
              ),
            ),
            onPressed: () async {
              if (nameController.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              await _firestoreService.addArea({
                'areaName': nameController.text.trim(),
                'zone': zoneController.text.trim().isEmpty
                    ? 'Zone — Delhi'
                    : zoneController.text.trim(),
              });
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    backgroundColor: AppTheme.primaryGreen,
                    behavior: SnackBarBehavior.floating,
                    content: Text(
                      '✅ ${nameController.text.trim()} added to leaderboard!',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                );
              }
            },
            child: Text(
              'Add Area',
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

  void _exportReport() {
    final report = _firestoreService.generateReport();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
          side: const BorderSide(color: AppTheme.charcoal, width: 3),
        ),
        title: Row(
          children: [
            const Icon(
              Icons.download_rounded,
              color: AppTheme.secondaryBlue,
              size: 28,
            ),
            const SizedBox(width: 10),
            Text(
              'Export Report',
              style: GoogleFonts.inter(
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          height: 300,
          child: SingleChildScrollView(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerLow,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.outlineVariant, width: 1.5),
              ),
              child: Text(
                report,
                style: GoogleFonts.robotoMono(
                  fontSize: 11,
                  color: AppTheme.onSurface,
                ),
              ),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Close',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: AppTheme.mutedText,
              ),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(120, 48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: const BorderSide(color: AppTheme.charcoal, width: 2),
              ),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: AppTheme.secondaryBlue,
                  behavior: SnackBarBehavior.floating,
                  content: Text(
                    '📊 Report exported successfully!',
                    style: GoogleFonts.inter(
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              );
            },
            child: Text(
              'Export',
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

  void _showSettingsDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
          side: const BorderSide(color: AppTheme.charcoal, width: 3),
        ),
        title: Text(
          'Settings',
          style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w800),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(
                Icons.logout_rounded,
                color: AppTheme.alertRed,
              ),
              title: Text(
                'Logout',
                style: GoogleFonts.inter(
                  fontWeight: FontWeight.w700,
                  color: AppTheme.alertRed,
                ),
              ),
              onTap: () async {
                Navigator.pop(ctx);
                await _authService.signOut();
                if (mounted) {
                  Navigator.pushNamedAndRemoveUntil(
                    context,
                    AppRoutes.loginScreen,
                    (route) => false,
                  );
                }
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Close',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: AppTheme.mutedText,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.width >= 600;

    return Scaffold(
      backgroundColor: AppTheme.surface,
      body: isTablet ? _buildTabletLayout() : _buildMobileLayout(),
    );
  }

  Widget _buildTabletLayout() {
    return Row(
      children: [
        AdminSidebarWidget(
          selectedIndex: _selectedNavIndex,
          onNavChanged: (i) => setState(() => _selectedNavIndex = i),
          onExportReport: () => _handleAction('export'),
        ),
        Expanded(
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(
                    color: AppTheme.primaryGreen,
                  ),
                )
              : FadeTransition(
                  opacity: _contentFade,
                  child: _buildTabletContent(),
                ),
        ),
      ],
    );
  }

  Widget _buildTabletContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTabletHeader(),
          const SizedBox(height: 24),
          AdminMetricCardsWidget(stats: _statsData),
          const SizedBox(height: 24),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 3,
                child: Column(
                  children: [
                    AdminLeaderboardWidget(areas: _areasMaps),
                    const SizedBox(height: 24),
                    AdminActionsWidget(onAction: _handleAction),
                  ],
                ),
              ),
              const SizedBox(width: 24),
              SizedBox(
                width: 320,
                child: Column(
                  children: [
                    AdminAlertsWidget(
                      alerts: _alertsMaps,
                      onMarkResolved: _markAlertResolved,
                    ),
                    const SizedBox(height: 24),
                    AdminWorkersWidget(workers: _workersMaps),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTabletHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppTheme.charcoal, width: 2)),
      ),
      child: Row(
        children: [
          Text(
            'SAHI BIN ADMIN',
            style: GoogleFonts.inter(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: AppTheme.primaryGreen,
              letterSpacing: 1,
            ),
          ),
          const Spacer(),
          Container(
            width: 240,
            height: 44,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppTheme.charcoal, width: 2),
            ),
            child: Row(
              children: [
                const SizedBox(width: 12),
                const Icon(
                  Icons.search_rounded,
                  color: AppTheme.mutedText,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Search areas or workers...',
                      hintStyle: GoogleFonts.inter(
                        fontSize: 13,
                        color: AppTheme.mutedText,
                      ),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          _buildHeaderIcon(Icons.notifications_rounded),
          const SizedBox(width: 8),
          _buildHeaderIcon(
            Icons.settings_rounded,
            onTap: () => _handleAction('settings'),
          ),
          const SizedBox(width: 8),
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.charcoal, width: 2),
            ),
            child: ClipOval(
              child: Image.network(
                'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
                fit: BoxFit.cover,
                semanticLabel: 'Admin profile photo',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderIcon(IconData icon, {VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppTheme.charcoal, width: 2),
        ),
        child: Icon(icon, color: AppTheme.onSurface, size: 22),
      ),
    );
  }

  Widget _buildMobileLayout() {
    return Column(
      children: [
        _buildMobileAppBar(),
        Expanded(
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(
                    color: AppTheme.primaryGreen,
                  ),
                )
              : FadeTransition(
                  opacity: _contentFade,
                  child: _buildMobileContent(),
                ),
        ),
      ],
    );
  }

  Widget _buildMobileAppBar() {
    return Container(
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 8,
        left: 16,
        right: 16,
        bottom: 12,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: AppTheme.charcoal, width: 2)),
      ),
      child: Row(
        children: [
          Text(
            'Sahi Bin',
            style: GoogleFonts.inter(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: AppTheme.primaryGreen,
            ),
          ),
          const Spacer(),
          GestureDetector(
            onTap: () => _handleAction('export'),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppTheme.secondaryBlue,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.charcoal, width: 2),
              ),
              child: Text(
                'Export',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => _handleAction('settings'),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.charcoal, width: 2),
              ),
              child: const Icon(
                Icons.settings_rounded,
                color: AppTheme.onSurface,
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileContent() {
    final sections = [
      _buildMobileStats(),
      _buildMobileLeaderboard(),
      _buildMobileAlerts(),
      _buildMobileWorkers(),
      _buildMobileActions(),
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (int i = 0; i < sections.length; i++) ...[
            sections[i],
            if (i < sections.length - 1) const SizedBox(height: 20),
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildMobileStats() => AdminMetricCardsWidget(stats: _statsData);
  Widget _buildMobileLeaderboard() => AdminLeaderboardWidget(areas: _areasMaps);
  Widget _buildMobileAlerts() => AdminAlertsWidget(
    alerts: _alertsMaps,
    onMarkResolved: _markAlertResolved,
  );
  Widget _buildMobileWorkers() => AdminWorkersWidget(workers: _workersMaps);
  Widget _buildMobileActions() => AdminActionsWidget(onAction: _handleAction);
}
