import '../../core/app_export.dart';
import '../../services/firebase_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordVisible = false;
  bool _isLoading = false;
  int _selectedRole = 0; // 0 = Admin, 1 = Resident
  String? _errorMessage;

  final _authService = FirebaseAuthService();

  late AnimationController _entranceController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _entranceController,
      curve: Curves.easeOutCubic,
    );
    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.06), end: Offset.zero).animate(
          CurvedAnimation(
            parent: _entranceController,
            curve: Curves.easeOutCubic,
          ),
        );
    _entranceController.forward();
  }

  @override
  void dispose() {
    _entranceController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await _authService.signInWithEmailAndPassword(
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );

    if (!mounted) return;

    if (result['success'] == true) {
      final role = result['role'] as String;
      setState(() => _isLoading = false);
      if (role == 'admin' && _selectedRole == 0) {
        Navigator.pushNamedAndRemoveUntil(
          context,
          AppRoutes.adminDashboardScreen,
          (route) => false,
        );
      } else if (role == 'resident' && _selectedRole == 1) {
        Navigator.pushNamedAndRemoveUntil(
          context,
          AppRoutes.residentHomeScreen,
          (route) => false,
        );
      } else {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Role mismatch — please select the correct role';
        });
      }
    } else {
      setState(() {
        _isLoading = false;
        _errorMessage =
            'Invalid credentials — use the demo accounts below to sign in';
      });
    }
  }

  void _fillCredentials(String email, String password) {
    setState(() {
      _emailController.text = email;
      _passwordController.text = password;
      _errorMessage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.width >= 600;

    return Scaffold(
      backgroundColor: AppTheme.surface,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(
              horizontal: isTablet ? 0 : AppTheme.screenMargin,
              vertical: AppTheme.spaceXL,
            ),
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: SlideTransition(
                position: _slideAnimation,
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    maxWidth: isTablet ? 480 : double.infinity,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _buildLogo(),
                      const SizedBox(height: 40),
                      _buildRoleSelector(),
                      const SizedBox(height: 32),
                      _buildForm(),
                      const SizedBox(height: 24),
                      if (_errorMessage != null) _buildErrorBanner(),
                      const SizedBox(height: 24),
                      _buildSubmitButton(),
                      const SizedBox(height: 40),
                      _buildCredentialsBox(),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppTheme.primaryGreen,
            borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
            border: Border.all(
              color: AppTheme.charcoal,
              width: AppTheme.borderWidth,
            ),
          ),
          child: const Icon(
            Icons.recycling_rounded,
            color: Colors.white,
            size: 44,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'SAHI BIN',
          style: GoogleFonts.inter(
            fontSize: 32,
            fontWeight: FontWeight.w800,
            color: AppTheme.primaryGreen,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Aapka Kachra, Sahi Jagah',
          style: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: AppTheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildRoleSelector() {
    return Container(
      height: 56,
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
        border: Border.all(
          color: AppTheme.charcoal,
          width: AppTheme.borderWidth,
        ),
      ),
      child: Row(
        children: [
          _buildRoleTab(0, 'Admin', Icons.admin_panel_settings_rounded),
          _buildRoleTab(1, 'Resident', Icons.person_rounded),
        ],
      ),
    );
  }

  Widget _buildRoleTab(int index, String label, IconData icon) {
    final isSelected = _selectedRole == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() {
          _selectedRole = index;
          _errorMessage = null;
        }),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOutCubic,
          decoration: BoxDecoration(
            color: isSelected ? AppTheme.primaryGreen : Colors.transparent,
            borderRadius: BorderRadius.horizontal(
              left: index == 0 ? const Radius.circular(5) : Radius.zero,
              right: index == 1 ? const Radius.circular(5) : Radius.zero,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                color: isSelected ? Colors.white : AppTheme.mutedText,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: isSelected ? Colors.white : AppTheme.mutedText,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w500),
            decoration: const InputDecoration(
              labelText: 'Email Address',
              prefixIcon: Icon(Icons.email_outlined),
            ),
            validator: (v) =>
                (v == null || v.trim().isEmpty) ? 'Email required' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _passwordController,
            obscureText: !_isPasswordVisible,
            style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w500),
            decoration: InputDecoration(
              labelText: 'Password',
              prefixIcon: const Icon(Icons.lock_outline_rounded),
              suffixIcon: IconButton(
                icon: Icon(
                  _isPasswordVisible
                      ? Icons.visibility_off_rounded
                      : Icons.visibility_rounded,
                ),
                onPressed: () =>
                    setState(() => _isPasswordVisible = !_isPasswordVisible),
              ),
            ),
            validator: (v) =>
                (v == null || v.isEmpty) ? 'Password required' : null,
          ),
        ],
      ),
    );
  }

  Widget _buildErrorBanner() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
        border: Border.all(color: AppTheme.alertRed, width: 2),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.error_outline_rounded,
            color: AppTheme.alertRed,
            size: 20,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              _errorMessage!,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppTheme.alertRed,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      height: AppTheme.buttonHeight,
      child: ElevatedButton(
        onPressed: _isLoading ? null : _handleLogin,
        child: _isLoading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 3,
                ),
              )
            : Text(
                'LOGIN',
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1,
                ),
              ),
      ),
    );
  }

  Widget _buildCredentialsBox() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerLow,
        borderRadius: BorderRadius.circular(AppTheme.radiusStandard),
        border: Border.all(color: AppTheme.charcoal, width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Demo Credentials',
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: AppTheme.onSurface,
            ),
          ),
          const SizedBox(height: 12),
          _buildCredRow('Admin', 'admin@sahibin.in', 'SahiBin@2026'),
          const SizedBox(height: 8),
          _buildCredRow('Resident', 'ramesh@sahibin.in', 'Resident@2026'),
        ],
      ),
    );
  }

  Widget _buildCredRow(String role, String email, String password) {
    return GestureDetector(
      onTap: () => _fillCredentials(email, password),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: AppTheme.outlineVariant, width: 1.5),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                role,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                email,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.onSurface,
                ),
              ),
            ),
            Text(
              'Tap to fill',
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: AppTheme.mutedText,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
