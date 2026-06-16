# Plan de Desarrollo Detallado: StatsPro Basketball

Este documento integra los requerimientos del PRD con la **Arquitectura Hexagonal** y las **Vistas SQL** definidas para asegurar una implementación técnica coherente.

> **Propósito de este documento:** Especificación técnica completa por Historia de Usuario.
> Cada US debe ser autosuficiente: al leerla, el desarrollador sabe qué archivos crear,
> qué clases implementar, qué lógica de negocio aplicar y qué tests escribir.

## Convenciones del Documento

### Tipos de Artefactos de Código

| Símbolo      | Tipo Python          | Cuándo usarlo                                                        |
| ------------ | -------------------- | -------------------------------------------------------------------- |
| `@dataclass` | Dataclass            | Entidades de dominio y DTOs (datos sin comportamiento complejo)      |
| `Protocol`   | Interface/Puerto     | Contratos de repositorios en la capa `domain/interfaces/`            |
| `class`      | Clase concreta       | Implementaciones en `infrastructure/` y `application/`               |
| `UseCase`    | Clase de caso de uso | Orquestadores en `application/use_cases/`                            |
| `ABC`        | Clase abstracta      | Solo si se necesita comportamiento compartido entre implementaciones |

### Estructura de Directorios de Referencia

```text
src/
├── main.py
├── domain/
│   ├── entities/           # @dataclass puras, sin imports externos
│   ├── interfaces/         # Protocol de repositorios
│   ├── exceptions.py       # Excepciones de negocio
│   └── services/           # Lógica de dominio compleja (opcional)
├── application/
│   ├── use_cases/          # Orquestadores (reciben repos por DI)
│   ├── dtos/               # Dataclasses de entrada/salida entre capas
│   └── services/           # Servicios de aplicación (ej: SessionManager)
├── infrastructure/
│   ├── persistence/
│   │   ├── sql/            # schema.sql, views.sql, seed.sql
│   │   ├── database_manager.py
│   │   └── sqlite_*_repository.py
│   ├── analytics/          # Motor Pandas
│   ├── ingest/             # Parser Excel
│   ├── reports/            # Generador PDF
│   ├── security/           # PasswordHasher
│   └── ui/
│       ├── cli/            # Interfaz de línea de comandos
│       └── flet/           # GUI (Hito 2+)
└── tests/
    ├── unit/               # Sin DB, con mocks
    ├── integration/        # Con DB en memoria (:memory:)
    └── conftest.py         # Fixtures compartidos (db_in_memory, seeded_db)
```

### Regla de Dependencias (Clean Architecture)

```text
domain  ←  application  ←  infrastructure
  ↑                               ↑
  └─────── NO puede importar ─────┘
```

`domain/` no puede importar nada de `application/` ni de `infrastructure/`.
`application/` puede importar de `domain/`, pero NO de `infrastructure/`.

---

## Nueva Plantilla Estándar para Historias de Usuario

Cada US de ahora en adelante debería contener:

- Objetivo Funcional: Qué hace y para quién.
- Capa de Dominio: Entidades (dataclass), Puertos (Protocol) y Excepciones puras.
- Capa de Aplicación: El Caso de Uso (la clase orquestadora) y los DTOs de entrada/salida.
- Capa de Infraestructura: Repositorios concretos (SQLite) y comandos CLI.
- Base de Datos: Tablas o Vistas SQL afectadas.
- Criterios de Aceptación Técnicos (DoD): Qué pruebas y validaciones exactas deben pasar.
- Tipo de implementación (clase concreta, interfaz, función pura, dataclass)
- Reglas de negocio y validaciones (lógica de dominio)
- Entidades/Modelos implicados (dataclasses, tablas SQL).
- Vistas SQL necesarias (si aplica).
- Interfaces/Ports que debe definir (para Clean Architecture).
- Pruebas mínimas (unitarias y de integración)

---

## Hito 1: Núcleo de Datos e Interfaz CLI (v0.1)

**Objetivo:** Establecer la persistencia robusta y permitir la gestión básica de entidades mediante consola. Sistema funcional por línea de comandos con persistencia robusta.s

### Épica E1: Infraestructura y Persistencia

#### US-101: Implementación de la Base de Datos SQLite y Vistas

- **Objetivo Funcional:** Establecer la persistencia robusta del sistema mediante un esquema relacional local (SQLite) y proveer vistas optimizadas para el motor estadístico y la interfaz de usuario.
- **Narrativa:** Como desarrollador, quiero el esquema relacional completo en SQLite, con sus vistas de análisis y datos de prueba, para tener una base verificable sobre la que construir el sistema.
- **Capa de Dominio:** No aplica directamente (capa de infraestructura de persistencia).
- **Capa de Aplicación:** No aplica directamente.
- **Capa de Infraestructura:**
  - **Clase `SQLiteManager`** (`src/infrastructure/persistence/database_manager.py`):
    - Método `conectar() -> sqlite3.Connection`: Retorna una conexión activa con `PRAGMA foreign_keys = ON` y `row_factory = sqlite3.Row`.
    - Método `inicializar_db()`: Ejecuta de forma atómica los scripts `schema.sql`, `views.sql` y opcionalmente `seed.sql` usando `executescript()`.
- **Base de Datos (Scripts SQL):**
  - `src/infrastructure/persistence/sql/schema.sql`: Definición de tablas con tipos estrictos, PK, FK y restricciones.
  - `src/infrastructure/persistence/sql/views.sql`: Definición de las 4 vistas de análisis estadístico.
  - `src/infrastructure/persistence/sql/seed.sql`: Datos de prueba iniciales (1 usuario, 2 clubes, 10 jugadores, 1 competencia, 2 partidos).
