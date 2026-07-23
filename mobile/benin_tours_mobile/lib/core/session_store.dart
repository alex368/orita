import 'package:shared_preferences/shared_preferences.dart';

class SessionStore {
  static const _sessionTokenKey = 'benin_tours_session_token';
  static const _emailKey = 'benin_tours_email';

  Future<String?> readToken() async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getString(_sessionTokenKey);
  }

  Future<String?> readEmail() async {
    final preferences = await SharedPreferences.getInstance();
    return preferences.getString(_emailKey);
  }

  Future<void> saveSession({
    required String token,
    required String email,
  }) async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.setString(_sessionTokenKey, token);
    await preferences.setString(_emailKey, email);
  }

  Future<void> clear() async {
    final preferences = await SharedPreferences.getInstance();
    await preferences.remove(_sessionTokenKey);
    await preferences.remove(_emailKey);
  }
}
