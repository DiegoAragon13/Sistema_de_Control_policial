# Sistema de Control de Personal — Propuesta

## ¿Qué es?

Un programa de computadora para llevar el control del personal de la corporación (Policía Preventiva y Vialidad). Funciona como un expediente digital de cada elemento: sus datos personales, laborales, documentos y fotografía.

Se instala directamente en la computadora designada, como cualquier otro programa (Word, Excel, etc.). No requiere internet para funcionar.

---

## ¿Qué puede hacer?

| Función | Descripción |
|---------|-------------|
| **Ver todo el personal** | Lista completa con filtros por corporación (Preventiva o Vial) y búsqueda rápida por nombre, RFC, CURP o número de empleado |
| **Ficha de cada elemento** | Toda la información personal y laboral de cada persona en una sola pantalla, con fotografía |
| **Agregar personal nuevo** | Formulario para capturar un nuevo elemento |
| **Editar información** | Modificar cualquier dato de un elemento existente |
| **Eliminar registros** | Con confirmación para evitar borrados accidentales |
| **Importar desde Excel** | Subir un archivo .xlsx con muchos registros a la vez, sin capturar uno por uno |
| **Exportar a Excel** | Generar un archivo Excel con la información del personal para impresión o uso externo |
| **Respaldos** | Generar una copia de seguridad de toda la información para protegerla en caso de falla |

---

## ¿Qué información se guarda de cada persona?

- Fotografía
- Corporación (Policía Preventiva o Vialidad)
- Nombre y apellidos
- Dirección
- Teléfono personal y de emergencia
- Fecha de nacimiento
- Tipo de sangre
- Escolaridad
- RFC
- CURP
- CUIP (Clave Única de Identificación Policial)
- Fecha de ingreso a la corporación
- Número de empleado

---

## ¿Cómo se instala?

- Se entrega un instalador (archivo .exe) que se ejecuta con doble clic
- Se instala en la computadora designada como cualquier programa
- No necesita internet para funcionar
- Solo las personas con acceso a esa computadora pueden ver la información

---

## ¿Cómo se protege la información?

**Acceso:**
- El programa pide usuario y contraseña para entrar
- Solo personas autorizadas pueden usar el sistema
- Se pueden crear diferentes niveles de acceso (por ejemplo: administrador con acceso total, y consulta solo para ver información sin poder modificarla)
- Después de 3 intentos fallidos de contraseña, el acceso se bloquea temporalmente
- La sesión se cierra automáticamente si no se usa el programa por un tiempo prolongado (ej. 15 minutos)
- Las contraseñas se almacenan de forma cifrada (no se guardan tal cual, nadie puede leerlas directamente)
- Se lleva un registro interno de quién entró al sistema y a qué hora (bitácora de acceso)

**Respaldos (copias de seguridad):**
- Botón dentro del programa para generar un respaldo en cualquier momento
- Se puede guardar en USB, disco externo, o enviarse por correo electrónico
- El archivo de respaldo se puede proteger con contraseña
- En caso de que la computadora falle, se puede restaurar la información desde el respaldo

**Privacidad:**
- Los datos NO salen a internet
- Todo se almacena dentro de la computadora donde se instala
- No se comparte información con servicios externos ni páginas web

---

## ¿Qué se necesita para que funcione?

- Una computadora con Windows 10 o superior
- No requiere internet
- No requiere comprar licencias adicionales

---

## ¿Cuántos registros soporta?

El sistema puede manejar varios miles de registros sin problema. Para los ~1,100 elementos actuales (700 Policía Preventiva + 400 Vialidad) funciona con fluidez.

---

## Pantalla de ejemplo

Se puede consultar una demostración visual del sistema (solo diseño, sin datos reales) en:

**https://sistema-de-control-policial.vercel.app**

Esta demostración solo muestra cómo se verá el programa. La versión final se instalará directamente en la computadora sin necesidad de internet.

---

## Etapas del proyecto

| Etapa | Descripción | Estado |
|-------|-------------|--------|
| 1. Diseño visual | Maqueta navegable para aprobar pantallas y flujos | Completada |
| 2. Desarrollo funcional | Programar el sistema real con base de datos local, login, importación y respaldos | Pendiente |
| 3. Instalación y capacitación | Instalar en la computadora designada y capacitar al personal que lo usará | Pendiente |

---

## Preguntas frecuentes

**¿Qué pasa si se descompone la computadora?**
Se restaura la información desde el último respaldo. Por eso es importante generar respaldos periódicamente (el programa puede recordarlo automáticamente).

**¿Se puede usar en más de una computadora?**
Sí, se puede instalar en varias. Cada una tendría su propia copia de los datos. Si se necesita que varias computadoras compartan los mismos datos en tiempo real, eso requiere una configuración adicional con red local.

**¿Se puede imprimir la información?**
Sí, a través de la exportación a Excel se puede imprimir cualquier listado o ficha.

**¿Quién puede ver la información?**
Solo quien tenga el usuario y contraseña del sistema. Si la computadora está apagada o bloqueada, nadie puede acceder.