- **Criterios de Aceptación Técnicos (DoD):**
  - **AC1 — Schema Robusto e Idempotente:**
    - Uso de `CREATE TABLE IF NOT EXISTS` y bloques `DROP TABLE IF EXISTS` en orden inverso de dependencias.
    - Configuración de `ON DELETE CASCADE` y `ON UPDATE CASCADE` en relaciones críticas.
    - Implementación de `CHECK constraints` (ej: `puntos >= 0`, `minutosJugados BETWEEN 0 AND 48`).
    - El campo `dni` en `jugador` es `UNIQUE` pero permite `NULL`.
  - **AC2 — Vistas de Análisis implementadas:**
    - Implementación exacta de `v_partidos_resumen`, `v_boxscore_completo`, `v_jugador_totales_temporada` y `v_listas_detalle`.
    - Las divisiones en las vistas deben usar `NULLIF` o `CASE` para evitar errores por división por cero.
  - **AC3 — Datos Semilla:**
    - `seed.sql` debe ejecutarse limpiamente sobre un schema vacío y poblar todas las tablas con datos significativos para las vistas.
- **Tipo de Implementación:** Clase concreta (`SQLiteManager`) y Scripts SQL (DDL/DML).
- **Reglas de Negocio / Validaciones (Nivel DB):**
  - Un partido no puede tener mismo club local y visitante: `CHECK(idClubLocal != idClubVisitante)`.
  - La fecha de fin en historial de clubes debe ser coherente: `CHECK(fechaHasta >= fechaDesde)`.
  - La relación 1:1 en `listaBuenaFe.idInscripcion` debe ser reforzada con `UNIQUE`.
- **Entidades/Modelos Implicados (Tablas):**
  - `usuario`, `club`, `usuarioClub`, `jugador`, `categoria`, `competencia`, `inscripcion`, `listaBuenaFe`, `jugadorListaBuenaFe`, `jugadorClub`, `partido`, `jugadorPartido`.
- **Vistas SQL Necesarias:**
  1. `v_partidos_resumen`: Une partido con clubes y competencia (reemplaza IDs por nombres).
  2. `v_boxscore_completo`: Une `jugadorPartido` con jugador y club (fuente para Pandas).
  3. `v_jugador_totales_temporada`: Acumulados históricos por jugador y año de competencia.
  4. `v_listas_detalle`: Muestra jugadores habilitados por inscripción.
- **Pruebas Mínimas:**
  - **Integración (`tests/test_database_schema.py`):**
    - `test_database_schema`: Verifica que todas las tablas y vistas existan tras la inicialización.
    - `test_referential_integrity`: Intentar insertar datos con FK inexistentes debe lanzar `IntegrityError`.
    - `test_check_constraints`: Intentar insertar valores negativos en puntos o minutos debe fallar.
    - `test_seed_execution`: Verificar que las vistas devuelvan datos tras ejecutar `seed.sql`.
    - `test_division_by_zero`: Verificar que las vistas retornen 0.0 y no error si un jugador no tiene lanzamientos.

#### US-102: DatabaseManager y Patrón Repository

- **Objetivo Funcional:** Implementar el orquestador de conexión y las interfaces de persistencia bajo Clean Architecture, asegurando que el acceso a datos sea independiente del motor de base de datos y garantizando la integridad referencial.
- **Narrativa:** Como desarrollador, quiero una capa de infraestructura que gestione el ciclo de vida de la conexión SQLite y exponga repositorios tipados para cada agregado del dominio.
- **Capa de Dominio:**
  - **Interfaces (Protocols)** (`src/domain/interfaces/`):
    - `UserRepository`: `get_by_email`, `get_by_id`, `exists_by_email`, `save`.
    - `ClubRepository`: `get_all`, `get_by_id`, `save`, `link_user_to_club`, `get_clubs_by_user`.
    - `PlayerRepository`: `search_by_dni`, `get_by_id`, `search_by_name`, `get_club_history`, `get_active_club`, `save`, `link_to_club`.
    - `CompetitionRepository`: `save_competencia`, `get_competencia_by_id`, `get_all_competencias`, `save_categoria`, `get_categorias`, `save_inscripcion`, `get_inscripcion_by_id`, `get_inscripciones_by_club`, `save_lista_buena_fe`, `get_lista_by_inscripcion`, `add_jugador_to_lista`, `get_jugadores_by_lista`.
    - `GameRepository`: `save_partido`, `save_boxscore`, `get_partidos_by_club`, `get_boxscore_by_partido`.
- **Capa de Aplicación:** No aplica directamente (contratos de persistencia).
- **Capa de Infraestructura:**
  - **Clase `SQLiteManager`** (`src/infrastructure/persistence/database_manager.py`):
    - Administra la conexión SQLite (`sqlite3.Connection`).
    - `connect()`: Activa `PRAGMA foreign_keys = ON`, configura `row_factory = sqlite3.Row`. Implementado para retornar la conexión activa si ya existe.
    - `initialize_schema()`: Ejecuta `schema.sql` y `views.sql` con `executescript()` en una sola llamada atómica.
  - **Implementaciones Concretas** (`src/infrastructure/persistence/`):
    - `SQLiteUserRepository`, `SQLiteClubRepository`, `SQLitePlayerRepository`, `SQLiteCompetitionRepository`, `SQLiteGameRepository`.
    - `SQLiteCompetitionRepository` maneja las tablas `competencia`, `categoria`, `inscripcion`, `listaBuenaFe` y `jugadorListaBuenaFe` como un único agregado competitivo.
    - Cada repositorio realiza el mapeo manual de `sqlite3.Row` a las dataclasses de dominio mediante métodos privados `_row_to_entity()`.
