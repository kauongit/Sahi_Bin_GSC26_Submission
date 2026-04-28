import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ── Brand Colors ──────────────────────────────────────────
  static const Color primaryGreen = Color(0xFF059669);
  static const Color primaryGreenDark = Color(0xFF006948);
  static const Color secondaryBlue = Color(0xFF2563EB);
  static const Color secondaryBlueDark = Color(0xFF0051D5);
  static const Color alertRed = Color(0xFFDC2626);
  static const Color alertRedContainer = Color(0xFFFFDAD6);
  static const Color warningAmber = Color(0xFFD97706);
  static const Color charcoal = Color(0xFF111827);
  static const Color onSurface = Color(0xFF141B2B);
  static const Color onSurfaceVariant = Color(0xFF3D4A42);
  static const Color surface = Color(0xFFF9F9FF);
  static const Color surfaceContainer = Color(0xFFE9EDFF);
  static const Color surfaceContainerLow = Color(0xFFF1F3FF);
  static const Color outline = Color(0xFF6D7A72);
  static const Color outlineVariant = Color(0xFFBCCAC0);
  static const Color mutedText = Color(0xFF6B7280);
  static const Color white = Color(0xFFFFFFFF);

  // ── Spacing ───────────────────────────────────────────────
  static const double spaceXS = 4.0;
  static const double spaceS = 8.0;
  static const double spaceM = 16.0;
  static const double spaceL = 24.0;
  static const double spaceXL = 48.0;
  static const double screenMargin = 24.0;
  static const double borderWidth = 3.0;
  static const double radiusStandard = 8.0;
  static const double radiusLarge = 24.0;
  static const double touchTarget = 64.0;
  static const double buttonHeight = 72.0;
  static const double listRowMinHeight = 80.0;

  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    colorScheme: const ColorScheme.light(
      primary: primaryGreen,
      onPrimary: white,
      primaryContainer: Color(0xFF00855D),
      onPrimaryContainer: Color(0xFFF5FFF7),
      secondary: secondaryBlue,
      onSecondary: white,
      secondaryContainer: Color(0xFF316BF3),
      onSecondaryContainer: Color(0xFFFEFCFF),
      tertiary: alertRed,
      onTertiary: white,
      tertiaryContainer: alertRedContainer,
      onTertiaryContainer: Color(0xFF93000A),
      error: alertRed,
      onError: white,
      errorContainer: alertRedContainer,
      onErrorContainer: Color(0xFF93000A),
      surface: surface,
      onSurface: onSurface,
      onSurfaceVariant: onSurfaceVariant,
      outline: outline,
      outlineVariant: outlineVariant,
    ),
    scaffoldBackgroundColor: surface,
    textTheme: GoogleFonts.interTextTheme(
      const TextTheme(
        displayLarge: TextStyle(
          fontSize: 40,
          fontWeight: FontWeight.w800,
          height: 1.2,
        ),
        displayMedium: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.w700,
          height: 1.25,
        ),
        displaySmall: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          height: 1.33,
        ),
        headlineLarge: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          height: 1.33,
        ),
        headlineMedium: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          height: 1.4,
        ),
        headlineSmall: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          height: 1.44,
        ),
        titleLarge: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          height: 1.44,
        ),
        titleMedium: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.02,
          height: 1.5,
        ),
        titleSmall: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.02,
          height: 1.43,
        ),
        bodyLarge: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w500,
          height: 1.67,
        ),
        bodyMedium: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w400,
          height: 1.5,
        ),
        bodySmall: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          height: 1.43,
        ),
        labelLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.02,
          height: 1.5,
        ),
        labelMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.02,
          height: 1.43,
        ),
        labelSmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.04,
          height: 1.33,
        ),
      ),
    ),
    appBarTheme: AppBarThemeData(
      backgroundColor: primaryGreen,
      foregroundColor: white,
      elevation: 0,
      scrolledUnderElevation: 0,
      titleTextStyle: GoogleFonts.inter(
        fontSize: 20,
        fontWeight: FontWeight.w800,
        color: white,
        letterSpacing: 0.5,
      ),
    ),
    inputDecorationTheme: InputDecorationThemeData(
      filled: false,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radiusStandard),
        borderSide: const BorderSide(color: charcoal, width: borderWidth),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radiusStandard),
        borderSide: const BorderSide(color: charcoal, width: borderWidth),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radiusStandard),
        borderSide: const BorderSide(color: primaryGreen, width: borderWidth),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radiusStandard),
        borderSide: const BorderSide(color: alertRed, width: borderWidth),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radiusStandard),
        borderSide: const BorderSide(color: alertRed, width: borderWidth),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      labelStyle: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w500,
        color: onSurfaceVariant,
      ),
      hintStyle: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: mutedText,
      ),
      errorStyle: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: alertRed,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryGreen,
        foregroundColor: white,
        minimumSize: const Size(double.infinity, buttonHeight),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusStandard),
          side: const BorderSide(color: charcoal, width: borderWidth),
        ),
        elevation: 0,
        textStyle: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.5,
        ),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: white,
      indicatorColor: primaryGreen,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: primaryGreen,
          );
        }
        return GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: mutedText,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const IconThemeData(color: white, size: 24);
        }
        return const IconThemeData(color: Color(0xFF6B7280), size: 24);
      }),
      height: 72,
      labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
    ),
    cardTheme: CardThemeData(
      color: white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radiusStandard),
        side: const BorderSide(color: charcoal, width: borderWidth),
      ),
      margin: EdgeInsets.zero,
    ),
    dividerTheme: const DividerThemeData(
      color: charcoal,
      thickness: 2,
      space: 0,
    ),
    checkboxTheme: CheckboxThemeData(
      fillColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) return primaryGreen;
        return Colors.transparent;
      }),
      checkColor: WidgetStateProperty.all(white),
      side: const BorderSide(color: charcoal, width: 2),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
    ),
  );

  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.dark(
      primary: primaryGreen,
      onPrimary: white,
      secondary: secondaryBlue,
      onSecondary: white,
      surface: const Color(0xFF1A1F2E),
      onSurface: const Color(0xFFEDF0FF),
      error: alertRed,
      onError: white,
    ),
    scaffoldBackgroundColor: const Color(0xFF1A1F2E),
    textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
  );
}
