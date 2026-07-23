class ClientAccount {
  const ClientAccount({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phonePrefix,
    required this.phone,
    required this.verified,
  });

  factory ClientAccount.fromJson(Map<String, dynamic> json) {
    return ClientAccount(
      id: json['id']?.toString() ?? '',
      firstName: json['firstName']?.toString() ?? '',
      lastName: json['lastName']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phonePrefix: json['phonePrefix']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      verified: json['verified'] == true,
    );
  }

  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String phonePrefix;
  final String phone;
  final bool verified;

  String get fullName {
    final name = '$firstName $lastName'.trim();
    return name.isEmpty ? email : name;
  }
}

class CatalogueItem {
  const CatalogueItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.details,
    required this.kind,
    required this.bookingOptions,
    this.imageUrls = const [],
    this.badge,
    this.price,
    this.location,
    this.primaryInfo,
    this.secondaryInfo,
    this.phone,
    this.whatsapp,
  });

  factory CatalogueItem.tour(Map<String, dynamic> json) {
    final durationOptions = _tourDurationOptions(json['durations']);
    final durations = durationOptions
        .map((duration) => duration.fullLabel)
        .join(' / ');
    final firstDuration = durationOptions.isEmpty
        ? null
        : durationOptions.first;
    final summary = json['summary']?.toString().trim() ?? '';
    final highlights = _stringList(json['highlights']);
    final included = _stringList(json['included']);
    final guide = json['guide'] is Map ? json['guide'] as Map : null;
    final guideName = guide?['fullName']?.toString() ?? '';
    final location = _firstNonEmpty([
      json['location'],
      json['city'],
      json['zone'],
      guide?['guideZone'],
      guide?['location'],
      _locationFromTitle(json['title']?.toString() ?? ''),
    ]);

    return CatalogueItem(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Parcours',
      subtitle: summary.isNotEmpty ? summary : durations,
      imageUrl: _imageUrl(json['image']),
      kind: 'tour',
      bookingOptions: durationOptions
          .map(
            (duration) => CatalogueBookingOption(
              days: duration.days,
              label: duration.fullLabel,
              priceFcfa: duration.priceFcfa,
            ),
          )
          .toList(),
      details: [
        if (durations.isNotEmpty) durations,
        if (guideName.isNotEmpty) 'Guide : $guideName',
        if (highlights.isNotEmpty) 'À voir : ${highlights.take(2).join(', ')}',
        if (included.isNotEmpty) 'Inclus : ${included.take(2).join(', ')}',
      ],
      badge: firstDuration?.badgeLabel ?? 'Parcours',
      location: location,
      primaryInfo: guideName.isEmpty ? null : guideName,
      secondaryInfo: highlights.isEmpty ? null : highlights.first,
    );
  }

  factory CatalogueItem.driver(Map<String, dynamic> json) {
    final dailyPrice = _moneyFcfa(json['dailyPriceFcfa']);
    final monthlyPrice = _moneyFcfa(json['monthlyPriceFcfa']);
    final phone = json['phone']?.toString() ?? '';
    final whatsapp = json['whatsapp']?.toString() ?? '';
    final location = _firstNonEmpty([json['zone'], json['location']]);

    return CatalogueItem(
      id: json['id']?.toString() ?? '',
      title: json['name']?.toString() ?? 'Chauffeur',
      subtitle:
          '${json['zone'] ?? 'Zone non renseignée'} · ${json['vehicleType'] ?? 'Véhicule'}',
      imageUrl: _imageUrl(json['image']),
      kind: 'driver',
      bookingOptions: [
        if (_positiveInt(json['dailyPriceFcfa']) > 0)
          CatalogueBookingOption(
            days: 1,
            label: '1 journée à ${_moneyFcfa(json['dailyPriceFcfa'])}',
            priceFcfa: _positiveInt(json['dailyPriceFcfa']),
          ),
        if (_positiveInt(json['monthlyPriceFcfa']) > 0)
          CatalogueBookingOption(
            days: 30,
            label: '1 mois à ${_moneyFcfa(json['monthlyPriceFcfa'])}',
            priceFcfa: _positiveInt(json['monthlyPriceFcfa']),
          ),
      ],
      details: [
        'Zone : ${json['zone'] ?? 'Non renseignée'}',
        'Véhicule : ${json['vehicleType'] ?? 'À confirmer'}',
        if (dailyPrice.isNotEmpty) 'Jour : $dailyPrice',
        if (monthlyPrice.isNotEmpty) 'Mois : $monthlyPrice',
      ],
      badge: json['available'] == true ? 'Disponible' : 'Indisponible',
      price: dailyPrice,
      location: location,
      primaryInfo: json['vehicleType']?.toString(),
      secondaryInfo: dailyPrice.isEmpty ? null : dailyPrice,
      phone: phone.isEmpty ? null : phone,
      whatsapp: whatsapp.isEmpty ? null : whatsapp,
    );
  }

  factory CatalogueItem.goodPlan(Map<String, dynamic> json) {
    final description = json['description']?.toString() ?? '';
    final location = _firstNonEmpty([
      json['location'],
      json['city'],
      json['zone'],
      _locationFromText(description),
    ]);

    return CatalogueItem(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Bon plan',
      subtitle: description,
      imageUrl: _imageUrl(json['image']),
      kind: 'goodPlan',
      bookingOptions: const [],
      details: [
        'Catégorie : ${json['category']?.toString() ?? 'Bon plan'}',
        if (description.isNotEmpty) description,
      ],
      badge: json['category']?.toString(),
      location: location,
      primaryInfo: json['category']?.toString(),
      secondaryInfo: description,
    );
  }

  factory CatalogueItem.rental(Map<String, dynamic> json) {
    final description = json['description']?.toString() ?? '';
    final location = _firstNonEmpty([
      json['location'],
      json['tenant']?['location'],
    ]);
    final dailyPrice = _moneyFcfa(json['dailyPriceFcfa']);
    final monthlyPrice = _moneyFcfa(json['monthlyPriceFcfa']);
    final amenities = _stringList(json['amenities']);
    final tenant = json['tenant'] is Map ? json['tenant'] as Map : null;
    final tenantName = tenant?['fullName']?.toString() ?? '';
    final imageUrls = _imageUrls(json['images']);

    return CatalogueItem(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Location',
      subtitle: description.isNotEmpty ? description : location ?? '',
      imageUrl: imageUrls.isNotEmpty ? imageUrls.first : _imageUrl(json['image']),
      imageUrls: imageUrls,
      kind: 'rental',
      bookingOptions: [
        if (_positiveInt(json['dailyPriceFcfa']) > 0)
          CatalogueBookingOption(
            days: 1,
            label: 'Jour à ${_moneyFcfa(json['dailyPriceFcfa'])}',
            priceFcfa: _positiveInt(json['dailyPriceFcfa']),
          ),
        if (_positiveInt(json['monthlyPriceFcfa']) > 0)
          CatalogueBookingOption(
            days: 30,
            label: 'Mois à ${_moneyFcfa(json['monthlyPriceFcfa'])}',
            priceFcfa: _positiveInt(json['monthlyPriceFcfa']),
          ),
      ],
      details: [
        if (location != null) 'Localisation : $location',
        if (dailyPrice.isNotEmpty) 'Jour : $dailyPrice',
        if (monthlyPrice.isNotEmpty) 'Mois : $monthlyPrice',
        if (tenantName.isNotEmpty) 'Propriétaire : $tenantName',
        if (amenities.isNotEmpty)
          'Équipements : ${amenities.take(2).join(', ')}',
      ],
      badge: json['category']?.toString() ?? 'Location',
      price: dailyPrice,
      location: location,
      primaryInfo: dailyPrice.isEmpty ? null : dailyPrice,
      secondaryInfo: monthlyPrice.isEmpty ? tenantName : monthlyPrice,
    );
  }

  final String id;
  final String title;
  final String subtitle;
  final String imageUrl;
  final List<String> imageUrls;
  final String kind;
  final List<CatalogueBookingOption> bookingOptions;
  final List<String> details;
  final String? badge;
  final String? price;
  final String? location;
  final String? primaryInfo;
  final String? secondaryInfo;
  final String? phone;
  final String? whatsapp;

  bool get canReserve => kind == 'tour' || kind == 'driver' || kind == 'rental';
}

