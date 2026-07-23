import 'package:benin_tours_mobile/main.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('shows the ORITA authentication screen', (tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const BeninToursApp());
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('ORITA'), findsOneWidget);
    expect(find.text('Voyage, guides et services'), findsOneWidget);

    await tester.pump(const Duration(milliseconds: 1600));
    await tester.pumpAndSettle();

    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Mot de passe'), findsOneWidget);
    expect(find.text('Se souvenir de moi'), findsOneWidget);
  });
}
