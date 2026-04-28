import 'dart:io' if (dart.library.io) 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/app_export.dart';
import '../../services/firebase_service.dart';
import '../puraani_list_screen/puraani_list_screen.dart';

class KachraScanScreen extends StatefulWidget {
  const KachraScanScreen({super.key});

  @override
  State<KachraScanScreen> createState() => _KachraScanScreenState();
}

class _KachraScanScreenState extends State<KachraScanScreen> {
  int _selectedTab = 1; // 0=Dashboard, 1=Scan, 2=Puraani List
  bool _isCapturing = false;
  String? _scannedId;
  String? _capturedImagePath;
  bool _scanSuccess = false;

  final _firestoreService = FirestoreService();
  final _imagePicker = ImagePicker();

  Future<void> _capturePhoto() async {
    setState(() => _isCapturing = true);
    try {
      final XFile? photo = await _imagePicker.pickImage(
        source: ImageSource.camera,
        imageQuality: 85,
        preferredCameraDevice: CameraDevice.rear,
      );
      if (photo != null) {
        final householdId =
            'HH-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
        setState(() {
          _capturedImagePath = photo.path;
          _scannedId = householdId;
          _scanSuccess = true;
        });
        await _firestoreService.addScanRecord({
          'householdId': householdId,
          'imagePath': photo.path,
          'location': 'Scanned via Camera',
          'status': 'pending_review',
          'type': 'photo_capture',
        });
        _showScanSuccessSheet(householdId);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppTheme.alertRed,
            behavior: SnackBarBehavior.floating,
            content: Text(
              'Camera access nahi mila. Please permissions check karein.',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isCapturing = false);
    }
  }

  void _showScanSuccessSheet(String householdId) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.charcoal, width: 3),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen,
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.charcoal, width: 2),
              ),
              child: const Icon(
                Icons.check_rounded,
                color: Colors.white,
                size: 36,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'Scan Successful!',
              style: GoogleFonts.inter(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppTheme.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Household ID:',
              style: GoogleFonts.inter(fontSize: 14, color: AppTheme.mutedText),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerLow,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.primaryGreen, width: 2),
              ),
              child: Text(
                householdId,
                style: GoogleFonts.robotoMono(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primaryGreen,
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 52),
                      side: const BorderSide(
                        color: AppTheme.charcoal,
                        width: 2,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    onPressed: () {
                      Navigator.pop(ctx);
                      setState(() {
                        _scannedId = null;
                        _capturedImagePath = null;
                        _scanSuccess = false;
                      });
                    },
                    child: Text(
                      'Naya Scan',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w700,
                        color: AppTheme.onSurface,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryGreen,
                      minimumSize: const Size(double.infinity, 52),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: const BorderSide(
                          color: AppTheme.charcoal,
                          width: 2,
                        ),
                      ),
                    ),
                    onPressed: () {
                      Navigator.pop(ctx);
                      setState(() => _selectedTab = 2);
                    },
                    child: Text(
                      'List Dekho',
                      style: GoogleFonts.inter(
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _onTabTapped(int index) {
    if (index == 0) {
      Navigator.pushNamedAndRemoveUntil(
        context,
        AppRoutes.adminDashboardScreen,
        (route) => false,
      );
      return;
    }
    if (index == 2) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const PuraaniListScreen()),
      );
      return;
    }
    setState(() => _selectedTab = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.surface,
      body: SafeArea(
        child: Column(
          children: [
            _buildAppBar(),
            Expanded(child: _buildScanContent()),
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
              Icons.menu_rounded,
              color: AppTheme.onSurface,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              'Kachra Scan Karein',
              style: GoogleFonts.inter(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppTheme.primaryGreen,
              ),
            ),
          ),
          Container(
            width: 48,
            height: 48,
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

  Widget _buildScanContent() {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            Text(
              'Household ID scan karein.',
              style: GoogleFonts.inter(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: AppTheme.onSurface,
              ),
            ),
            const SizedBox(height: 24),
            _buildScanFrame(),
            const SizedBox(height: 24),
            _buildCaptureButton(),
            const SizedBox(height: 16),
            Center(
              child: Text(
                'QR code frame ke beech mein rakhein',
                style: GoogleFonts.inter(
                  fontSize: 15,
                  fontWeight: FontWeight.w400,
                  color: AppTheme.mutedText,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            if (_scanSuccess && _scannedId != null) ...[
              const SizedBox(height: 24),
              _buildLastScanCard(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildScanFrame() {
    return Container(
      width: double.infinity,
      height: 280,
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.charcoal, width: 2),
      ),
      child: Stack(
        children: [
          // Background image simulating camera view
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: _capturedImagePath != null && !kIsWeb
                ? Image.file(
                    File(_capturedImagePath!),
                    width: double.infinity,
                    height: 280,
                    fit: BoxFit.cover,
                    semanticLabel: 'Captured household photo for scanning',
                  )
                : Image.network(
                    'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg',
                    width: double.infinity,
                    height: 280,
                    fit: BoxFit.cover,
                    semanticLabel:
                        'Camera viewfinder showing street with houses for QR scanning',
                  ),
          ),
          // QR frame overlay
          Positioned.fill(child: CustomPaint(painter: _QRFramePainter())),
          if (_scanSuccess)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  color: AppTheme.primaryGreen.withAlpha(38),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Center(
                  child: Icon(
                    Icons.check_circle_rounded,
                    color: AppTheme.primaryGreen,
                    size: 64,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildCaptureButton() {
    return SizedBox(
      width: double.infinity,
      height: 72,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppTheme.secondaryBlue,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: const BorderSide(color: AppTheme.charcoal, width: 3),
          ),
          elevation: 0,
        ),
        onPressed: _isCapturing ? null : _capturePhoto,
        child: _isCapturing
            ? const SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 3,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.camera_alt_rounded,
                    color: Colors.white,
                    size: 28,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'CAPTURE PHOTO',
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildLastScanCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.primaryGreen, width: 2),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppTheme.primaryGreen,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.qr_code_scanner_rounded,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Last Scan',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppTheme.mutedText,
                  ),
                ),
                Text(
                  _scannedId!,
                  style: GoogleFonts.robotoMono(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.primaryGreen,
                  ),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const PuraaniListScreen()),
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppTheme.surfaceContainerLow,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppTheme.charcoal, width: 1.5),
              ),
              child: Text(
                'View List',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.onSurface,
                ),
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
              _buildTabItem(1, Icons.qr_code_scanner_rounded, 'Scan', true),
              _buildTabItem(2, Icons.history_rounded, 'Puraani List', false),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabItem(int index, IconData icon, String label, bool isActive) {
    return Expanded(
      child: GestureDetector(
        onTap: () => _onTabTapped(index),
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

class _QRFramePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.primaryGreen
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke;

    const cornerLen = 32.0;
    const margin = 40.0;

    final left = margin;
    final top = margin;
    final right = size.width - margin;
    final bottom = size.height - margin;

    // Top-left corner
    canvas.drawLine(Offset(left, top + cornerLen), Offset(left, top), paint);
    canvas.drawLine(Offset(left, top), Offset(left + cornerLen, top), paint);
    // Top-right corner
    canvas.drawLine(Offset(right - cornerLen, top), Offset(right, top), paint);
    canvas.drawLine(Offset(right, top), Offset(right, top + cornerLen), paint);
    // Bottom-left corner
    canvas.drawLine(
      Offset(left, bottom - cornerLen),
      Offset(left, bottom),
      paint,
    );
    canvas.drawLine(
      Offset(left, bottom),
      Offset(left + cornerLen, bottom),
      paint,
    );
    // Bottom-right corner
    canvas.drawLine(
      Offset(right - cornerLen, bottom),
      Offset(right, bottom),
      paint,
    );
    canvas.drawLine(
      Offset(right, bottom),
      Offset(right, bottom - cornerLen),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