- **Base de Datos:** Tablas y vistas definidas en el Hito 1.
- **Criterios de Aceptación Técnicos (DoD):**
  - **AC1 — Gestión de Conexión:** `connect()` garantiza integridad referencial y acceso por nombre de columna.
  - **AC2 — Abstracción Total:** La capa `domain/` no importa `sqlite3`, `pandas` ni ninguna librería de infraestructura.
  - **AC3 — Mapeo de Datos:** Los repositorios retornan objetos `@dataclass` puros, nunca tuplas de SQLite.
  - **AC4 — Transaccionalidad:** `SQLiteGameRepository.save_boxscore()` permite el uso de transacciones multi-tabla para asegurar la integridad de la carga de partidos.
- **Tipo de Implementación:** Clase concreta (Manager y Repositorios) e Interfaces Protocol.
- **Reglas de Negocio / Validaciones:**
  - Validación de DNI duplicado al guardar un jugador (lanza `DominioException`).
  - Uso de `cursor.lastrowid` para retornar la entidad con el ID asignado por la base de datos.
- **Entidades/Modelos Implicados:** `Usuario`, `Club`, `Jugador`, `JugadorClub`, `Competencia`, `Categoria`, `Inscripcion`, `ListaBuenaFe`, `JugadorListaBuenaFe`, `Partido`, `EstadisticaJugadorPartido`.
- **Vistas SQL Necesarias:** `v_partidos_resumen` y `v_boxscore_completo` para optimizar las consultas de lectura en los repositorios.
- **Pruebas Mínimas:**
  - **Integración (`tests/integration/test_repositories.py`):**
    - CRUD completo por repositorio usando DB `:memory:`.
    - Verificar que `search_by_dni` retorna `None` si no existe, sin lanzar excepción.
    - Verificar que el `save()` de un partido y sus estadísticas sea atómico.
    - Comprobar que los repositorios de lectura usan las vistas SQL correctamente (ej: `club_local` contiene el nombre, no el ID).

**Archivos a crear:**

```text
src/domain/interfaces/
├── user_repository.py
├── club_repository.py
├── player_repository.py
├── competition_repository.py
└── game_repository.py

src/infrastructure/persistence/
├── database_manager.py
├── sqlite_user_repository.py
├── sqlite_club_repository.py
├── sqlite_player_repository.py
├── sqlite_competition_repository.py
└── sqlite_game_repository.py
```

### Épica E2: Lógica de Aplicación y CLI

#### US-103: Gestión de Entidades (Casos de Uso)

- **Objetivo Funcional:** Implementar la lógica de negocio pura y la interfaz de usuario por comandos para la gestión integral de las entidades del sistema (jugadores, clubes, competencias e inscripciones), asegurando la validación de reglas deportivas y la integridad de los datos.
- **Narrativa:** Como administrador, quiero disponer de casos de uso con lógica de negocio validada para gestionar el ciclo de vida de los jugadores y sus afiliaciones, así como la estructura de competencias y clubes.
- **Capa de Dominio:**
  - **Entidades (`src/domain/entities/`):**
    - `Usuario`, `Club`, `Jugador`, `JugadorClub` (historial N:M jugador-club), `Competencia`, `Categoria`, `Inscripcion`, `ListaBuenaFe`, `JugadorListaBuenaFe` (tabla de unión jugador-lista), `Partido`, `EstadisticaJugador`.
    - Las entidades son `@dataclass` puras, serializables y sin dependencias externas.
  - **Lógica de Validación:** Implementada en el método `__post_init__` de las entidades (ej: tiros convertidos <= lanzados, valores no negativos).
  - **Excepciones (`src/domain/exceptions.py`):** `JugadorDuplicadoError`, `ClubNoEncontradoError`, `UsuarioNoEncontradoError`, `CredencialesInvalidasError`, `VinculoActivoExistenteError`, etc.
- **Capa de Aplicación:**
  - **Casos de Uso (`src/application/use_cases/`):**
    - `RegistrarJugadorUseCase`: Valida DNI numérico, no vacío y no duplicado.
    - `CrearClubUseCase`: Registro de nuevas instituciones.
    - `VincularJugadorAClubUseCase`: Gestiona el historial de afiliaciones, evitando vínculos activos duplicados.
    - `CrearCompetenciaUseCase`: Define torneos y categorías.
    - `InscribirClubEnCompetenciaUseCase`: Gestiona inscripciones y genera automáticamente la `listaBuenaFe` vacía asociada (relación 1:1).
    - `ListarClubesUsuarioUseCase`: Retorna lista de clubes asociados al usuario actual.
    - `ListarJugadoresClubUseCase`: Lista jugadores inscritos en un club específico.
    - `ListarPartidosPorClubUseCase`: Devuelve lista de `PartidoResumenDTO` usando `v_partidos_resumen`.
  - **DTOs (`src/application/dtos/`):** `JugadorDTO`, `ClubDTO`, `CompetenciaDTO`, `CrearJugadorDTO`, `PartidoResumenDTO`, `InscripcionDTO`. Actúan como frontera para que las entidades no escapen a la UI.
- **Capa de Infraestructura:**
  - **Comandos CLI (`src/infrastructure/ui/cli/commands/`):** `player_add.py`, `club_add.py`, `player_link.py`, `game_list.py`, `player_list.py`, `club_list.py`.
  - **Interfaz:** Implementación de Command Pattern con `argparse`. Uso de prompts interactivos (`input()`) para recolección de datos y formateo de tablas mediante `tabulate`.
- **Base de Datos:** Tablas relacionales implicadas en la persistencia de las entidades y vista `v_partidos_resumen` para listados.
- **Criterios de Aceptación Técnicos (DoD):**
  - **AC1 — Independencia de Dominio:** Los archivos en `domain/entities/` no importan librerías externas.
  - **AC2 — Inyección de Dependencias:** Todos los casos de uso reciben sus repositorios vía constructor utilizando protocolos.
  - **AC3 — Validación Fail-Fast:** Los DNI duplicados o datos inválidos cortan el flujo de la CLI y muestran mensajes de error amigables sin tracebacks.
  - **AC4 — Formato de Salida:** La CLI siempre formatea los resultados exitosos y listas utilizando tablas en consola (ej. librería `tabulate`).
  - **AC5 — Atomicidad:** Operaciones complejas (como inscripciones que crean listas de buena fe) deben ser atómicas.
