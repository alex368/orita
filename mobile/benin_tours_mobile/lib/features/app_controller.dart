import 'package:flutter/foundation.dart';

import '../core/api_client.dart';
import '../core/session_store.dart';
import '../data/benin_tours_repository.dart';
import '../data/models.dart';

class AppController extends ChangeNotifier {
  AppController({required this.repository, required this.sessionStore});

  final BeninToursRepository repository;
  final SessionStore sessionStore;

  bool isBooting = true;
  bool isLoading = false;
  String? errorMessage;
  String? sessionToken;
  String? pendingEmail;
  ClientAccount? client;
  ProviderProfile? providerProfile;
  ProviderDashboard? providerDashboard;
  List<CatalogueItem> tours = const [];
  List<CatalogueItem> drivers = const [];
  List<CatalogueItem> rentals = const [];
  List<CatalogueItem> goodPlans = const [];
  List<BookingItem> bookings = const [];
  List<ProviderMission> providerMissions = const [];
  List<LedgerItem> ledger = const [];

  bool get isAuthenticated => sessionToken != null && client != null;
  bool get hasProviderAccess => providerProfile != null;

  String get providerLabel {
    final profile = providerProfile;
    if (profile == null) {
      return 'Pro';
    }
    if (profile.isDriver && profile.isGuide) {
      return 'Guide & chauffeur';
    }
    if (profile.isDriver) {
      return 'Chauffeur';
    }
    return 'Guide';
  }

  Future<void> restoreSession() async {
    isBooting = true;
    notifyListeners();

    final String? token;
    try {
      token = await sessionStore.readToken();
    } on Object {
      isBooting = false;
      notifyListeners();
      return;
    }

    if (token == null || token.isEmpty) {
      isBooting = false;
      notifyListeners();
      return;
    }

    try {
      sessionToken = token;
      client = await repository.session(token);
      await refreshAll();
    } on Object {
      await logout();
    } finally {
      isBooting = false;
      notifyListeners();
    }
  }

  Future<void> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String phone,
  }) async {
    await _run(() async {
      await repository.register(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        phone: phone,
      );
      pendingEmail = email;
    });
  }

  Future<void> requestCode({
    required String email,
    required String password,
  }) async {
    await _run(() async {
      await repository.requestLoginCode(email: email, password: password);
      pendingEmail = email;
    });
  }

  Future<void> verifyCode(String code) async {
    final email = pendingEmail;
    if (email == null || email.isEmpty) {
      errorMessage = 'Email manquant pour la vérification.';
      notifyListeners();
      return;
    }

    await _run(() async {
      final result = await repository.verifyCode(email: email, code: code);
      sessionToken = result.sessionToken;
      client = result.client;
      await sessionStore.saveSession(token: result.sessionToken, email: email);
      await refreshAll();
    });
  }

  Future<void> requestPasswordReset({required String email}) async {
    await _run(() async {
      await repository.requestPasswordReset(email: email);
      pendingEmail = email;
    });
  }

  Future<void> resetPassword({
    required String code,
    required String newPassword,
  }) async {
    final email = pendingEmail;
    if (email == null || email.isEmpty) {
      errorMessage = 'Email manquant pour la réinitialisation.';
      notifyListeners();
      return;
    }

    await _run(() async {
      await repository.resetPassword(
        email: email,
        code: code,
        newPassword: newPassword,
      );
    });
  }

  Future<void> refreshAll() async {
    final currentClient = client;
    final token = sessionToken;
    if (currentClient == null || token == null) {
      return;
    }

    tours = await repository.tours();
    drivers = await repository.drivers();
    rentals = await repository.rentals();
    goodPlans = await repository.goodPlans();
    bookings = await repository.bookingsFor(currentClient);

    try {
      providerProfile = await repository.providerProfile(token);
      providerDashboard = await repository.providerDashboard(token);
      providerMissions = await repository.providerMissions(token);
      ledger = await repository.providerLedger(token);
    } on ApiException {
      providerProfile = null;
      providerDashboard = null;
      providerMissions = const [];
      ledger = const [];
    }
  }

  String documentUrl(BookingItem booking, String kind) {
    return repository.documentUrl(booking, kind);
  }

  Future<String?> reserveCatalogueItem({
    required CatalogueItem item,
    required CatalogueBookingOption option,
    required DateTime date,
  }) async {
    final currentClient = client;
    if (currentClient == null) {
      return null;
    }

    String? bookingId;
    await _run(() async {
      bookingId = await repository.createCatalogueBooking(
        client: currentClient,
        item: item,
        option: option,
        date: date,
      );
      bookings = await repository.bookingsFor(currentClient);
    });

    return bookingId;
  }

  Future<String?> reserveRentalItem({
    required CatalogueItem item,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    final token = sessionToken;
    final currentClient = client;
    if (token == null || currentClient == null) {
      return null;
    }

    String? bookingId;
    await _run(() async {
      bookingId = await repository.createRentalBooking(
        sessionToken: token,
        item: item,
        startDate: startDate,
        endDate: endDate,
      );
      bookings = await repository.bookingsFor(currentClient);
    });

    return bookingId;
  }

  Future<void> decideMission(ProviderMission mission, String decision) async {
    final token = sessionToken;
    if (token == null) {
      return;
    }
    await _run(() async {
      await repository.decideMission(
        sessionToken: token,
        missionId: mission.id,
        decision: decision,
      );
      providerMissions = await repository.providerMissions(token);
      providerDashboard = await repository.providerDashboard(token);
    });
  }

  Future<void> updateProfile({
    required String firstName,
    required String lastName,
    required String phone,
  }) async {
    final token = sessionToken;
    if (token == null) {
      return;
    }
    await _run(() async {
      client = await repository.updateClientProfile(
        sessionToken: token,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
      );
    });
  }

  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final token = sessionToken;
    if (token == null) {
      return false;
    }

    var success = false;
    await _run(() async {
      await repository.changeClientPassword(
        sessionToken: token,
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
      success = true;
    });

    return success && errorMessage == null;
  }

  Future<void> logout() async {
    await sessionStore.clear();
    sessionToken = null;
    client = null;
    providerProfile = null;
    providerDashboard = null;
    tours = const [];
    drivers = const [];
    rentals = const [];
    goodPlans = const [];
    bookings = const [];
    providerMissions = const [];
    ledger = const [];
    isBooting = false;
    notifyListeners();
  }

  Future<void> _run(Future<void> Function() action) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();
    try {
      await action();
    } on ApiException catch (exception) {
      errorMessage = exception.message;
    } on Object {
      errorMessage = 'Une erreur est survenue.';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
