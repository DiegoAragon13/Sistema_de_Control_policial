import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import '../services/db_service.dart';
import '../services/pdf_service.dart';
import '../theme.dart';

class FichaScreen extends StatefulWidget {
  final int personaId;
  const FichaScreen({super.key, required this.personaId});

  @override
  State<FichaScreen> createState() => _FichaScreenState();
}

class _FichaScreenState extends State<FichaScreen> {
  Map<String, dynamic>? _persona;
  bool _loading = true;
  bool _generandoPdf = false;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    final p = await DbService.getById(widget.personaId);
    setState(() { _persona = p; _loading = false; });
  }

  Future<void> _compartirPdf() async {
    if (_generandoPdf || _persona == null) return;
    setState(() => _generandoPdf = true);
    try {
      final path = await PdfService.generarPerfil(_persona!);
      await SharePlus.instance.share(
        ShareParams(
          files: [XFile(path)],
          text: 'Perfil de ${_persona!['nombre']} ${_persona!['apellidos']}',
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al generar PDF: $e'), backgroundColor: rojo),
        );
      }
    }
    if (mounted) setState(() => _generandoPdf = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(appBar: AppBar(title: const Text('Ficha')),
        body: const Center(child: CircularProgressIndicator()));
    }
    if (_persona == null) {
      return Scaffold(appBar: AppBar(title: const Text('Ficha')),
        body: const Center(child: Text('Persona no encontrada.')));
    }

    final p = _persona!;
    final esBaja = p['activo'] == false;
    // foto viene como base64 string
    final fotoStr = p['foto'] as String?;
    Uint8List? fotoBytes;
    if (fotoStr != null && fotoStr.isNotEmpty) {
      try { fotoBytes = Uint8List.fromList(base64.decode(fotoStr)); } catch (_) {}
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(p['numero_empleado'] ?? 'Ficha'),
        actions: [
          IconButton(
            icon: _generandoPdf
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Icon(Icons.picture_as_pdf),
            tooltip: 'Compartir PDF',
            onPressed: _compartirPdf,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          if (esBaja) _BajaBanner(nota: p['nota_baja']?.toString() ?? ''),
          _FotoHeader(foto: fotoBytes, nombre: '${p['nombre']} ${p['apellidos']}',
            categoria: p['categoria'] ?? '', esBaja: esBaja),
          const SizedBox(height: 24),
          _Section(title: 'Datos Personales', fields: [
            _F('Fecha Nacimiento', p['fecha_nacimiento']),
            _F('Tipo de Sangre', p['tipo_sangre']),
            _F('Escolaridad', p['escolaridad']),
            _F('Dirección', p['direccion']),
            _F('Teléfono', p['telefono']),
            _F('Tel. Emergencia', p['telefono_emergencia']),
          ]),
          _Section(title: 'Datos Laborales', fields: [
            _F('Categoría', p['categoria']),
            _F('Fecha Ingreso', p['fecha_ingreso']),
            _F('Núm. Empleado', p['numero_empleado']),
          ]),
          _Section(title: 'Documentos de Identidad', fields: [
            _F('RFC', p['rfc']),
            _F('CURP', p['curp']),
            _F('Clave INE', p['clave_ine']),
            _F('Licencia', p['licencia_conducir']),
            _F('CUIP', p['cuip']),
          ]),
        ]),
      ),
    );
  }
}

class _BajaBanner extends StatelessWidget {
  final String nota;
  const _BajaBanner({required this.nota});
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity, padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(color: Colors.red.shade50,
        border: Border.all(color: Colors.red.shade200), borderRadius: BorderRadius.circular(8)),
      child: Row(children: [
        Icon(Icons.warning_amber, color: Colors.red.shade700, size: 20),
        const SizedBox(width: 10),
        Expanded(child: Text('BAJA${nota.isNotEmpty ? ' — $nota' : ''}',
          style: TextStyle(color: Colors.red.shade800, fontWeight: FontWeight.w600, fontSize: 13))),
      ]),
    );
  }
}

class _FotoHeader extends StatelessWidget {
  final Uint8List? foto;
  final String nombre;
  final String categoria;
  final bool esBaja;
  const _FotoHeader({required this.foto, required this.nombre, required this.categoria, required this.esBaja});
  @override
  Widget build(BuildContext context) {
    return Center(child: Column(children: [
      Container(width: 120, height: 140,
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(10),
          border: Border.all(color: grisBorde, width: 2), color: grisFondo),
        clipBehavior: Clip.antiAlias,
        child: foto != null && foto!.isNotEmpty
          ? Image.memory(foto!, fit: BoxFit.cover, width: 120, height: 140)
          : const Center(child: Icon(Icons.person, size: 48, color: grisTexto)),
      ),
      const SizedBox(height: 12),
      Text(nombre, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: azulOscuro),
        textAlign: TextAlign.center),
      const SizedBox(height: 6),
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        _Badge(label: categoria, color: categoria == 'Preventiva' ? azulOscuro : azulClaro),
        const SizedBox(width: 8),
        _Badge(label: esBaja ? 'BAJA' : 'ACTIVO', color: esBaja ? rojo : verde),
      ]),
    ]));
  }
}

class _Badge extends StatelessWidget {
  final String label; final Color color;
  const _Badge({required this.label, required this.color});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
      child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color)),
    );
  }
}

class _Section extends StatelessWidget {
  final String title; final List<_F> fields;
  const _Section({required this.title, required this.fields});
  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.only(bottom: 10, top: 8),
        child: Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: azulMedio))),
      ...fields.map((f) => Padding(padding: const EdgeInsets.only(bottom: 10),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(width: 130, child: Text(f.label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: grisTexto))),
          Expanded(child: Text(
            f.value?.toString().isNotEmpty == true ? f.value.toString() : '—',
            style: TextStyle(fontSize: 14, color: f.value?.toString().isNotEmpty == true ? azulOscuro : grisTexto),
          )),
        ]),
      )),
      const Divider(height: 24),
    ]);
  }
}

class _F { final String label; final dynamic value; const _F(this.label, this.value); }
