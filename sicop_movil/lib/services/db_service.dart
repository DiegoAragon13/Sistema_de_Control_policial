import 'dart:io';
import 'dart:convert';
import 'dart:typed_data';
import 'package:cryptography/cryptography.dart';
import 'package:path_provider/path_provider.dart';

/// Servicio de datos para la app móvil.
/// Lee archivos .sicop v3 (JSON cifrado con AES-256-GCM + contraseña).
class DbService {
  static int? _versionDb;
  static String? _fechaExportacion;
  static List<Map<String, dynamic>> _personal = [];
  static bool _loaded = false;
  static String? _lastFilePath;

  static bool get isLoaded => _loaded;
  static int? get versionDb => _versionDb;
  static String? get fechaExportacion => _fechaExportacion;

  /// Deriva clave de 32 bytes — IDÉNTICA a la implementación en Rust
  static Uint8List _deriveKey(String password, Uint8List salt) {
    final passBytes = utf8.encode(password);
    final key = Uint8List(32);

    for (int i = 0; i < 32; i++) {
      int val = salt[i % salt.length];
      for (int j = 0; j < passBytes.length; j++) {
        val = ((val * 31 + passBytes[j] + i + j) & 0xFFFFFFFF) & 0xFF;
      }
      for (int k = 0; k < 10000; k++) {
        val = ((val * 7 + salt[(i + val) % salt.length]) & 0xFFFFFFFF) & 0xFF;
      }
      key[i] = val;
    }
    return key;
  }

  /// HMAC simple — IDÉNTICA a la de Rust (FNV-1a doble)
  static String _computeHmac(Uint8List data, Uint8List key) {
    int hash = 0xcbf29ce484222325;
    final combined1 = [...key, ...data];
    for (final b in combined1) {
      hash ^= b;
      hash = (hash * 0x100000001b3) & 0xFFFFFFFFFFFFFFFF;
    }
    final combined2 = [...data, ...key];
    for (final b in combined2) {
      hash ^= b;
      hash = (hash * 0x100000001b3) & 0xFFFFFFFFFFFFFFFF;
    }
    return hash.toUnsigned(64).toRadixString(16).padLeft(16, '0');
  }

  /// Importa un archivo .sicop v3
  static Future<String> importarSicop(File archivo, String password) async {
    final bytes = await archivo.readAsBytes();

    if (bytes.length < 8) throw Exception('Archivo inválido.');
    final magic = utf8.decode(bytes.sublist(0, 4), allowMalformed: true);
    if (magic != 'SCOP') throw Exception('No es un archivo .sicop válido.');

    // Header length
    final headerLen = ByteData.sublistView(Uint8List.fromList(bytes.sublist(4, 8)))
        .getUint32(0, Endian.little);
    if (bytes.length < 8 + headerLen + 12) throw Exception('Archivo corrupto.');

    // Parse header
    final headerJson = utf8.decode(bytes.sublist(8, 8 + headerLen));
    final header = jsonDecode(headerJson) as Map<String, dynamic>;

    final version = (header['version'] as num?)?.toInt() ?? 0;
    if (version != 3) throw Exception('Versión $version no soportada.');

    final saltB64 = header['salt'] as String;
    final hmacExpected = header['hmac'] as String;
    final versionDb = (header['version_db'] as num).toInt();
    final fecha = header['fecha'] as String?;

    // Nonce (12 bytes) + ciphertext
    final dataStart = 8 + headerLen;
    final nonce = bytes.sublist(dataStart, dataStart + 12);
    final ciphertext = Uint8List.fromList(bytes.sublist(dataStart + 12));

    // Derivar clave
    final salt = Uint8List.fromList(base64.decode(saltB64));
    final key = _deriveKey(password, salt);

    // Verificar HMAC (integridad + contraseña correcta)
    final hmacActual = _computeHmac(ciphertext, key);
    if (hmacActual != hmacExpected) {
      throw Exception('Contraseña incorrecta o archivo modificado.');
    }

    // Descifrar AES-256-GCM
    // El ciphertext de Rust incluye el tag de 16 bytes al final
    final tagLen = 16;
    final encData = ciphertext.sublist(0, ciphertext.length - tagLen);
    final tag = ciphertext.sublist(ciphertext.length - tagLen);

    final algorithm = AesGcm.with256bits();
    final secretKey = SecretKey(key);
    final secretBox = SecretBox(
      encData,
      nonce: nonce,
      mac: Mac(tag),
    );

    List<int> plainBytes;
    try {
      plainBytes = await algorithm.decrypt(secretBox, secretKey: secretKey);
    } catch (e) {
      throw Exception('Error al descifrar. Contraseña incorrecta.');
    }

    // Parsear JSON
    final jsonStr = utf8.decode(plainBytes);
    final data = jsonDecode(jsonStr) as Map<String, dynamic>;

    _versionDb = versionDb;
    _fechaExportacion = fecha;
    final personalList = data['personal'] as List<dynamic>? ?? [];
    _personal = personalList.map((p) => Map<String, dynamic>.from(p as Map)).toList();
    _loaded = true;

    // Guardar copia local
    final appDir = await getApplicationDocumentsDirectory();
    _lastFilePath = '${appDir.path}/sicop_data.sicop';
    await archivo.copy(_lastFilePath!);

    return 'v$versionDb — ${_personal.length} registros';
  }

  /// No se puede cargar automáticamente en v3 (requiere contraseña)
  static Future<bool> cargarLocal() async => _loaded;

  static Future<List<Map<String, dynamic>>> getAll() async => _personal;

  static Future<Map<String, dynamic>?> getById(int id) async {
    try { return _personal.firstWhere((p) => p['id'] == id); }
    catch (_) { return null; }
  }

  static Future<Map<String, int>> conteos() async {
    final activos = _personal.where((p) => p['activo'] == true).length;
    final prev = _personal.where((p) => p['activo'] == true && p['categoria'] == 'Preventiva').length;
    final vial = _personal.where((p) => p['activo'] == true && p['categoria'] == 'Vial').length;
    final bajas = _personal.where((p) => p['activo'] == false).length;
    return { 'total': _personal.length, 'activos': activos, 'preventiva': prev, 'vial': vial, 'bajas': bajas };
  }
}