- **Tipo de implementación:** Clases concretas de Use Case, Dataclasses y adaptadores CLI.
- **Reglas de negocio y validaciones:**
  - El DNI de los jugadores debe ser numérico y único.
  - Un jugador no puede estar vinculado activamente (sin `fecha_hasta`) a más de un club (o al mismo club dos veces).
  - Los porcentajes y totales en estadísticas se validan antes de la persistencia.
- **Pruebas Mínimas:**
  - **Unitarias (`tests/unit/test_entities.py` y `test_use_cases_admin.py`):**
    - Validar excepciones en `EstadisticaJugador` por datos incoherentes.
    - Mocks de repositorios para testear la lógica de `RegistrarJugador` (simulando DNI duplicado) y `VincularJugadorAClub`.
    - Verificación de propiedades calculadas como `nombre_completo` o `rebotes_totales`.
  - **Integración:** Persistencia real de entidades en DB `:memory:` y validación de consultas mediante DTOs.

**Archivos a crear para esta sección:**

```text
src/domain/entities/
├── usuario.py
├── club.py
├── jugador.py
├── jugador_club.py
├── competencia.py
├── categoria.py
├── inscripcion.py
├── lista_buena_fe.py
├── jugador_lista_buena_fe.py
├── partido.py
└── estadistica_jugador.py

src/application/use_cases/
├── registrar_jugador.py
├── crear_club.py
├── vincular_jugador_club.py
├── crear_competencia.py
├── inscribir_club_competencia.py
├── listar_clubes_usuario.py
├── listar_jugadores_club.py
└── listar_partidos_por_club.py
```

#### US-104: Autenticación y Sesión Local

- **Objetivo Funcional**: Permitir el registro y acceso seguro de entrenadores al sistema, manteniendo un estado de sesión persistente entre ejecuciones de la CLI para evitar solicitudes repetitivas de credenciales y el ingreso constante del ID del club activo.
- **Narrativa**: Como usuario, quiero un sistema de login local que proteja mis datos y mantenga mi sesión entre ejecuciones de la CLI.
- **Capa de Dominio**:
  - **Entidades**: `Usuario` (`id`, `nombre`, `email`, `password_hash`, `salt`).
  - **Excepciones**: `EmailYaRegistradoError`, `UsuarioNoEncontradoError`, `CredencialesInvalidasError`.
  - **Interfaces (Ports)**: `UserRepository` (`get_by_email`, `get_by_id`, `save`).
- **Capa de Aplicación**:
  - **Casos de Uso**: `RegistrarEntrenadorUseCase`, `LoginLocalUseCase`.
  - **DTOs**: `RegistrarDTO`, `LoginDTO`, `SessionDTO`.
  - **Servicios de Aplicación**: `SessionManager` (`load_session`, `save_session`, `is_authenticated`, `clear_session`, `set_active_club`).
- **Capa de Infraestructura**:
  - **Seguridad**: `PasswordHasher` (Implementa `hashlib.pbkdf2_hmac` o SHA-256 con salt dinámico).
  - **Persistencia**: `SQLiteUserRepository`.
  - **Gestión de Sesión**: Clase `SessionManager` que persiste el `usuario_id` y `club_activo_id` en un archivo JSON oculto (ej: `~/.statspro_session.json`).
  - **CLI**: Comandos `stats auth register`, `stats auth login`, `stats auth logout`.
- **Base de Datos**: Tabla `usuario` (atributos: `id`, `nombre`, `email`, `password_hash`, `salt`).
- **Criterios de Aceptación Técnicos (DoD)**:
  - **AC1 — Seguridad de Credenciales**: Las contraseñas NUNCA se almacenan ni se loggean en texto plano. Uso de hashing determinista con salt.
  - **AC2 — Persistencia de Sesión**: La sesión sobrevive al cierre de la CLI. Al reiniciar, `is_authenticated()` retorna `True` si había sesión activa.
  - **AC3 — Manejo de Contexto**: El archivo de sesión permite recordar el club seleccionado actualmente (`club_activo_id`).
  - **AC4 — Validaciones**: El email debe ser único. La contraseña tiene requisitos mínimos (ej. 6 caracteres).
- **Tipo de implementación**: Clases de Caso de Uso, Servicios de Aplicación e Infraestructura de Seguridad.
- **Reglas de negocio y validaciones**:
  - `clear_session()` debe ser una operación idempotente.
  - `set_active_club()` falla si no hay sesión previa.
  - Los comandos protegidos ejecutan `require_auth()` y `require_active_club()` según corresponda.
- **Pruebas Mínimas**:
  - **Unitarias**: Test de hashing y verificación de contraseñas. Test de lógica de registro y login con repositorios mock.
  - **Integración**: Test de persistencia de sesión con archivo temporal. Test de flujo completo (registro -> login -> sesión) usando DB `:memory:`.

**Archivos a crear:**

```text
src/infrastructure/security/
└── password_hasher.py               ← PasswordHasher (estático)

src/application/
├── services/session_manager.py      ← SessionManager
└── use_cases/
    ├── registrar_entrenador.py      ← RegistrarEntrenadorUseCase
    └── login_local.py               ← LoginLocalUseCase

src/application/dtos/
└── auth_dto.py                      ← RegistrarDTO, LoginDTO, SessionDTO

tests/unit/
└── test_auth.py
```

#### US-105: Caso de Uso CargarPartido (Transacción Atómica)

