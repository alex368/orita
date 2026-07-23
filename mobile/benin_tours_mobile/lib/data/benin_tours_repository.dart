import '../core/api_client.dart';
import 'models.dart';

class LoginResult {
  const LoginResult({required this.sessionToken, required this.client});

  final String sessionToken;
  final ClientAccount client;
}

class BeninToursRepository {
  BeninToursRepository({required this.api});

  final ApiClient api;

  Future<void> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String phone,
  }) async {
    await api.postMap(
      '/client-auth/register',
      bearer: false,
      body: {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
        'phonePrefix': '+229',
        'phone': phone,
      },
    );
  }

  Future<void> requestLoginCode({
    required String email,
    required String password,
  }) async {
    await api.postMap(
      '/client-auth/request-login-code',
      bearer: false,
      body: {'email': email, 'password': password},
    );
  }

  Future<LoginResult> verifyCode({
    required String email,
    required String code,
  }) async {
    final json = await api.postMap(
      '/client-auth/verify-code',
      bearer: false,
      body: {'email': email, 'code': code},
    );
    return LoginResult(
      sessionToken: json['sessionToken']?.toString() ?? '',
      client: ClientAccount.fromJson(json['client'] as Map<String, dynamic>),
    );
  }

  Future<void> requestPasswordReset({required String email}) async {
    await api.postMap(
      '/client-auth/request-password-reset',
      bearer: false,
      body: {'email': email},
    );
  }

  Future<void> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async {
    await api.postMap(
      '/client-auth/reset-password',
      bearer: false,
      body: {'email': email, 'code': code, 'newPassword': newPassword},
    );
  }

  Future<ClientAccount> session(String sessionToken) async {
    final json = await api.postMap(
      '/client-auth/session',
      bearer: false,
      body: {'sessionToken': sessionToken},
    );
    return ClientAccount.fromJson(json['client'] as Map<String, dynamic>);
  }

  Future<ClientAccount> updateClientProfile({
    required String sessionToken,
    required String firstName,
    required String lastName,
    required String phone,
  }) async {
    final json = await api.patchMap(
      '/client-auth/profile',
      bearer: false,
      body: {
        'sessionToken': sessionToken,
        'firstName': firstName,
        'lastName': lastName,
        'phonePrefix': '+229',
        'phone': phone,
      },
    );
    return ClientAccount.fromJson(json['client'] as Map<String, dynamic>);
  }

  Future<void> changeClientPassword({
    required String sessionToken,
    required String currentPassword,
    required String newPassword,
  }) async {
    await api.patchMap(
      '/client-auth/password',
      bearer: false,
      body: {
        'sessionToken': sessionToken,
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );
  }

  Future<List<CatalogueItem>> tours() async {
    final json = await api.getMap('/tour-search', query: {'limit': '8'});
    return _items(json).map(CatalogueItem.tour).toList();
  }

  Future<List<CatalogueItem>> drivers() async {
    final json = await api.getMap('/driver-search', query: {'limit': '8'});
    return _items(json).map(CatalogueItem.driver).toList();
  }

  Future<List<CatalogueItem>> goodPlans() async {
    final json = await api.getMap('/bon-plan-search', query: {'limit': '8'});
    return _items(json).map(CatalogueItem.goodPlan).toList();
  }

  Future<List<CatalogueItem>> rentals() async {
    final json = await api.getMap(
      '/rental-search',
      query: {'limit': '8', 'published': '1'},
    );
    return _items(json).map(CatalogueItem.rental).toList();
  }

  Future<List<BookingItem>> bookingsFor(ClientAccount client) async {
    final json = await api.getMap(
      '/booking-search',
      query: {'q': client.email, 'limit': '20'},
    );
    final bookings = _items(json)
        .map(BookingItem.fromJson)
        .where((booking) => booking.customerEmail == client.email)
        .toList();

    if (bookings.isNotEmpty) {
      return bookings;
    }

    return _demoBookingsFor(client);
  }

  String documentUrl(BookingItem booking, String kind) {
    return api.absoluteApiUrl('/bookings/${booking.id}/documents/$kind');
  }

  Future<String> createCatalogueBooking({
    required ClientAccount client,
    required CatalogueItem item,
    required CatalogueBookingOption option,
    required DateTime date,
  }) async {
    final json = await api.postMap(
      '/bookings',
      body: {
        'type': item.kind == 'driver' ? 'driver' : 'tour',
        if (item.kind == 'tour') 'tour': '/api/tours/${item.id}',
        if (item.kind == 'driver') 'driver': '/api/drivers/${item.id}',
        'date': date.toIso8601String(),
        'duration': option.days,
        'price': option.priceFcfa,
        'status': 'pending',
        'providerStatus': 'pending',
        'paymentStatus': 'paid',
        'refundAmount': 0,
        'customerName': client.fullName,
        'customerEmail': client.email,
        'customerPhone': '${client.phonePrefix} ${client.phone}'.trim(),
      },
    );

    return json['id']?.toString() ?? '';
  }

  Future<String> createRentalBooking({
    required String sessionToken,
    required CatalogueItem item,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    final json = await api.postMap(
      '/rental-bookings',
      body: {
        'sessionToken': sessionToken,
        'rentalId': item.id,
        'startDate': _dateOnly(startDate),
        'endDate': _dateOnly(endDate),
        'message':
            'Demande de réservation mobile du ${_dateOnly(startDate)} au ${_dateOnly(endDate)}.',
      },
    );

    return json['id']?.toString() ?? '';
  }

  Future<ProviderProfile> providerProfile(String sessionToken) async {
    final json = await api.getMap(
      '/mobile/provider/profile',
      clientSessionToken: sessionToken,
    );
    return ProviderProfile.fromJson(json);
  }

  Future<ProviderDashboard> providerDashboard(String sessionToken) async {
    final json = await api.getMap(
      '/mobile/provider/dashboard',
      clientSessionToken: sessionToken,
    );
    return ProviderDashboard.fromJson(json);
  }

  Future<List<ProviderMission>> providerMissions(String sessionToken) async {
    final json = await api.getList(
      '/mobile/provider/missions',
      clientSessionToken: sessionToken,
    );
    return json
        .whereType<Map<String, dynamic>>()
        .map(ProviderMission.fromJson)
        .toList();
  }

  Future<List<LedgerItem>> providerLedger(String sessionToken) async {
    final json = await api.getList(
      '/mobile/provider/ledger',
      clientSessionToken: sessionToken,
    );
    return json
        .whereType<Map<String, dynamic>>()
        .map(LedgerItem.fromJson)
        .toList();
  }

  Future<void> decideMission({
    required String sessionToken,
    required String missionId,
    required String decision,
  }) async {
    await api.postMap(
      '/mobile/provider/missions/$missionId/decision',
      clientSessionToken: sessionToken,
      body: {'decision': decision},
    );
  }

  List<Map<String, dynamic>> _items(Map<String, dynamic> json) {
    final items = json['items'];
    if (items is List) {
      return items.whereType<Map<String, dynamic>>().toList();
    }
    return const [];
  }

  List<BookingItem> _demoBookingsFor(ClientAccount client) {
    return [
      BookingItem.demo(
        client: client,
        id: 'TEST-${client.id.isEmpty ? '001' : client.id}-A',
        type: 'tour',
        title: 'Parcours test Ganvié',
        date: '2026-07-24',
        duration: '1 jour',
        price: '69 EUR',
        status: 'confirmed',
      ),
      BookingItem.demo(
        client: client,
        id: 'TEST-${client.id.isEmpty ? '001' : client.id}-B',
        type: 'driver',
        title: 'Chauffeur test Cotonou',
        date: '2026-07-25',
        duration: '2 jours',
        price: '76 EUR',
        status: 'pending',
      ),
    ];
  }
}

String _dateOnly(DateTime date) =>
    '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
