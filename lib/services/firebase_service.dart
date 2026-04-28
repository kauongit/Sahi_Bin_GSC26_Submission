import 'dart:async';
import 'package:flutter/foundation.dart';

/// Firebase-compatible service layer for SahiBin.
/// Provides Auth, Firestore-like real-time streams, and FCM notification simulation.
/// Replace stream controllers with actual Firebase SDK calls when Firebase project is configured.

class FirebaseAuthService {
  static final FirebaseAuthService _instance = FirebaseAuthService._internal();
  factory FirebaseAuthService() => _instance;
  FirebaseAuthService._internal();

  Map<String, dynamic>? _currentUser;

  Map<String, dynamic>? get currentUser => _currentUser;
  bool get isLoggedIn => _currentUser != null;

  // Admin credentials — replace with Firebase Auth signInWithEmailAndPassword
  static const _adminEmail = 'admin@sahibin.in';
  static const _adminPassword = 'SahiBin@2026';
  static const _residentEmail = 'ramesh@sahibin.in';
  static const _residentPassword = 'Resident@2026';

  Future<Map<String, dynamic>> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    await Future.delayed(const Duration(milliseconds: 800));

    if (email == _adminEmail && password == _adminPassword) {
      _currentUser = {
        'uid': 'admin_001',
        'email': email,
        'role': 'admin',
        'displayName': 'Admin',
      };
      return {'success': true, 'role': 'admin'};
    } else if (email == _residentEmail && password == _residentPassword) {
      _currentUser = {
        'uid': 'resident_001',
        'email': email,
        'role': 'resident',
        'displayName': 'Ramesh',
      };
      return {'success': true, 'role': 'resident'};
    }
    return {'success': false, 'error': 'Invalid credentials'};
  }

  Future<void> signOut() async {
    _currentUser = null;
  }
}

class FirestoreService {
  static final FirestoreService _instance = FirestoreService._internal();
  factory FirestoreService() => _instance;
  FirestoreService._internal() {
    _initData();
  }

  // In-memory Firestore collections
  final Map<String, dynamic> _stats = {};
  final List<Map<String, dynamic>> _areas = [];
  final List<Map<String, dynamic>> _alerts = [];
  final List<Map<String, dynamic>> _workers = [];
  final List<Map<String, dynamic>> _scanHistory = [];

  // Stream controllers for real-time updates
  final _statsController = StreamController<Map<String, dynamic>>.broadcast();
  final _areasController =
      StreamController<List<Map<String, dynamic>>>.broadcast();
  final _alertsController =
      StreamController<List<Map<String, dynamic>>>.broadcast();
  final _workersController =
      StreamController<List<Map<String, dynamic>>>.broadcast();
  final _scanHistoryController =
      StreamController<List<Map<String, dynamic>>>.broadcast();

  Stream<Map<String, dynamic>> get statsStream => _statsController.stream;
  Stream<List<Map<String, dynamic>>> get areasStream => _areasController.stream;
  Stream<List<Map<String, dynamic>>> get alertsStream =>
      _alertsController.stream;
  Stream<List<Map<String, dynamic>>> get workersStream =>
      _workersController.stream;
  Stream<List<Map<String, dynamic>>> get scanHistoryStream =>
      _scanHistoryController.stream;