- **Objetivo Funcional:** Registrar un evento de partido y sus estadísticas individuales asociadas garantizando la integridad de los datos mediante una transacción atómica (todo o nada).
- **Narrativa:** Como DT, quiero registrar un partido completo con todas las estadísticas de los jugadores en una única operación; si falla una sola estadística, nada se persiste.
- **Capa de Dominio:**
  - **Entidades (`src/domain/entities/`):** `Partido` (id, competencia, fecha, estadio), `EstadisticaJugador` (idJugador, idPartido, puntos, tiros, rebotes, etc.).
  - **Interfaces (Ports) (`src/domain/interfaces/`):** `GameRepository` con método `save_partido_completo(partido: Partido, boxscore: List[EstadisticaJugador])`.
- **Capa de Aplicación:**
  - **Casos de Uso (`src/application/use_cases/`):** `CargarPartidoUseCase` (orquesta validación y persistencia).
  - **DTOs (`src/application/dtos/`):** `PartidoDTO`, `BoxscoreDTO`, `EstadisticaInputDTO`.
- **Capa de Infraestructura:**
  - **Persistencia (`src/infrastructure/persistence/`):** `SQLiteGameRepository.save_partido_completo`. **Implementación:** Debe usar un context manager de SQLite (`with self.connection:`) para envolver el `INSERT` en `partido` y los múltiples `INSERT` en `jugadorPartido` en una sola transacción BEGIN/COMMIT.
  - **CLI (`src/infrastructure/ui/cli/commands/`):** Comando `stats game add` con flujo interactivo multi-paso.
- **Base de Datos:** Tablas `partido` y `jugadorPartido`.
- **Criterios de Aceptación Técnicos (DoD):**
  - **AC1 — Atomicidad Garantizada:** Si durante la inserción del boxscore (ej. jugador 8 de 12) hay un error o falla la validación de una `EstadisticaJugador`, se ejecuta un `ROLLBACK` y no se guarda el partido huérfano.
  - **AC2 — Validaciones Pre-persistencia:** La validación de los DTOs y reglas de negocio ocurre ANTES de la primera operación de base de datos. El mensaje de error debe especificar qué jugador y qué campo causó el error.
  - **AC3 — Independencia:** La lógica de negocio (UseCase) no contiene sentencias SQL, se delega totalmente al repositorio.
- **Tipo de implementación:** Clase concreta (UseCase) y Repositorio con gestión transaccional.
- **Reglas de negocio y validaciones:**
  - Validar que los puntos totales coincidan con la suma de tiros convertidos: `(T1C * 1) + (T2C * 2) + (T3C * 3)`.
  - `convertidos <= lanzados` para T1, T2 y T3.
  - Todos los campos numéricos deben ser `>= 0`.
  - `minutosJugados` no puede exceder el total del partido (ej. 48 min).
  - No se puede cargar un partido si los clubes involucrados no existen en la DB.
- **Pruebas Mínimas:**
  - **Unitarias (`tests/unit/test_use_case_cargar_partido.py`):**
    - Verificar fallo de persistencia total ante una sola estadística inválida.
    - Verificar que el mensaje de error especifica jugador y campo.
  - **Integración:** Test de flujo completo (partido + boxscore) usando DB `:memory:` con repositorios reales.

**Archivos a crear:**

```text
src/application/
├── dtos/partido_dto.py
└── use_cases/cargar_partido.py

tests/unit/
└── test_use_case_cargar_partido.py
```

#### US-106: Interfaz CLI con Command Pattern

**Narrativa:** Como administrador, quiero una CLI estructurada con subcomandos claros para gestionar todas las entidades, que muestre los datos en tablas formateadas.

**Dependencias previas:** US-104, US-105.

**Archivos a crear:**

```text
src/infrastructure/ui/cli/
├── main_cli.py                     ← punto de entrada, registra todos los subcomandos
├── commands/
│   ├── __init__.py
│   ├── auth_commands.py            ← register, login, logout
│   ├── club_commands.py            ← add, list, select
│   ├── player_commands.py          ← add, list, link
│   └── game_commands.py            ← add (formulario interactivo), list, boxscore
└── formatters/
    └── table_formatter.py          ← TableFormatter (wrapper de tabulate)
```

---

**Estructura de comandos (usar `argparse`):**

```bash
stats auth register
stats auth login
stats auth logout

stats club add                      → solicita nombre por input()
stats club list                     → tabla con v_partidos_resumen (filtrado por usuario)
stats club select <id>              → actualiza sesión

stats player add                    → formulario interactivo campo por campo
stats player list                   → tabla: ID | Nombre | DNI | Club Activo
stats player link <id_jugador>      → solicita id_club y fecha_desde

stats game add                      → formulario multi-paso (ver detalle abajo)
stats game list                     → tabla con v_partidos_resumen
stats game boxscore <id_partido>    → tabla con v_boxscore_completo
```

**Criterios de Aceptación:**

**AC1 — Command Pattern:**

- Agregar un nuevo grupo de comandos (ej: `stats competition ...`) solo requiere crear un nuevo archivo en `commands/` y registrarlo en `main_cli.py`. No se modifica ningún otro archivo.
- Las excepciones de dominio nunca muestran tracebacks al usuario final.
  **AC2 — Visualización con vistas SQL:**
- `stats game list` usa los datos de `v_partidos_resumen` (nombres de clubs, no IDs).
- `stats game boxscore <id>` usa `v_boxscore_completo` y muestra tabla formateada con `TableFormatter`.
- `stats player list` muestra el club activo del jugador (del historial `jugadorClub`).
  **AC3 — Flujo de sesión:**
- Los comandos `club`, `player` y `game` ejecutan `require_auth()` al inicio.
- Los comandos `game` y `player list` ejecutan `require_active_club()`.

---

## Hito 2: Motor de Ingesta y Análisis (v0.2)

