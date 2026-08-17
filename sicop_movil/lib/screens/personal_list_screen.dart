import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../services/db_service.dart';
import '../theme.dart';
import 'ficha_screen.dart';

class PersonalListScreen extends StatefulWidget {
  const PersonalListScreen({super.key});

  @override
  State<PersonalListScreen> createState() => _PersonalListScreenState();
}

class _PersonalListScreenState extends State<PersonalListScreen> {
  List<Map<String, dynamic>> _personal = [];
  List<Map<String, dynamic>> _filtrados = [];
  bool _loading = true;
  String _filtroCategoria = 'Todos';
  String _filtroEstado = 'Activos';
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() => _loading = true);
    _personal = await DbService.getAll();
    _aplicarFiltros();
    setState(() => _loading = false);
  }

  void _aplicarFiltros() {
    var result = List<Map<String, dynamic>>.from(_personal);

    // Estado
    if (_filtroEstado == 'Activos') {
      result = result.where((p) => p['activo'] == true).toList();
    } else if (_filtroEstado == 'Bajas') {
      result = result.where((p) => p['activo'] == false).toList();
    }

    // Categoría
    if (_filtroCategoria != 'Todos') {
      result = result.where((p) => p['categoria'] == _filtroCategoria).toList();
    }

    // Búsqueda
    final q = _searchController.text.toLowerCase().trim();
    if (q.isNotEmpty) {
      result = result.where((p) =>
        (p['nombre'] ?? '').toString().toLowerCase().contains(q) ||
        (p['apellidos'] ?? '').toString().toLowerCase().contains(q) ||
        (p['numero_empleado'] ?? '').toString().toLowerCase().contains(q) ||
        (p['rfc'] ?? '').toString().toLowerCase().contains(q) ||
        (p['curp'] ?? '').toString().toLowerCase().contains(q)
      ).toList();
    }

    _filtrados = result;
  }

  Widget _buildAvatar(Map<String, dynamic> p) {
    final foto = p['foto'];
    // foto viene como base64 string desde el JSON
    if (foto != null && foto is String && foto.isNotEmpty) {
      try {
        final bytes = base64.decode(foto);
        return CircleAvatar(backgroundImage: MemoryImage(Uint8List.fromList(bytes)), radius: 22);
      } catch (_) {}
    }
    final initials = '${(p['nombre'] ?? '').toString().isNotEmpty ? p['nombre'][0] : ''}${(p['apellidos'] ?? '').toString().isNotEmpty ? p['apellidos'][0] : ''}';
    return CircleAvatar(
      radius: 22, backgroundColor: beige,
      child: Text(initials.toUpperCase(), style: const TextStyle(
        color: azulOscuro, fontWeight: FontWeight.w700, fontSize: 13)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.shortestSide >= 600;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Personal'),
      ),
      body: Column(
        children: [
          // Barra de búsqueda
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                hintText: 'Buscar por nombre, RFC, CURP o No. empleado...',
                prefixIcon: Icon(Icons.search, color: grisTexto),
              ),
              onChanged: (_) {
                setState(() => _aplicarFiltros());
              },
            ),
          ),

          // Filtros
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                // Estado
                ..._buildChips(['Activos', 'Bajas', 'Todos'], _filtroEstado, (v) {
                  setState(() { _filtroEstado = v; _aplicarFiltros(); });
                }),
                const SizedBox(width: 12),
                Container(width: 1, height: 24, color: grisBorde),
                const SizedBox(width: 12),
                // Categoría
                ..._buildChips(['Todos', 'Preventiva', 'Vial'], _filtroCategoria, (v) {
                  setState(() { _filtroCategoria = v; _aplicarFiltros(); });
                }),
              ],
            ),
          ),

          // Contador
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              '${_filtrados.length} registros',
              style: const TextStyle(fontSize: 13, color: grisTexto),
            ),
          ),

          // Lista
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _filtrados.isEmpty
                    ? const Center(child: Text('No se encontraron registros.', style: TextStyle(color: grisTexto)))
                    : ListView.builder(
                        itemCount: _filtrados.length,
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        itemBuilder: (ctx, i) {
                          final p = _filtrados[i];
                          final esBaja = p['activo'] == false;
                          return Card(
                            color: esBaja ? Colors.red.shade50 : null,
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            child: ListTile(
                              leading: _buildAvatar(p),
                              title: Text(
                                '${p['nombre']} ${p['apellidos']}',
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                  color: esBaja ? Colors.red.shade900 : null,
                                ),
                              ),
                              subtitle: Text(
                                '${p['categoria']} • ${p['numero_empleado']}',
                                style: const TextStyle(fontSize: 12),
                              ),
                              trailing: esBaja
                                  ? Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: Colors.red.shade100,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: const Text('BAJA', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.red)),
                                    )
                                  : const Icon(Icons.chevron_right, color: grisTexto),
                              onTap: () {
                                Navigator.push(context, MaterialPageRoute(
                                  builder: (_) => FichaScreen(personaId: p['id'] as int),
                                ));
                              },
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildChips(List<String> options, String selected, ValueChanged<String> onSelected) {
    return options.map((opt) {
      final isActive = opt == selected;
      return Padding(
        padding: const EdgeInsets.only(right: 6),
        child: FilterChip(
          label: Text(opt, style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isActive ? Colors.white : grisTexto,
          )),
          selected: isActive,
          onSelected: (_) => onSelected(opt),
          selectedColor: opt == 'Bajas' && isActive ? rojo : azulMedio,
          backgroundColor: Colors.white,
          side: BorderSide(color: isActive ? Colors.transparent : grisBorde),
          showCheckmark: false,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        ),
      );
    }).toList();
  }
}
