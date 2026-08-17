import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:file_picker/file_picker.dart';
import '../services/db_service.dart';
import '../theme.dart';
import 'personal_list_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _loading = true;
  bool _dbCargada = false;
  String? _error;
  Map<String, int> _conteos = {};

  @override
  void initState() {
    super.initState();
    _cargarLocal();
    _checkIntentFile();
  }

  /// Revisa si la app fue abierta desde un archivo .sicop (WhatsApp, archivos, etc.)
  Future<void> _checkIntentFile() async {
    try {
      const channel = MethodChannel('mx.segpub.sicop/intent');
      final String? path = await channel.invokeMethod('getOpenedFile');
      if (path != null && path.isNotEmpty) {
        await _importarDesdeRuta(path);
      }
    } catch (_) {
      // No hay archivo pendiente, ignorar
    }
  }

  Future<void> _importarDesdeRuta(String path) async {
    // Pedir contraseña
    final password = await _pedirPassword();
    if (password == null || password.isEmpty) return;

    setState(() { _loading = true; _error = null; });
    try {
      final msg = await DbService.importarSicop(File(path), password);
      _conteos = await DbService.conteos();
      _dbCargada = true;
      _showSnackbar(msg);
    } catch (e) {
      _error = e.toString();
      _showSnackbar('$e', isError: true);
    }
    setState(() => _loading = false);
  }

  Future<void> _cargarLocal() async {
    setState(() => _loading = true);
    try {
      final ok = await DbService.cargarLocal();
      if (ok) {
        _conteos = await DbService.conteos();
        _dbCargada = true;
      }
    } catch (e) {
      _error = e.toString();
    }
    setState(() => _loading = false);
  }

  Future<void> _importarSicop() async {
    final result = await FilePicker.pickFiles(
      type: FileType.any,
      allowMultiple: false,
    );

    if (result == null || result.files.isEmpty) return;
    final path = result.files.single.path;
    if (path == null) return;

    if (!path.endsWith('.sicop')) {
      _showSnackbar('Selecciona un archivo .sicop', isError: true);
      return;
    }

    // Pedir contraseña
    final password = await _pedirPassword();
    if (password == null || password.isEmpty) return;

    setState(() { _loading = true; _error = null; });

    try {
      final msg = await DbService.importarSicop(File(path), password);
      _conteos = await DbService.conteos();
      _dbCargada = true;
      _showSnackbar(msg);
    } catch (e) {
      _error = e.toString();
      _showSnackbar('$e', isError: true);
    }

    setState(() => _loading = false);
  }

  Future<String?> _pedirPassword() async {
    String? password;
    await showDialog(
      context: context,
      builder: (ctx) {
        final controller = TextEditingController();
        return AlertDialog(
          title: const Text('Contraseña'),
          content: TextField(
            controller: controller,
            obscureText: true,
            decoration: const InputDecoration(
              hintText: 'Contraseña del archivo .sicop',
            ),
            autofocus: true,
            onSubmitted: (v) { password = v; Navigator.pop(ctx); },
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
            FilledButton(onPressed: () { password = controller.text; Navigator.pop(ctx); }, child: const Text('Abrir')),
          ],
        );
      },
    );
    return password;
  }

  void _showSnackbar(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isError ? rojo : verde,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.shortestSide >= 600;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Seguridad Pública App'),
        actions: [
          IconButton(
            icon: const Icon(Icons.file_open_outlined),
            tooltip: 'Importar .sicop',
            onPressed: _importarSicop,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _dbCargada
              ? _buildDashboard(isTablet)
              : _buildEmpty(),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.shield_outlined, size: 80, color: azulClaro.withOpacity(0.5)),
            const SizedBox(height: 24),
            const Text(
              'Dirección Municipal de\nSeguridad Pública',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: azulOscuro,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Importa un archivo .sicop para\nvisualizar los expedientes del personal.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: grisTexto),
            ),
            const SizedBox(height: 32),
            FilledButton.icon(
              onPressed: _importarSicop,
              icon: const Icon(Icons.file_open_outlined),
              label: const Text('Importar archivo .sicop'),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDashboard(bool isTablet) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Info de versión
          if (DbService.versionDb != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: azulOscuro.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, size: 18, color: azulMedio),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'DB v${DbService.versionDb} — ${DbService.fechaExportacion ?? "Sin fecha"}',
                        style: const TextStyle(fontSize: 12, color: azulOscuro, fontWeight: FontWeight.w500),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.refresh, size: 18),
                      tooltip: 'Actualizar',
                      onPressed: _importarSicop,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),
          const SizedBox(height: 20),

          // Stats cards
          GridView.count(
            crossAxisCount: isTablet ? 4 : 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: isTablet ? 2.5 : 1.4,
            children: [
              _StatCard(label: 'Total Activos', value: '${_conteos['activos'] ?? 0}', color: azulOscuro),
              _StatCard(label: 'Preventiva', value: '${_conteos['preventiva'] ?? 0}', color: azulMedio),
              _StatCard(label: 'Vial', value: '${_conteos['vial'] ?? 0}', color: azulClaro),
              _StatCard(label: 'Bajas', value: '${_conteos['bajas'] ?? 0}', color: rojo),
            ],
          ),
          const SizedBox(height: 28),

          // Botón para ver personal
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () {
                Navigator.push(context, MaterialPageRoute(
                  builder: (_) => const PersonalListScreen(),
                ));
              },
              icon: const Icon(Icons.people),
              label: const Text('Ver Personal'),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatCard({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(value, style: TextStyle(
              fontSize: 26, fontWeight: FontWeight.w800, color: color, height: 1.1,
            )),
            const SizedBox(height: 4),
            Text(label, style: const TextStyle(
              fontSize: 11, color: grisTexto, fontWeight: FontWeight.w500,
            ), overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}