**Objetivo:** Automatizar la carga de datos y procesar estadísticas avanzadas con Pandas.
**Decisión previa requerida:** ADR-002 debe estar aprobado (elección del framework UI: Flet vs Compose Multiplatform).

### EPICA-E1: Integración "Ges Deportivo"

#### US-201: Parseo de Planillas Excel con Pandas

- **Objetivo Funcional:** Automatizar la ingesta de datos desde planillas externas (Ges Deportivo), transformándolas en entidades de dominio y asegurando la integridad de las estadísticas.
- **Narrativa:** Como analista, quiero procesar los archivos de Ges Deportivo para eliminar el error humano en la transcripción y agilizar el análisis.
- **Capa de Dominio:**
  - **Excepciones:** `InvalidExcelFormatError` (en `src/domain/exceptions.py`).
- **Capa de Aplicación:**
  - **Caso de Uso:** `ImportarExcelUseCase` (en `src/application/use_cases/importar_excel.py`).
  - **DTOs:** `IngestRowDTO`, `IngestResultDTO`, `ResultadoImportacionDTO`.
- **Capa de Infraestructura:**
  - **Servicios:**
    - `GesDeportivoExcelParser` (en `src/infrastructure/ingest/excel_parser.py`): Lee Excel con `pd.read_excel`.
    - `IngestService` (en `src/infrastructure/ingest/ingest_service.py`): Implementa la lógica de "Merge" y validación cruzada.
  - **Comandos CLI:** `stats import excel --file <ruta>` (en `src/infrastructure/ui/cli/commands/`).
- **Base de Datos:** Afecta tablas `club`, `jugador`, `competencia`, `partido` y `jugadorPartido`.
- **Criterios de Aceptación Técnicos (DoD):**
  - **AC1 — Mapeo y Validación de Formato:** El parser lanza `InvalidExcelFormatError` si faltan columnas requeridas antes de procesar.
  - **AC2 — Lógica de Merge:** Si el jugador no existe (por DNI), se crea automáticamente. Si ya existe, se vincula.
  - **AC3 — Verificación de Consistencia:** La suma de puntos individuales de los jugadores debe coincidir con el resultado final del partido cargado.
  - **AC4 — Transaccionalidad:** El proceso es atómico por partido; si falla una estadística, no se guarda el partido ni sus jugadores asociados.
  - **AC5 — Vista Previa:** Soporte para método `preview()` que valida el archivo sin persistir cambios en la DB.
  - **AC6 — Logs:** Generación de un reporte que detalle registros procesados, jugadores creados/vinculados y errores encontrados.
- **Reglas de negocio y validaciones:**
  - Si un jugador no tiene DNI en el Excel, se debe rechazar la fila (log y continuar).
  - Si un club o competencia no existen, se crean automáticamente con los nombres provistos.
  - El formato de fechas debe ser validado según el estándar del proyecto.
- **Pruebas Mínimas:**
  - **Unitarias:** Mock de repositorios para verificar la lógica de creación/vinculación de entidades.
  - **Integración:** Archivo Excel real (o fixture) en `tests/fixtures/` importado a una DB `:memory:` verificando la persistencia correcta de todos los registros.

### Épica E2: Motor Estadístico Pro

#### US-202: Cálculo de Métricas Avanzadas

- **Objetivo Funcional:** Implementar el motor lógico de analítica deportiva para transformar datos crudos del boxscore en indicadores avanzados de rendimiento (métrica de eficiencia, porcentajes ajustados y ritmos de juego).
- **Narrativa:** Como DT, quiero ver métricas como eFG%, EFF, PPP y PER para evaluar el impacto real de mis jugadores y poder comparar el rendimiento de mi equipo contra el rival en cada partido.
- **Capa de Dominio:**
  - **Interfaces:** El contrato `AnalyticsService` (US-203) delega el cálculo matemático a este módulo.
  - **Excepciones:** `CalculationError` en caso de datos inconsistentes (ej. lanzamientos negativos).
- **Capa de Aplicación:**
  - **Casos de Uso:**
    - `CalcularEstadisticasAvanzadasUseCase`: Aplica las fórmulas sobre DataFrames de Pandas.
    - `GenerarTablaComparativaUseCase`: Agrupa estadísticas por club para el análisis "Equipo vs Rival".
  - **DTOs:** `MetricasAvanzadasDTO`, `ComparativaEquipoDTO`.
- **Capa de Infraestructura:**
  - **Archivos:** `src/infrastructure/analytics/formulas.py`.
  - **Fórmulas y Reglas de Negocio:**
    - **eFG% (Effective Field Goal Percentage):** `(T2C + 1.5 * T3C) / (T2L + T3L)`.
    - **Efficiency (EFF):** `PTS + REB + AST + REC + TAP_R - (T2L-T2C) - (T3L-T3C) - (T1L-T1C) - PERD`.
    - **PPP (Puntos por Posesión):** `Puntos / Posesiones`.
    - **Posesiones (FIBA Est.):** `(T2L + T3L) + 0.44 * T1L + PERD - REB_OF`.
    - **% Rebotes:** Proporción de rebotes totales capturados sobre el total disponible en el partido.
- **Base de Datos:** Consume datos limpios de `v_boxscore_completo` y agregados de `v_jugador_totales_temporada`.
- **Criterios de Aceptación Técnicos (DoD):**
  - **AC1 — Implementación de Fórmulas:** Disponibilidad de eFG%, EFF, PPP, PER (simplificado) y % de Rebotes.
  - **AC2 — Tabla Comparativa:** Generación de un reporte "Equipo vs Rival" comparando los promedios y totales de ambos bandos para un `idPartido` dado.
  - **AC3 — Filtrado Dinámico:** Los cálculos deben aceptar parámetros de filtro por `Temporada` e `idCompetencia` directamente en los DataFrames.
  - **AC4 — Robustez:** Manejo de división por cero (retornar 0.0) y exclusión de `NaN` en los resultados finales.
