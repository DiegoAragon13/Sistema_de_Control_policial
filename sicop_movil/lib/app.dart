import 'package:flutter/material.dart';
import 'theme.dart';
import 'screens/home_screen.dart';

class SicopApp extends StatelessWidget {
  const SicopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Seguridad Pública App',
      debugShowCheckedModeBanner: false,
      theme: sicopTheme,
      home: const HomeScreen(),
    );
  }
}