  void _initData() {
    _stats.addAll({
      'geelaKachra': 4280,
      'sookhaKachra': 2150,
      'segregationPercent': 94.2,
      'geelaTrend': '+12%',
      'sookhaTrend': '-4%',
      'geelaPositive': true,
      'sookhaPositive': false,
      'lastUpdated': DateTime.now().toIso8601String(),
    });

    _areas.addAll([
      {
        'id': 'area_001',
        'rank': 1,
        'areaName': 'Green Park Colony',
        'zone': 'Zone 4 — South Delhi',
        'geelaKg': 842,
        'sookhaKg': 410,
        'status': 'clear',
      },
      {
        'id': 'area_002',
        'rank': 2,
        'areaName': 'Model Town II',
        'zone': 'Zone 1 — North Delhi',
        'geelaKg': 790,
        'sookhaKg': 380,
        'status': 'clear',
      },
      {
        'id': 'area_003',
        'rank': 3,
        'areaName': 'Vasant Vihar',
        'zone': 'Zone 4 — South Delhi',
        'geelaKg': 612,
        'sookhaKg': 295,
        'status': 'in_progress',
      },
      {
        'id': 'area_004',
        'rank': 4,
        'areaName': 'Rohini Sector 14',
        'zone': 'Zone 3 — North Delhi',
        'geelaKg': 540,
        'sookhaKg': 260,
        'status': 'in_progress',
      },
      {
        'id': 'area_005',
        'rank': 5,
        'areaName': 'Dwarka Sector 6',
        'zone': 'Zone 2 — West Delhi',
        'geelaKg': 490,
        'sookhaKg': 230,
        'status': 'clear',
      },
    ]);

    _alerts.addAll([
      {
        'id': 'alert_001',
        'location': 'House #42, Model Town',
        'message': 'Plastic detected in Geela Bin.',
        'timestamp': '2 MINS AGO',
        'type': 'mixed_waste',
        'resolved': false,
        'createdAt': DateTime.now()
            .subtract(const Duration(minutes: 2))
            .toIso8601String(),
      },
      {
        'id': 'alert_002',
        'location': 'Block C, Green Park',
        'message': 'Food waste in Sookha Bin.',
        'timestamp': '15 MINS AGO',
        'type': 'incorrect_segregation',
        'resolved': false,
        'createdAt': DateTime.now()
            .subtract(const Duration(minutes: 15))
            .toIso8601String(),
      },
      {
        'id': 'alert_003',
        'location': 'Flat 7B, Rohini Sector 14',
        'message': 'E-waste mixed with wet waste.',
        'timestamp': '42 MINS AGO',
        'type': 'mixed_waste',
        'resolved': false,
        'createdAt': DateTime.now()
            .subtract(const Duration(minutes: 42))
            .toIso8601String(),
      },
    ]);

    _workers.addAll([
      {
        'id': 'w001',
        'name': 'Rajesh Kumar',
        'imageUrl':
            'https://img.rocket.new/generatedImages/rocket_gen_img_19e6db4d2-1772525512332.png',
        'semanticLabel':
            'Indian male waste collection worker in yellow safety vest',
        'completionPercent': 75,
        'active': true,
        'area': 'Green Park Colony',
      },
      {
        'id': 'w002',
        'name': 'Suresh Pal',
        'imageUrl':
            'https://img.rocket.new/generatedImages/rocket_gen_img_19590a817-1772304633100.png',
        'semanticLabel': 'Indian male sanitation worker wearing orange vest',
        'completionPercent': 42,
        'active': true,
        'area': 'Model Town II',
      },
      {
        'id': 'w003',
        'name': 'Priya Devi',
        'imageUrl':
            'https://img.rocket.new/generatedImages/rocket_gen_img_1d21b343f-1777399938803.png',
        'semanticLabel': 'Indian female civic worker in green uniform',
        'completionPercent': 88,
        'active': true,
        'area': 'Vasant Vihar',
      },
      {
        'id': 'w004',
        'name': 'Mohan Singh',
        'imageUrl':
            'https://img.rocket.new/generatedImages/rocket_gen_img_1a819d841-1763295537615.png',
        'semanticLabel':
            'Indian male worker in blue uniform with safety helmet outdoors',
        'completionPercent': 60,
        'active': true,
        'area': 'Rohini Sector 14',
      },
      {
        'id': 'w005',
        'name': 'Kavita Sharma',
        'imageUrl':
            'https://img.rocket.new/generatedImages/rocket_gen_img_19590a817-1772304633100.png',
        'semanticLabel': 'Indian female sanitation worker smiling in uniform',
        'completionPercent': 33,
        'active': false,
        'area': 'Dwarka Sector 6',
      },
    ]);
  }

  // ── Stats ──────────────────────────────────────────────────
  Map<String, dynamic> getStats() => Map.from(_stats);

  // ── Areas ──────────────────────────────────────────────────
  List<Map<String, dynamic>> getAreas() => List.from(_areas);

  Future<void> addArea(Map<String, dynamic> area) async {
    final newArea = {
      'id': 'area_${DateTime.now().millisecondsSinceEpoch}',
      'rank': _areas.length + 1,
      ...area,
      'geelaKg': 0,
      'sookhaKg': 0,
      'status': 'in_progress',
    };
    _areas.add(newArea);
    _areasController.add(List.from(_areas));
  }

  // ── Alerts ─────────────────────────────────────────────────
  List<Map<String, dynamic>> getAlerts() => List.from(_alerts);

  Future<void> markAlertResolved(String alertId) async {
    final idx = _alerts.indexWhere((a) => a['id'] == alertId);
    if (idx != -1) {
      _alerts[idx] = Map.from(_alerts[idx])..['resolved'] = true;
      _alertsController.add(List.from(_alerts));
      // FCM: In production, this would trigger a Cloud Function to send FCM notification
      FCMService().sendLocalNotification(
        title: 'Alert Resolved',
        body: 'Alert at ${_alerts[idx]['location']} has been resolved.',
      );
    }
  }