- **Tipo de implementación:** Funciones puras (basadas en Pandas) y servicios de aplicación.
- **Pruebas Mínimas:**
  - **Unitarias (`tests/unit/test_formulas.py`):** Cobertura del 100% de las funciones matemáticas en `formulas.py` con validación de casos límite (ceros).
  - **Integración:** Probar `GenerarTablaComparativaUseCase` con datos de dos equipos en un mismo partido (datos semilla) y verificar que los totales coinciden con el resultado final.

### Épica E3: Inteligencia Deportiva (Pandas Engine)

#### US-203: Integración de Motor Estadístico

- **Objetivo Funcional:** Conectar las Vistas SQL con DataFrames de Pandas para calcular métricas avanzadas (eFG%, EFF, PPP) automáticamente a partir de los datos cargados.
- **Capa de Dominio:**
  - **Interfaces:** `AnalyticsService` protocol.
- **Capa de Aplicación:**
  - **Caso de Uso:** `CalcularEstadisticasPartidoUseCase`.
  - **DTOs:** `MetricasPartidoDTO`, `MetricasJugadorDTO`.
- **Capa de Infraestructura:**
  - **Servicios:**
    - `formulas.py`: Funciones puras de cálculo estadístico (sin DB).
    - `PandasAnalyticsService`: Lee vistas SQL, entrega DataFrames con métricas.
- **Vistas SQL requeridas:** `v_boxscore_completo`, `v_jugador_totales_temporada`.
- **Criterios de Aceptación Técnicos (DoD):**
  - **AC1 — formulas.py puro:** Ninguna función en `formulas.py` accede a la DB. Todas aceptan `pd.DataFrame` y retornan resultados. Cobertura del 100%.
  - **AC2 — División por cero protegida:** Los cálculos retornan 0.0 (no NaN/inf) en casos límite (ej. 0 lanzamientos).
  - **AC3 — Uso de Vistas SQL:** `AnalyticsService` lee exclusivamente de las vistas, asegurando nombres de columnas consistentes.
  - **AC4 — Integridad de Datos:** Los porcentajes se expresan como float entre 0 y 100 o como ratio según corresponda.
- **Pruebas Mínimas:**
  - **Unitarias:** Verificar fórmulas con DataFrames en memoria.
  - **Integración:** Consultar vistas reales en DB `:memory:` con datos semilla y comparar con valores esperados.

---

## Hito 3: Visualización Pro y Reporting (v0.3)

**Objetivo:** Generar valor mediante reportes detallados en consola y exportación de documentos formales, integrando gráficos estadísticos.

**Decisiones previas requeridas:**

- ADR-005: Librería para PDF (`reportlab` o `weasyprint`).
- ADR-007: Motor de visualización (`matplotlib` o `plotly`).

### Épica E4: Dashboards e Informes (CLI & Engine)

#### US-301: Dashboards e Informes Interactivos

- **Objetivo Funcional:** Proveer una visualización avanzada de datos en la terminal y preparar el motor de generación de gráficos para la futura GUI.
- **Narrativa:** Como DT, quiero ver tablas de líderes y gráficos de tendencia en mi terminal para analizar el rendimiento del equipo sin salir de la CLI.
- **Capa de Aplicación:**
  - **Casos de Uso:** `ObtenerLideresTemporadaUseCase`, `GenerarGraficoRendimientoUseCase`.
  - **DTOs:** `LiderDTO`, `GraficoDTO`.
- **Capa de Infraestructura:**
  - **Reportería CLI:** Clases `TablaLideresReporter` (usa `rich`) y `GraficoTendenciaReporter` (usa `textual` o `rich.panel`).
  - **Motor de Gráficos:** `ChartGenerator` (en `src/infrastructure/analytics/chart_generator.py`) que genera figuras a partir de DataFrames.
- **Vistas SQL requeridas:** `v_jugador_totales_temporada`, `v_partidos_resumen`.
- **Criterios de Aceptación Técnicos:**
  - **AC1 — Dashboards en Consola:** Uso de la librería `rich` para mostrar top 5 de líderes por rubro (puntos, rebotes, EFF).
  - **AC2 — Generación de Figuras:** `ChartGenerator` debe producir gráficos (PNG o interactivos) en menos de 2 segundos.
  - **AC3 — Interactividad:** Soporte para filtrar por temporada (`--season 2025`) en los comandos de reportes.
- **Implementación requerida:**
  - El comando `stats leaders --season 2025` debe invocar al caso de uso correspondiente y mostrar los resultados formateados.
- **Pruebas Mínimas:** Verificar que el ordenamiento de líderes coincida con los datos de `v_jugador_totales_temporada`.

#### US-302: Exportación a PDF

- **Objetivo Funcional:** Generar reportes PDF profesionales con el boxscore y las métricas avanzadas de un partido o temporada.
- **Narrativa:** Como DT, quiero exportar el boxscore a PDF para compartirlo con mi cuerpo técnico o imprimirlo.
- **Capa de Aplicación:**
  - **Caso de Uso:** `ExportarReporteUseCase`.
  - **DTOs:** `ExportarReporteDTO`, `ReporteResponseDTO`.
- **Capa de Infraestructura:**
  - **Generador:** `PDFReportGenerator` (en `src/infrastructure/reports/pdf_generator.py`).
- **Criterios de Aceptación Técnicos:**
  - **AC1 — Formato Profesional:** El PDF debe incluir encabezado con nombres de clubes, fecha y tablas alineadas numéricamente.
  - **AC2 — Convención de Nombres:** Archivos guardados como `boxscore_YYYY-MM-DD_Local_vs_Visitante.pdf`.
  - **AC3 — Robustez:** Creación automática del directorio `exports/` si no existe.
