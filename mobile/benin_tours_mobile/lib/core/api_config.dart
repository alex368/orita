class ApiConfig {
  const ApiConfig({required this.baseUrl, required this.bearerToken});

  factory ApiConfig.fromEnvironment() {
    const rawBaseUrl = String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'http://127.0.0.1:8080/api',
    );

    return ApiConfig(
      baseUrl: _normalizeApiBaseUrl(rawBaseUrl),
      bearerToken: const String.fromEnvironment(
        'API_BEARER_TOKEN',
        defaultValue: 'dev-benintours-token',
      ),
    );
  }

  final String baseUrl;
  final String bearerToken;

  static String _normalizeApiBaseUrl(String value) {
    final trimmed = value.trim();
    final base = trimmed.endsWith('/')
        ? trimmed.substring(0, trimmed.length - 1)
        : trimmed;

    return base.endsWith('/api') ? base : '$base/api';
  }
}