class CatalogueBookingOption {
  const CatalogueBookingOption({
    required this.days,
    required this.label,
    required this.priceFcfa,
  });

  final int days;
  final String label;
  final int priceFcfa;
}

class BookingItem {
  const BookingItem({
    required this.id,
    required this.type,
    required this.title,
    required this.date,
    required this.duration,
    required this.price,
    required this.status,
    required this.customerEmail,
    required this.qrCodePayload,
    this.tourId,
    this.driverId,
  });

  factory BookingItem.fromJson(Map<String, dynamic> json) {
    final tour = json['tour'];
    final driver = json['driver'];
    return BookingItem(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      title: tour is Map
          ? (tour['title']?.toString() ?? 'Parcours')
          : driver is Map
          ? (driver['name']?.toString() ?? 'Chauffeur')
          : 'Réservation',
      date: json['date']?.toString() ?? '',
      duration: json['duration']?.toString() ?? '',
      price: _money(json['price'], 'EUR'),
      status: json['status']?.toString() ?? 'nouvelle',
      customerEmail: json['customerEmail']?.toString() ?? '',
      tourId: tour is Map ? tour['id']?.toString() : null,
      driverId: driver is Map ? driver['id']?.toString() : null,
      qrCodePayload:
          json['qrCodePayload']?.toString() ??
          _demoQrPayload(
            id: json['id']?.toString() ?? '',
            customerEmail: json['customerEmail']?.toString() ?? '',
            type: json['type']?.toString() ?? 'tour',
            title: tour is Map
                ? (tour['title']?.toString() ?? 'Parcours')
                : driver is Map
                ? (driver['name']?.toString() ?? 'Chauffeur')
                : 'Réservation',
            status: json['status']?.toString() ?? 'nouvelle',
            date: json['date']?.toString() ?? '',
            token: json['qrCodeToken']?.toString(),
          ),
    );
  }

