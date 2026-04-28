import 'package:flutter/material.dart';

import '../presentation/admin_dashboard_screen/admin_dashboard_screen.dart';
import '../presentation/login_screen/login_screen.dart';
import '../presentation/resident_home_screen/resident_home_screen.dart';
import '../presentation/kachra_scan_screen/kachra_scan_screen.dart';
import '../presentation/puraani_list_screen/puraani_list_screen.dart';

class AppRoutes {
  static const String initial = '/';
  static const String loginScreen = '/login-screen';
  static const String adminDashboardScreen = '/admin-dashboard-screen';
  static const String residentHomeScreen = '/resident-home-screen';
  static const String kachraScanScreen = '/kachra-scan-screen';
  static const String puraaniListScreen = '/puraani-list-screen';

  static Map<String, WidgetBuilder> routes = {
    initial: (context) => const LoginScreen(),
    loginScreen: (context) => const LoginScreen(),
    adminDashboardScreen: (context) => const AdminDashboardScreen(),
    residentHomeScreen: (context) => const ResidentHomeScreen(),
    kachraScanScreen: (context) => const KachraScanScreen(),
    puraaniListScreen: (context) => const PuraaniListScreen(),
  };
}