  Future<void> addAlert(Map<String, dynamic> alert) async {
    final newAlert = {
      'id': 'alert_${DateTime.now().millisecondsSinceEpoch}',
      ...alert,
      'resolved': false,
      'timestamp': 'JUST NOW',
      'createdAt': DateTime.now().toIso8601String(),
    };
    _alerts.insert(0, newAlert);
    _alertsController.add(List.from(_alerts));
    // FCM: Trigger push notification for new alert
    FCMService().sendLocalNotification(
      title: '⚠️ New Alert: ${alert['type'] ?? 'Mixed Waste'}',
      body: '${alert['location']}: ${alert['message']}',
    );
  }

  // ── Workers ────────────────────────────────────────────────
  List<Map<String, dynamic>> getWorkers() => List.from(_workers);

  Future<void> updateWorkerProgress(String workerId, int percent) async {
    final idx = _workers.indexWhere((w) => w['id'] == workerId);
    if (idx != -1) {
      _workers[idx] = Map.from(_workers[idx])..['completionPercent'] = percent;
      _workersController.add(List.from(_workers));
    }
  }

  // ── Scan History ───────────────────────────────────────────
  List<Map<String, dynamic>> getScanHistory() => List.from(_scanHistory);

  Future<void> addScanRecord(Map<String, dynamic> record) async {
    final newRecord = {
      'id': 'scan_${DateTime.now().millisecondsSinceEpoch}',
      ...record,
      'scannedAt': DateTime.now().toIso8601String(),
      'timestamp': _formatTimestamp(DateTime.now()),
    };
    _scanHistory.insert(0, newRecord);
    _scanHistoryController.add(List.from(_scanHistory));
  }

  String _formatTimestamp(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 1) return 'JUST NOW';
    if (diff.inMinutes < 60) return '${diff.inMinutes} MINS AGO';
    if (diff.inHours < 24) return '${diff.inHours} HRS AGO';
    return '${diff.inDays} DAYS AGO';
  }

  // ── Truck Dispatch ─────────────────────────────────────────
  Future<void> dispatchTruck(String area) async {
    await Future.delayed(const Duration(milliseconds: 500));
    FCMService().sendLocalNotification(
      title: '🚛 Truck Dispatched',
      body: 'Collection truck dispatched to $area.',
    );
  }

  // ── Announcements ──────────────────────────────────────────
  Future<void> sendAnnouncement(String message, String area) async {
    await Future.delayed(const Duration(milliseconds: 500));
    FCMService().sendLocalNotification(title: '📢 Announcement', body: message);
  }

  // ── Export Report ──────────────────────────────────────────
  String generateReport() {
    final buffer = StringBuffer();
    buffer.writeln('SAHI BIN — WASTE MANAGEMENT REPORT');
    buffer.writeln('Generated: ${DateTime.now()}');
    buffer.writeln('─' * 40);
    buffer.writeln('\nCOLLECTION STATS:');
    buffer.writeln('Total Geela Kachra: ${_stats['geelaKachra']} kg');
    buffer.writeln('Total Sookha Kachra: ${_stats['sookhaKachra']} kg');
    buffer.writeln('Segregation %: ${_stats['segregationPercent']}%');
    buffer.writeln('\nAREA LEADERBOARD:');
    for (final area in _areas) {
      buffer.writeln(
        '${area['rank']}. ${area['areaName']} — Geela: ${area['geelaKg']}kg, Sookha: ${area['sookhaKg']}kg, Status: ${area['status']}',
      );
    }
    buffer.writeln(
      '\nACTIVE ALERTS: ${_alerts.where((a) => !(a['resolved'] as bool)).length}',
    );
    buffer.writeln(
      'RESOLVED ALERTS: ${_alerts.where((a) => a['resolved'] as bool).length}',
    );
    buffer.writeln(
      '\nWORKERS: ${_workers.length} total, ${_workers.where((w) => w['active'] as bool).length} active',
    );
    return buffer.toString();
  }

  void dispose() {
    _statsController.close();
    _areasController.close();
    _alertsController.close();
    _workersController.close();
    _scanHistoryController.close();
  }
}

class FCMService {
  static final FCMService _instance = FCMService._internal();
  factory FCMService() => _instance;
  FCMService._internal();

  final _notificationsController =
      StreamController<Map<String, String>>.broadcast();
  Stream<Map<String, String>> get notificationStream =>
      _notificationsController.stream;

  final List<Map<String, String>> _notifications = [];
  List<Map<String, String>> get notifications => List.from(_notifications);

  /// Simulates FCM local notification — replace with firebase_messaging in production
  void sendLocalNotification({required String title, required String body}) {
    final notification = {
      'title': title,
      'body': body,
      'id': 'notif_${DateTime.now().millisecondsSinceEpoch}',
      'timestamp': DateTime.now().toIso8601String(),
    };
    _notifications.insert(0, notification);
    _notificationsController.add(notification);
    if (kDebugMode) {
      debugPrint('[FCM] $title: $body');
    }
  }

  void dispose() {
    _notificationsController.close();
  }
}