  factory BookingItem.demo({
    required ClientAccount client,
    required String id,
    required String type,
    required String title,
    required String date,
    required String duration,
    required String price,
    required String status,
    String? tourId,
    String? driverId,
  }) {
    return BookingItem(
      id: id,
      type: type,
      title: title,
      date: date,
      duration: duration,
      price: price,
      status: status,
      customerEmail: client.email,
      tourId: tourId,
      driverId: driverId,
      qrCodePayload: _demoQrPayload(
        id: id,
        customerEmail: client.email,
        type: type,
        title: title,
        status: status,
        date: date,
      ),
    );
  }

  final String id;
  final String type;
  final String title;
  final String date;
  final String duration;
  final String price;
  final String status;
  final String customerEmail;
  final String qrCodePayload;
  final String? tourId;
  final String? driverId;
}

String _demoQrPayload({
  required String id,
  required String customerEmail,
  required String type,
  required String title,
  required String status,
  required String date,
  String? token,
}) {
  final bookingId = id.isEmpty ? 'demo' : id;
  final qrToken = token?.isNotEmpty == true ? token! : 'ORITA-DEMO-$bookingId';

  return Uri(
    scheme: 'benintours',
    host: 'reservations',
    path: '/$bookingId/validate',
    queryParameters: {
      'token': qrToken,
      'mode': 'test',
      'email': customerEmail,
      'type': type,
      'title': title,
      'status': status,
      'date': date,
    },
  ).toString();
}

class ProviderProfile {
  const ProviderProfile({
    required this.accountId,
    required this.fullName,
    required this.roles,
    required this.validationStatus,
    required this.location,
    required this.zone,
  });

  factory ProviderProfile.fromJson(Map<String, dynamic> json) {
    return ProviderProfile(
      accountId: json['accountId']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? 'Compte prestataire',
      roles: json['roles'] is List
          ? (json['roles'] as List).map((role) => role.toString()).toList()
          : const [],
      validationStatus: json['validationStatus']?.toString() ?? 'pending',
      location: json['location']?.toString() ?? '',
      zone: json['zone']?.toString() ?? '',
    );
  }

  final String accountId;
  final String fullName;
  final List<String> roles;
  final String validationStatus;
  final String location;
  final String zone;

  bool get isDriver => roles.any((role) => role.contains('driver'));
  bool get isGuide => roles.any((role) => role.contains('guide'));
}

class ProviderDashboard {
  const ProviderDashboard({
    required this.totalEarning,
    required this.monthEarning,
    required this.pendingMissions,
    required this.confirmedMissions,
    required this.completedMissions,
  });

  factory ProviderDashboard.fromJson(Map<String, dynamic> json) {
    return ProviderDashboard(
      totalEarning: _money(json['totalEarning'], 'EUR'),
      monthEarning: _money(json['monthEarning'], 'EUR'),
      pendingMissions: _intValue(json['pendingMissions']),
      confirmedMissions: _intValue(json['confirmedMissions']),
      completedMissions: _intValue(json['completedMissions']),
    );
  }

  final String totalEarning;
  final String monthEarning;
  final int pendingMissions;
  final int confirmedMissions;
  final int completedMissions;
}

class ProviderMission {
  const ProviderMission({
    required this.id,
    required this.type,
    required this.serviceName,
    required this.customerName,
    required this.date,
    required this.amount,
    required this.earning,
    required this.bookingStatus,
    required this.providerStatus,
    required this.qrCodePayload,
  });

