import 'package:flutter/material.dart';

// Paleta SICOP
const azulOscuro = Color(0xFF111844);
const azulMedio = Color(0xFF4B5694);
const azulClaro = Color(0xFF7288AE);
const beige = Color(0xFFEAE0CF);
const grisFondo = Color(0xFFF7F8FC);
const grisBorde = Color(0xFFE4E7ED);
const grisTexto = Color(0xFF64748B);
const verde = Color(0xFF10B981);
const rojo = Color(0xFFEF4444);

final sicopTheme = ThemeData(
  useMaterial3: true,
  fontFamily: 'Inter',
  scaffoldBackgroundColor: grisFondo,
  colorScheme: ColorScheme.fromSeed(
    seedColor: azulMedio,
    primary: azulMedio,
    secondary: azulClaro,
    surface: Colors.white,
    error: rojo,
  ),
  appBarTheme: const AppBarTheme(
    backgroundColor: azulOscuro,
    foregroundColor: Colors.white,
    elevation: 0,
    centerTitle: false,
    titleTextStyle: TextStyle(
      fontSize: 18,
      fontWeight: FontWeight.w700,
      letterSpacing: -0.3,
      color: Colors.white,
    ),
  ),
  cardTheme: CardTheme(
    elevation: 2,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    color: Colors.white,
  ),
  inputDecorationTheme: InputDecorationTheme(
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: grisBorde),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: grisBorde),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: azulMedio, width: 2),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    hintStyle: const TextStyle(color: grisTexto, fontSize: 14),
  ),
);
