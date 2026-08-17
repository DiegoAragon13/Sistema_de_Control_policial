import 'dart:convert';
import 'dart:typed_data';
import 'dart:io';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';

/// Genera el PDF del perfil de un elemento con marca de agua.
/// Retorna la ruta del archivo PDF generado.
class PdfService {
  static Uint8List? _estrellaBytes;

  /// Carga la imagen de la estrella desde assets (una sola vez)
  static Future<Uint8List> _getEstrella() async {
    if (_estrellaBytes != null) return _estrellaBytes!;
    final data = await rootBundle.load('assets/estrella.png');
    _estrellaBytes = data.buffer.asUint8List();
    return _estrellaBytes!;
  }

  /// Genera PDF y retorna la ruta del archivo
  static Future<String> generarPerfil(Map<String, dynamic> persona) async {
    final estrella = await _getEstrella();
    final estrellaImage = pw.MemoryImage(estrella);

    // Foto del elemento (si tiene)
    pw.ImageProvider? fotoImage;
    final fotoB64 = persona['foto'] as String?;
    if (fotoB64 != null && fotoB64.isNotEmpty) {
      try {
        final fotoBytes = base64.decode(fotoB64);
        fotoImage = pw.MemoryImage(Uint8List.fromList(fotoBytes));
      } catch (_) {}
    }

    final esBaja = persona['activo'] == false;

    final pdf = pw.Document(
      title: 'Perfil — ${persona['nombre']} ${persona['apellidos']}',
      author: 'Seguridad Pública App',
    );

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.letter,
        margin: const pw.EdgeInsets.all(36),
        build: (context) {
          return pw.Stack(
            children: [
              // Marca de agua centrada
              pw.Positioned(
                top: 180,
                left: 100,
                child: pw.Opacity(
                  opacity: 0.06,
                  child: pw.Image(estrellaImage, width: 340, height: 340),
                ),
              ),
              // Contenido
              pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  // Encabezado
                  _buildHeader(estrellaImage, persona),
                  pw.SizedBox(height: 12),
                  // Banner baja
                  if (esBaja) _buildBajaBanner(persona),
                  // Foto + nombre
                  _buildFotoSection(fotoImage, persona, esBaja),
                  pw.SizedBox(height: 18),
                  // Datos
                  _buildSection('DATOS PERSONALES', [
                    _field('Fecha de Nacimiento', persona['fecha_nacimiento']),
                    _field('Tipo de Sangre', persona['tipo_sangre']),
                    _field('Escolaridad', persona['escolaridad']),
                    _field('Dirección', persona['direccion']),
                    _field('Teléfono', persona['telefono']),
                    _field('Tel. Emergencia', persona['telefono_emergencia']),
                  ]),
                  _buildSection('DATOS LABORALES', [
                    _field('Categoría', persona['categoria']),
                    _field('Fecha de Ingreso', persona['fecha_ingreso']),
                    _field('Núm. Empleado', persona['numero_empleado']),
                  ]),
                  _buildSection('DOCUMENTOS DE IDENTIDAD', [
                    _field('RFC', persona['rfc']),
                    _field('CURP', persona['curp']),
                    _field('Clave INE', persona['clave_ine']),
                    _field('Licencia', persona['licencia_conducir']),
                    _field('CUIP', persona['cuip']),
                  ]),
                ],
              ),
            ],
          );
        },
      ),
    );

    // Guardar en directorio temporal
    final dir = await getTemporaryDirectory();
    final nombre = 'Perfil_${persona['numero_empleado'] ?? 'sin_num'}.pdf'
        .replaceAll(RegExp(r'[^\w\-.]'), '_');
    final file = File('${dir.path}/$nombre');
    await file.writeAsBytes(await pdf.save());

    return file.path;
  }

  static pw.Widget _buildHeader(pw.ImageProvider estrella, Map<String, dynamic> p) {
    return pw.Container(
      padding: const pw.EdgeInsets.only(bottom: 10),
      decoration: const pw.BoxDecoration(
        border: pw.Border(bottom: pw.BorderSide(width: 2, color: PdfColor.fromInt(0xFF111844))),
      ),
      child: pw.Row(
        children: [
          pw.Image(estrella, width: 40, height: 40),
          pw.SizedBox(width: 12),
          pw.Expanded(
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text('DIRECCIÓN MUNICIPAL DE SEGURIDAD PÚBLICA',
                    style: pw.TextStyle(fontSize: 12, fontWeight: pw.FontWeight.bold,
                        color: PdfColor.fromInt(0xFF111844))),
                pw.Text('Sistema de Control de Personal',
                    style: const pw.TextStyle(fontSize: 9, color: PdfColor.fromInt(0xFF64748B))),
              ],
            ),
          ),
          pw.Text(p['numero_empleado'] ?? '',
              style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold,
                  color: PdfColor.fromInt(0xFF4B5694))),
        ],
      ),
    );
  }

  static pw.Widget _buildBajaBanner(Map<String, dynamic> p) {
    return pw.Container(
      width: double.infinity,
      margin: const pw.EdgeInsets.only(bottom: 12),
      padding: const pw.EdgeInsets.all(8),
      decoration: pw.BoxDecoration(
        color: PdfColor.fromInt(0xFFFEF2F2),
        border: pw.Border.all(color: PdfColor.fromInt(0xFFFECACA)),
        borderRadius: pw.BorderRadius.circular(4),
      ),
      child: pw.Text(
        'ELEMENTO DADO DE BAJA${p['nota_baja'] != null && p['nota_baja'].toString().isNotEmpty ? ' — ${p['nota_baja']}' : ''}',
        style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold, color: PdfColor.fromInt(0xFF991B1B)),
      ),
    );
  }

  static pw.Widget _buildFotoSection(pw.ImageProvider? foto, Map<String, dynamic> p, bool esBaja) {
    return pw.Center(
      child: pw.Column(
        children: [
          pw.Container(
            width: 100, height: 120,
            decoration: pw.BoxDecoration(
              border: pw.Border.all(color: PdfColor.fromInt(0xFFE4E7ED), width: 1.5),
              borderRadius: pw.BorderRadius.circular(6),
            ),
            child: foto != null
                ? pw.Image(foto, fit: pw.BoxFit.cover, width: 100, height: 120)
                : pw.Center(child: pw.Text('Sin foto', style: const pw.TextStyle(fontSize: 9, color: PdfColor.fromInt(0xFF64748B)))),
          ),
          pw.SizedBox(height: 8),
          pw.Text('${p['nombre']} ${p['apellidos']}',
              style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold, color: PdfColor.fromInt(0xFF111844))),
          pw.SizedBox(height: 4),
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.center,
            children: [
              _badge(p['categoria'] ?? '', p['categoria'] == 'Preventiva'
                  ? PdfColor.fromInt(0xFF111844) : PdfColor.fromInt(0xFF7288AE)),
              pw.SizedBox(width: 8),
              _badge(esBaja ? 'BAJA' : 'ACTIVO',
                  esBaja ? PdfColor.fromInt(0xFFEF4444) : PdfColor.fromInt(0xFF10B981)),
            ],
          ),
        ],
      ),
    );
  }

  static pw.Widget _badge(String label, PdfColor color) {
    return pw.Padding(
      padding: const pw.EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      child: pw.Text(label, style: pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold, color: color)),
    );
  }

  static pw.Widget _buildSection(String title, List<pw.Widget> fields) {
    return pw.Container(
      margin: const pw.EdgeInsets.only(bottom: 12),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Container(
            padding: const pw.EdgeInsets.only(bottom: 4),
            decoration: const pw.BoxDecoration(
              border: pw.Border(bottom: pw.BorderSide(width: 0.5, color: PdfColor.fromInt(0xFFE4E7ED))),
            ),
            child: pw.Text(title, style: pw.TextStyle(
              fontSize: 8, fontWeight: pw.FontWeight.bold,
              color: PdfColor.fromInt(0xFF4B5694), letterSpacing: 0.5)),
          ),
          pw.SizedBox(height: 6),
          pw.Wrap(
            spacing: 0,
            runSpacing: 4,
            children: fields,
          ),
        ],
      ),
    );
  }

  static pw.Widget _field(String label, dynamic value) {
    final val = value?.toString() ?? '';
    return pw.Container(
      width: 250,
      margin: const pw.EdgeInsets.only(bottom: 4),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.SizedBox(
            width: 110,
            child: pw.Text(label, style: pw.TextStyle(
              fontSize: 8, fontWeight: pw.FontWeight.bold, color: PdfColor.fromInt(0xFF64748B))),
          ),
          pw.Expanded(
            child: pw.Text(val.isNotEmpty ? val : '—', style: pw.TextStyle(
              fontSize: 9, color: val.isNotEmpty ? PdfColor.fromInt(0xFF1E293B) : PdfColor.fromInt(0xFF94A3B8))),
          ),
        ],
      ),
    );
  }
}