  factory ProviderMission.fromJson(Map<String, dynamic> json) {
    return ProviderMission(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      serviceName: json['serviceName']?.toString() ?? 'Mission',
      customerName: json['customerName']?.toString() ?? 'Client',
      date: json['date']?.toString() ?? '',
      amount: _money(json['amount'], 'EUR'),
      earning: _money(json['earning'], 'EUR'),
      bookingStatus: json['bookingStatus']?.toString() ?? '',
      providerStatus: json['providerStatus']?.toString() ?? '',
      qrCodePayload: json['qrCodePayload']?.toString() ?? '',
    );
  }

  final String id;
  final String type;
  final String serviceName;
  final String customerName;
  final String date;
  final String amount;
  final String earning;
  final String bookingStatus;
  final String providerStatus;
  final String qrCodePayload;
}

class LedgerItem {
  const LedgerItem({
    required this.id,
    required this.label,
    required this.invoiceNumber,
    required this.amount,
    required this.paymentStatus,
  });

  factory LedgerItem.fromJson(Map<String, dynamic> json) {
    return LedgerItem(
      id: json['id']?.toString() ?? '',
      label: json['label']?.toString() ?? 'Paiement',
      invoiceNumber: json['invoiceNumber']?.toString() ?? '',
      amount: _money(json['amount'], 'EUR'),
      paymentStatus: json['paymentStatus']?.toString() ?? '',
    );
  }

  final String id;
  final String label;
  final String invoiceNumber;
  final String amount;
  final String paymentStatus;
}

String _imageUrl(dynamic image) {
  if (image is Map<String, dynamic>) {
    return image['url']?.toString() ?? '';
  }
  return '';
}

List<String> _imageUrls(dynamic images) {
  if (images is! List) {
    return const [];
  }

  return images
      .map(_imageUrl)
      .where((url) => url.trim().isNotEmpty)
      .toSet()
      .toList();
}

String? _firstNonEmpty(List<dynamic> values) {
  for (final value in values) {
    final text = value?.toString().trim() ?? '';
    if (text.isNotEmpty) {
      return text;
    }
  }
  return null;
}

String? _locationFromTitle(String title) {
  final parts = title.split(RegExp(r'\s[-–]\s'));
  if (parts.length > 1) {
    return parts.last.trim();
  }
  return _locationFromText(title);
}

String? _locationFromText(String text) {
  const knownLocations = [
    'Cotonou',
    'Ganvié',
    'Ouidah',
    'Pendjari',
    'Porto-Novo',
    'Parakou',
  ];

  for (final location in knownLocations) {
    if (text.toLowerCase().contains(location.toLowerCase())) {
      return location;
    }
  }

  return null;
}

String _money(dynamic value, String currency) {
  final amount = int.tryParse(value?.toString() ?? '') ?? 0;
  return '$amount $currency';
}

int _intValue(dynamic value) => int.tryParse(value?.toString() ?? '') ?? 0;

List<String> _stringList(dynamic value) {
  if (value is! List) {
    return const [];
  }

  return value
      .map((item) => item.toString().trim())
      .where((item) => item.isNotEmpty)
      .toList();
}

String _moneyFcfa(dynamic value) {
  final amount = _positiveInt(value);
  return amount > 0 ? '${_formatInt(amount)} FCFA' : '';
}

List<_TourDurationOption> _tourDurationOptions(dynamic value) {
  if (value is! List) {
    return const [];
  }

  return value
      .whereType<Map>()
      .map((item) => _TourDurationOption.tryFromMap(item))
      .whereType<_TourDurationOption>()
      .toList();
}

class _TourDurationOption {
  const _TourDurationOption({required this.days, required this.priceFcfa});

  static _TourDurationOption? tryFromMap(Map<dynamic, dynamic> json) {
    final days = _positiveInt(json['days']);
    final priceFcfa = _positiveInt(json['priceFcfa']) > 0
        ? _positiveInt(json['priceFcfa'])
        : _positiveInt(json['price']);

    if (days <= 0 || priceFcfa <= 0) {
      return null;
    }

    return _TourDurationOption(days: days, priceFcfa: priceFcfa);
  }

  final int days;
  final int priceFcfa;

  String get dayLabel => '$days jour${days > 1 ? 's' : ''}';
  String get priceLabel => '${_formatInt(priceFcfa)} FCFA';
  String get badgeLabel => '$dayLabel · $priceLabel';
  String get fullLabel => '$dayLabel à $priceLabel';
}

int _positiveInt(dynamic value) {
  if (value is int) {
    return value;
  }
  if (value is double) {
    return value.round();
  }
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

String _formatInt(int value) {
  final text = value.toString();
  final buffer = StringBuffer();
  for (var index = 0; index < text.length; index += 1) {
    final remaining = text.length - index;
    buffer.write(text[index]);
    if (remaining > 1 && remaining % 3 == 1) {
      buffer.write(' ');
    }
  }
  return buffer.toString();
}
