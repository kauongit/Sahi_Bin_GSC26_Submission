
import '../../core/app_export.dart';
import './widgets/resident_announcement_widget.dart';
import './widgets/resident_green_score_widget.dart';
import './widgets/resident_leaderboard_link_widget.dart';
import './widgets/resident_waste_categories_widget.dart';

class ResidentHomeScreen extends StatefulWidget {
  const ResidentHomeScreen({super.key});

  @override
  State<ResidentHomeScreen> createState() => _ResidentHomeScreenState();
}

class _ResidentHomeScreenState extends State<ResidentHomeScreen>
    with TickerProviderStateMixin {
  // TODO: Replace with Riverpod/Bloc + Firestore stream for production
  int _selectedNavIndex = 0;
  bool _isDrawerOpen = false;

  late AnimationController _entranceController;
  late List<Animation<double>> _itemAnimations;

  // Mock resident data — TODO: Replace with Firebase Auth user + Firestore query
  final Map<String, dynamic> _residentData = {
    'name': 'Ramesh',
    'greenScore': 85,
    'maxScore': 100,
    'scoreMessage': 'Shabaash! Aap environment ke hero hain.',
  };

  final Map<String, dynamic> _announcementData = {
    'title': 'Sahi Hai!',
    'message': 'Kal subah 7 baje gaadi aayegi. Taiyaar rehna!',
    'time': 'Aaj, 6:30 PM',
  };

  @override
  void initState() {
    super.initState();
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _itemAnimations = List.generate(
      5,
      (i) => CurvedAnimation(
        parent: _entranceController,
        curve: Interval(
          i * 0.12,
          (i * 0.12 + 0.5).clamp(0.0, 1.0),
          curve: Curves.easeOutCubic,
        ),
      ),
    );

    _entranceController.forward();
  }

  @override
  void dispose() {
    _entranceController.dispose();
    super.dispose();
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Suprabhat';
    if (hour < 17) return 'Namaste';
    return 'Shubh Sandhya';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: _buildAppBar(),
      body: SafeArea(child: _buildBody()),
      bottomNavigationBar: _buildFloatingBottomNav(),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      scrolledUnderElevation: 0,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(2),
        child: Container(height: 2, color: AppTheme.charcoal),
      ),
      leading: IconButton(
        icon: const Icon(
          Icons.menu_rounded,
          color: AppTheme.primaryGreen,
          size: 28,
        ),
        onPressed: () => setState(() => _isDrawerOpen = !_isDrawerOpen),
      ),
      title: Text(
        'SAHI KACHRA',
        style: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w800,
          color: AppTheme.primaryGreen,
          letterSpacing: 1.5,
        ),
      ),
      actions: [
        GestureDetector(
          onTap: () {},
          child: Container(
            margin: const EdgeInsets.only(right: 16),
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF293040),
              border: Border.all(color: AppTheme.charcoal, width: 2.5),
            ),
            child: ClipOval(
              child: CustomImageWidget(
                imageUrl:
                    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
                width: 44,
                height: 44,
                fit: BoxFit.cover,
                semanticLabel:
                    'Resident user profile photo, Indian male in casual attire, smiling',
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBody() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(
        AppTheme.screenMargin,
        24,
        AppTheme.screenMargin,
        100,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildAnimatedItem(0, _buildGreeting()),
          const SizedBox(height: 24),
          _buildAnimatedItem(1, ResidentGreenScoreWidget(data: _residentData)),
          const SizedBox(height: 24),
          _buildAnimatedItem(2, const ResidentWasteCategoriesWidget()),
          const SizedBox(height: 24),
          _buildAnimatedItem(3, const ResidentLeaderboardLinkWidget()),
          const SizedBox(height: 16),
          _buildAnimatedItem(
            4,
            ResidentAnnouncementWidget(data: _announcementData),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedItem(int index, Widget child) {
    return FadeTransition(
      opacity: _itemAnimations[index],
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0, 0.08),
          end: Offset.zero,
        ).animate(_itemAnimations[index]),
        child: child,
      ),
    );
  }

  Widget _buildGreeting() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '${_getGreeting()}\n${_residentData['name']} Ji!',
          style: GoogleFonts.inter(
            fontSize: 32,
            fontWeight: FontWeight.w800,
            color: AppTheme.onSurface,
            height: 1.2,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Aaj ka kachra sahi jagah dala?',
          style: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w400,
            color: AppTheme.mutedText,
          ),
        ),
      ],
    );
  }

  Widget _buildFloatingBottomNav() {
    final navItems = [
      const NavigationDestination(
        icon: Icon(Icons.home_outlined),
        selectedIcon: Icon(Icons.home_rounded),
        label: 'Dashboard',
      ),
      const NavigationDestination(
        icon: Icon(Icons.history_outlined),
        selectedIcon: Icon(Icons.history_rounded),
        label: 'Puraani List',
      ),
      const NavigationDestination(
        icon: Icon(Icons.emoji_events_outlined),
        selectedIcon: Icon(Icons.emoji_events_rounded),
        label: 'Inaam',
      ),
    ];

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        border: Border.all(
          color: AppTheme.charcoal,
          width: AppTheme.borderWidth,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge - 3),
        child: NavigationBar(
          selectedIndex: _selectedNavIndex,
          onDestinationSelected: (index) =>
              setState(() => _selectedNavIndex = index),
          backgroundColor: Colors.transparent,
          indicatorColor: AppTheme.primaryGreen,
          height: 68,
          destinations: navItems,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        ),
      ),
    );
  }
}