- **Pruebas Mínimas:** Generación exitosa de un PDF completo a partir de un `idPartido` con datos semilla.

---

## Hito 4: Interfaz Multiplataforma y Entrega (v1.0)

**Objetivo:** Desplegar una aplicación visual completa y responsiva que unifique todas las funcionalidades en una experiencia de usuario moderna.

**Decisiones previas requeridas:**

- ADR-002: Framework UI (Flet confirmado).

### Épica E5: Interfaz de Usuario Adaptable (GUI)

#### US-401: Implementación de Interfaz Flet (Desktop/Mobile)

- **Objetivo Funcional:** Migrar la interacción del sistema a una interfaz gráfica táctil y responsiva.
- **Narrativa:** Como DT, quiero una experiencia fluida y visual que no requiera comandos para gestionar mis estadísticas desde mi PC o celular.
- **Capa de Infraestructura (UI):**
  - **Tecnología:** Flet (Python-based).
  - **Componentes:** `ChartComponent` (wrapper para los gráficos de la US-301).
  - **Navegación:** `DashboardScreen`, `GameEntryScreen`, `PlayerProfileScreen`.
- **Criterios de Aceptación Técnicos:**
  - **AC1 — Performance:** Tiempo de arranque < 3 segundos.
  - **AC2 — UX:** Soporte para Modo Oscuro/Claro basado en preferencias del sistema.
  - **AC3 — Responsividad:** Adaptación automática para resoluciones de PC (1080p) y Mobile (720p).
  - **AC4 — Gestión de Datos:** Botón de "Sincronización/Backup" para exportar el archivo `.sqlite` manualmente.
- **Pruebas Mínimas:** Validación de navegación entre pantallas y persistencia de datos ingresados vía formularios GUI.

---

## Definición de "Hecho" Técnico (DoD) — v2

Una Historia de Usuario se considera **Hecha** cuando cumple TODOS los siguientes puntos:

1. **Código integrado:** Merge a la rama principal sin conflictos; commits con formato `tipo(alcance): descripción`.
2. **Tests pasan:** Cobertura ≥ 80% en lógica de negocio. Los tests de fórmulas estadísticas requieren 100%. Todos los tests corren sin errores en CI.
3. **Arquitectura respetada:** Ninguna clase en `domain/` importa de `infrastructure/` o de librerías externas (`sqlite3`, `pandas`). Verificable con `grep` o con una herramienta de análisis de imports.
4. **SQL verificado:** Si la US crea o modifica una vista SQL, la vista está en `views.sql` y existe un test de integración que consulta la vista con datos del `seed.sql`.
5. **Transacciones:** Si la US persiste múltiples tablas (ej: partido + estadísticas), existe un test que verifica que un fallo parcial hace rollback completo.
6. **ADR documentado:** Si la US requirió una decisión arquitectónica (ej: elección de librería), el ADR correspondiente está aprobado y en el repositorio.
7. **Sin imports cruzados:** Verificar con una herramienta de linting de arquitectura que no hay violaciones de capas.
8. **Docstring mínimo:** Todos los métodos públicos tienen docstring con descripción de una línea. Los métodos complejos tienen descripción de parámetros.

## ADRs Pendientes de Resolución

Antes de comenzar cada hito, los siguientes ADRs deben resolverse (del PRD):

| ADR     | Título                     | Bloquea | Decisión recomendada                                                                            |
| ------- | -------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| ADR-001 | Arquitectura Local-First   | Hito 1  | ✅ SQLite + offline-first (ya definido en arquitectura.md)                                      |
| ADR-002 | Framework UI               | Hito 2  | Evaluar: Flet (Python puro, mismo stack) vs Compose Multiplatform (Java/Kotlin, mejor en móvil) |
| ADR-003 | Protocolo de Ingesta Excel | US-202  | Pandas + investigación previa de columnas reales de Ges Deportivo                               |
| ADR-004 | Versionado de DB           | Hito 2  | Evaluar: migraciones manuales con tabla `schema_version` vs `alembic`                           |
| ADR-005 | Reportes PDF               | US-302  | `reportlab` (sin dependencias externas) o `weasyprint` (HTML→PDF, más flexible)                 |
| ADR-006 | Seguridad y Cifrado        | US-106  | v0.1: SHA-256 con salt fijo. v1.0: migrar a `bcrypt` con salt dinámico                          |
| ADR-007 | Motor de Visualización     | US-301  | `matplotlib` (offline, sin servidor) o `plotly` (interactivo, requiere servidor local)          |
| ADR-008 | Estrategia de Backup       | Hito 3  | Export manual de `.db` + script de restauración                                                 |

---

## Estructura de Repositorios (Arquitectura Técnica)

Cada módulo de datos se dividirá siguiendo el S.R.P. (Single Responsibility Principle):

| Entidad / Agregado | Repositorio              | Vistas Relacionadas                         |
| :----------------- | :----------------------- | :------------------------------------------ |
| **Identidad**      | `SQLiteUserRepository`   | N/A                                         |
| **Clubes**         | `SQLiteClubRepository`   | `v_listas_detalle`                          |
| **Jugadores**      | `SQLitePlayerRepository` | `v_jugador_totales_temporada`               |
| **Partidos/Stats** | `SQLiteGameRepository`   | `v_partidos_resumen`, `v_boxscore_completo` |

---

## Definición de "Hecho" Técnico (DoD)

Para que una Historia de Usuario se considere completada:

1. El código de la **Entidad** es independiente de librerías.
2. El **Repositorio** tiene su propia interfaz en el dominio.
3. Se ha validado la persistencia mediante una **Prueba de Integración** con SQLite.
4. La **Vista SQL** correspondiente devuelve los datos esperados en el formato correcto para Pandas.
