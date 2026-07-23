import 'dart:convert';

import 'package:http/http.dart' as http;

import 'api_config.dart';

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({required this.config, http.Client? httpClient})
    : _httpClient = httpClient ?? http.Client();

  final ApiConfig config;
  final http.Client _httpClient;

  Uri _uri(String path, [Map<String, String?> query = const {}]) {
    final base = config.baseUrl.endsWith('/')
        ? config.baseUrl.substring(0, config.baseUrl.length - 1)
        : config.baseUrl;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    final uri = Uri.parse('$base$cleanPath');
    final queryParameters = <String, String>{};
    for (final entry in query.entries) {
      if (entry.value != null && entry.value!.isNotEmpty) {
        queryParameters[entry.key] = entry.value!;
      }
    }
    return uri.replace(
      queryParameters: {...uri.queryParameters, ...queryParameters},
    );
  }

  Map<String, String> _headers({
    bool bearer = true,
    String? clientSessionToken,
  }) {
    final headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      if (bearer) 'Authorization': 'Bearer ${config.bearerToken}',
    };
    if (clientSessionToken != null) {
      headers['X-Client-Session-Token'] = clientSessionToken;
    }
    return headers;
  }

  Future<Map<String, dynamic>> getMap(
    String path, {
    Map<String, String?> query = const {},
    bool bearer = true,
    String? clientSessionToken,
  }) async {
    final response = await _httpClient.get(
      _uri(path, query),
      headers: _headers(bearer: bearer, clientSessionToken: clientSessionToken),
    );
    return _decodeMap(response);
  }

  Future<List<dynamic>> getList(
    String path, {
    Map<String, String?> query = const {},
    bool bearer = true,
    String? clientSessionToken,
  }) async {
    final response = await _httpClient.get(
      _uri(path, query),
      headers: _headers(bearer: bearer, clientSessionToken: clientSessionToken),
    );
    final decoded = _decode(response);
    if (decoded is List<dynamic>) {
      return decoded;
    }
    throw const ApiException('Réponse API inattendue.');
  }

  Future<Map<String, dynamic>> postMap(
    String path, {
    Map<String, dynamic> body = const {},
    bool bearer = true,
    String? clientSessionToken,
  }) async {
    final response = await _httpClient.post(
      _uri(path),
      headers: _headers(bearer: bearer, clientSessionToken: clientSessionToken),
      body: jsonEncode(body),
    );
    return _decodeMap(response);
  }

  Future<Map<String, dynamic>> patchMap(
    String path, {
    Map<String, dynamic> body = const {},
    bool bearer = true,
    String? clientSessionToken,
  }) async {
    final response = await _httpClient.patch(
      _uri(path),
      headers: _headers(bearer: bearer, clientSessionToken: clientSessionToken),
      body: jsonEncode(body),
    );
    return _decodeMap(response);
  }

  String absoluteApiUrl(String path) => _uri(path).toString();

  Map<String, dynamic> _decodeMap(http.Response response) {
    final decoded = _decode(response);
    if (decoded is Map<String, dynamic>) {
      return decoded;
    }
    throw const ApiException('Réponse API inattendue.');
  }

  dynamic _decode(http.Response response) {
    final body = response.body.isEmpty ? '{}' : response.body;
    final decoded = jsonDecode(body);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = decoded is Map<String, dynamic>
          ? (decoded['message'] ?? decoded['detail'] ?? 'Erreur API')
          : 'Erreur API';
      throw ApiException(message.toString(), statusCode: response.statusCode);
    }

    return decoded;
  }
}
