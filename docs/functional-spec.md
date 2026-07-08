# Finanzas — Documento Funcional

> **Nombre del proyecto:** Finanzas
> **Versión:** 1.0 — Documento de Especificación Funcional
> **Fecha:** 2026-07-06
> **Autor:** Equipo de desarrollo
> **Referencia:** [whisper-money/whisper-money](https://github.com/whisper-money/whisper-money)

---

## 1. Visión del Producto

### 1.1 ¿Qué es?

**Finanzas** es una aplicación web personal para gestionar y organizar finanzas personales. Permite registrar cuentas bancarias, gastos, inversiones, presupuestos y obtener insights financieros — con encriptación E2E y acceso desde cualquier dispositivo (celular, tablet, PC).

### 1.2 ¿Para quién?

- Personas que quieren controlar sus finanzas personales sin depender de apps de terceros
- Usuarios que valoran la **privacidad** — sus datos están encriptados y bajo su control
- Personas que quieren acceder a sus finanzas desde **cualquier dispositivo** (celu, compu, tablet)
- Personas que quieren una alternativa a Excel/Google Sheets para tracking financiero

### 1.3 ¿Por qué?

- Las apps de finanzas existentes (Mint, YNAB, etc.) son SaaS que tus datos en sus servers
- Los Excel son propensos a errores y no tienen automatización
- No existe una app open-source, moderna, privacy-first en español para Latinoamérica

### 1.4 Propuesta de Valor

> "Tus finanzas, tus datos, tu control. Sin suscripciones, sin servidores, sin compromisos."

---

## 2. Stack Técnico

| Capa       | Tecnología                     | Justificación                                     |
| ---------- | ------------------------------ | ------------------------------------------------- |
| Framework  | Next.js 15 (App Router)        | Full-stack TypeScript, SSR, API routes            |
| UI         | Tailwind CSS + shadcn/ui       | Componentes hermosos, accesibles, copy-paste      |
| Database   | Prisma + PostgreSQL            | Cloud-first, robusto, backups automáticos         |
| State      | Zustand                        | Ligero, sin boilerplate                           |
| Charts     | Recharts                       | Financial visualizations                          |
| Encryption | Web Crypto API + DB encryption | E2E nativo del browser + encriptación en servidor |
| Testing    | Vitest                         | Rápido, TypeScript native                         |
| Auth       | NextAuth.js v5 o custom        | Autenticación server-side con sesiones seguras    |
| Deployment | Vercel / Railway / Coolify     | Deploy fácil, scaling automático                  |

### 2.1 Opciones de Database

| Proveedor       | Tier Gratis      | Notas                                    |
| --------------- | ---------------- | ---------------------------------------- |
| **Supabase**    | 500MB PostgreSQL | Dashboard bonito, auth incluido, backups |
| **Neon**        | 0.5GB PostgreSQL | Serverless, branching para dev           |
| **Railway**     | $5 crédito       | PostgreSQL + deploy en el mismo lugar    |
| **Self-hosted** | —                | Docker + VPS (como whisper-money)        |

---

## 3. Módulos Funcionales

### 3.1 🔐 Autenticación

**Descripción:** Sistema de autenticación server-side con sesiones seguras.

| Feature                  | Descripción                                                | Prioridad |
| ------------------------ | ---------------------------------------------------------- | --------- |
| Login con email/password | Acceso con credenciales (bcrypt/argon2)                    | MVP       |
| Encriptación maestra     | Clave derivada del password para encriptar datos sensibles | MVP       |
| Sesiones seguras         | JWT o session cookies con httpOnly                         | MVP       |
| Bloqueo automático       | Bloquear después de X minutos de inactividad               | Post-MVP  |
| Multi-device             | Acceder desde múltiples dispositivos simultáneamente       | MVP       |

**Reglas de negocio:**

- El password NUNCA se almacena en texto plano (bcrypt/argon2)
- La clave de encriptación se deriva del password (PBKDF2/scrypt)
- Si se olvida el password, los datos se pierden (diseño intencional — privacy-first)

---

### 3.2 🏦 Cuentas Bancarias

**Descripción:** Gestión de múltiples cuentas bancarias y financieras.

| Feature               | Descripción                                                      | Prioridad |
| --------------------- | ---------------------------------------------------------------- | --------- |
| Crear cuenta          | Nombre, banco, tipo (corriente/ahorro/tarjeta/inversión), moneda | MVP       |
| Editar cuenta         | Modificar datos de la cuenta                                     | MVP       |
| Eliminar cuenta       | Soft delete (nada se borra realmente)                            | MVP       |
| Balance actual        | Saldo actual de cada cuenta                                      | MVP       |
| Historial de balances | Evolución del saldo en el tiempo                                 | Post-MVP  |
| Multi-moneda          | Soporte para diferentes monedas (ARS, USD, EUR, etc.)            | Post-MVP  |
| IBAN/CBU              | Número de cuenta encriptado                                      | Post-MVP  |

**Tipos de cuenta:**

- `checking` — Cuenta corriente
- `savings` — Cuenta de ahorro
- `credit_card` — Tarjeta de crédito
- `investment` — Inversión (bonos, acciones, fondos)
- `cash` — Efectivo
- `loan` — Préstamo
- `real_estate` — Bienes raíces

**Reglas de negocio:**

- Cada cuenta pertenece a un usuario
- El nombre de la cuenta debe ser único por usuario
- Eliminar una cuenta NO elimina sus transacciones (soft delete)
- Una cuenta con transacciones asociadas no se puede eliminar físicamente

---

### 3.3 💰 Transacciones

**Descripción:** Registro de ingresos, gastos y transferencias.

| Feature              | Descripción                                   | Prioridad |
| -------------------- | --------------------------------------------- | --------- |
| Crear transacción    | Fecha, monto, descripción, categoría, cuenta  | MVP       |
| Editar transacción   | Modificar datos                               | MVP       |
| Eliminar transacción | Soft delete                                   | MVP       |
| Transferencias       | Mover dinero entre cuentas                    | MVP       |
| Importar CSV         | Cargar transacciones desde archivo CSV        | Post-MVP  |
| Búsqueda             | Buscar por descripción, monto, fecha          | MVP       |
| Filtros avanzados    | Por rango de fechas, categoría, monto, cuenta | MVP       |
| Dedup                | Evitar transacciones duplicadas (fingerprint) | Post-MVP  |

**Campos de una transacción:**

```
- id: UUID
- account_id: UUID (referencia a cuenta)
- category_id: UUID? (nullable — puede categorizarse después)
- amount: Decimal (positivo = ingreso, negativo = gasto)
- description: String (encriptado)
- date: DateTime
- type: Enum (income | expense | transfer)
- source: Enum (manual | import | banking)
- notes: String? (encriptado)
- created_at: DateTime
- updated_at: DateTime
- deleted_at: DateTime? (soft delete)
```

**Reglas de negocio:**

- Todo monto negativo es un gasto, positivo es un ingreso
- Las transferencias crean DOS transacciones (una en cada cuenta)
- Las transacciones eliminadas se pueden restaurar
- La descripción se encripta en reposo (E2E)
- El dedup se calcula por: cuenta + fecha + monto + hash(descripción)

---

### 3.4 🏷️ Categorías

**Descripción:** Organizar transacciones por categorías con iconos y colores.

| Feature                 | Descripción                            | Prioridad |
| ----------------------- | -------------------------------------- | --------- |
| Categorías predefinidas | Conjunto inicial de categorías comunes | MVP       |
| Crear categoría         | Nombre, icono (emoji), color, tipo     | MVP       |
| Editar categoría        | Modificar datos                        | MVP       |
| Eliminar categoría      | Soft delete                            | MVP       |
| Categorías por tipo     | income / expense / investment / saving | MVP       |
| Subcategorías           | Jerarquía de categorías                | Post-MVP  |

**Categorías predefinidas:**

```
Gastos:
- 🍔 Alimentación
- 🏠 Vivienda
- 🚗 Transporte
- 🎭 Entretenimiento
- 👕 Ropa
- 💊 Salud
- 📚 Educación
- 💳 Servicios
- 🎁 Otros gastos

Ingresos:
- 💼 Salario
- 💰 Freelance
- 📈 Inversiones
- 🎁 Otros ingresos

Ahorro/Inversión:
- 🏦 Ahorro
- 📊 Inversión
- 🏠 Bienes raíces
```

**Reglas de negocio:**

- Cada categoría tiene un tipo (income/expense/investment/saving)
- Las categorías predefinidas no se pueden eliminar
- Una categoría eliminada no afecta transacciones existentes
- El icono es un emoji (string), el color es hex

---

### 3.5 🏷️ Labels / Tags

**Descripción:** Tags flexibles para etiquetar transacciones (many-to-many).

| Feature           | Descripción                            | Prioridad |
| ----------------- | -------------------------------------- | --------- |
| Crear label       | Nombre + color                         | Post-MVP  |
| Asignar labels    | Una o múltiples labels por transacción | Post-MVP  |
| Filtrar por label | Buscar transacciones por label         | Post-MVP  |

**Reglas de negocio:**

- Una transacción puede tener múltiples labels
- Los labels son flexibles (el usuario define los suyos)
- Un label se puede eliminar sin afectar transacciones

---

### 3.6 📊 Presupuestos

**Descripción:** Definir límites de gasto por categoría y período.

| Feature           | Descripción                                  | Prioridad |
| ----------------- | -------------------------------------------- | --------- |
| Crear presupuesto | Categoría + monto límite + período (mensual) | Post-MVP  |
| Tracking de gasto | Cuánto se gastó vs. cuánto quedaba           | Post-MVP  |
| Alertas           | Notificación cuando se acerca al límite      | Post-MVP  |
| Historial         | Evolución de presupuestos pasados            | Post-MVP  |

**Reglas de negocio:**

- Un presupuesto es por categoría + período (mensual por defecto)
- El tracking se calcula sumando transacciones de la categoría en el período
- Los presupuestos se renuevan automáticamente cada mes
- Se puede configurar el día de inicio del período

---

### 3.7 🤖 Auto-categorización

**Descripción:** Reglas automáticas para categorizar transacciones.

| Feature          | Descripción                                    | Prioridad |
| ---------------- | ---------------------------------------------- | --------- |
| Crear regla      | Condición (texto/monto) → Acción (categoría)   | Post-MVP  |
| Reglas por texto | Si la descripción contiene "Uber" → Transporte | Post-MVP  |
| Reglas por monto | Si el monto > 10000 → Categoría X              | Post-MVP  |
| Aplicar reglas   | Al crear/editar transacción                    | Post-MVP  |
| Sugerencias IA   | IA sugiere categoría basada en historial       | Future    |

**Reglas de negocio:**

- Las reglas se aplican en orden de prioridad
- Si múltiples reglas matchean, se aplica la de mayor prioridad
- El usuario puede sobreescribir la categoría sugerida
- Las reglas se almacenan localmente (sin llamadas a APIs externas)

---

### 3.8 📈 Dashboard / Insights

**Descripción:** Vista resumen de las finanzas con gráficos y métricas.

| Feature              | Descripción                         | Prioridad |
| -------------------- | ----------------------------------- | --------- |
| Balance general      | Suma de todas las cuentas           | MVP       |
| Ingresos vs. Gastos  | Comparativa mensual                 | MVP       |
| Gastos por categoría | Pie chart de distribución           | MVP       |
| Evolución de balance | Line chart en el tiempo             | MVP       |
| Top gastos           | Los 10 gastos más grandes del mes   | Post-MVP  |
| Net worth            | Patrimonio neto (activos - pasivos) | Post-MVP  |
| Comparativa mensual  | Mes a mes                           | Post-MVP  |
| Forecast             | Proyección de gastos futuros        | Future    |

**Métricas del Dashboard:**

```
- Balance total (suma de todas las cuentas)
- Ingresos del mes
- Gastos del mes
- Ahorro del mes (ingresos - gastos)
- Tasa de ahorro (%)
- Top 5 categorías de gasto
- Gráfico de evolución mensual (últimos 6 meses)
```

---

### 3.9 🔒 Encriptación E2E

**Descripción:** Todos los datos sensibles se encriptan antes de guardarse.

| Feature               | Descripción                            | Prioridad |
| --------------------- | -------------------------------------- | --------- |
| Encriptación de datos | Descripciones, notas, IBAN encriptados | MVP       |
| Key derivation        | Clave derivada del password (PBKDF2)   | MVP       |
| Encryption salt       | Salt único por usuario                 | MVP       |
| Encrypted backups     | Backups encriptados                    | Post-MVP  |

**Campos encriptados:**

- Transaction.description
- Transaction.notes
- Account.iban
- LoanDetail (todos los campos sensibles)

**Campos NO encriptados (para poder buscar/filtrar):**

- Transaction.amount (necesario para cálculos)
- Transaction.date (necesario para filtrar)
- Transaction.type
- Account.name (necesario para mostrar)
- Category.name

**Reglas de negocio:**

- La encriptación es AES-256-GCM
- El IV (initialization vector) se genera único por registro
- La clave se deriva del password con PBKDF2 (100k iteraciones)
- Si se cambia el password, se re-encriptan todos los datos

---

### 3.10 📱 PWA (Progressive Web App)

**Descripción:** La app se puede instalar en el celular y funciona como una app nativa. La base de datos vive en el server (PostgreSQL), por lo que offline solo se puede ver contenido cacheado.

| Feature            | Descripción                                                 | Prioridad |
| ------------------ | ----------------------------------------------------------- | --------- |
| Installable        | Se puede "instalar" desde el browser                        | Post-MVP  |
| Push notifications | Recordatorios de vencimientos y alertas                     | Post-MVP  |
| Service worker     | Cache de assets estáticos + UI shell                        | Post-MVP  |
| Background sync    | Sincronizar transacciones offline cuando vuelva la conexión | Future    |

**Nota importante:** A diferencia de una PWA local-first, nuestra app requiere conexión al server para leer/escribir datos. El service worker cachea la UI shell para carga rápida, pero los datos siempre se sincronizan con PostgreSQL en el server.

---

### 3.11 💾 Backup & Export

**Descripción:** Respaldo y exportación de datos.

| Feature             | Descripción                        | Prioridad |
| ------------------- | ---------------------------------- | --------- |
| Exportar a JSON     | Backup completo en JSON encriptado | MVP       |
| Importar desde JSON | Restaurar desde backup             | MVP       |
| Exportar CSV        | Exportar transacciones a CSV       | Post-MVP  |
| Auto-backup         | Backup automático periódico        | Future    |

**Reglas de negocio:**

- El backup exportado está encriptado con la misma clave del usuario
- Solo se puede importar un backup encriptado con la clave correcta
- El backup incluye TODOS los datos (cuentas, transacciones, categorías, etc.)

---

## 4. Modelo de Datos (Entidades)

### 4.1 Diagrama de Relaciones

```
User (1) ──── (N) Account
User (1) ──── (N) Category
User (1) ──── (N) Label
User (1) ──── (N) AutomationRule

Account (1) ──── (N) Transaction
Account (1) ──── (N) AccountBalance (historial)

Category (1) ──── (N) Transaction
Category (1) ──── (N) Budget

Transaction (N) ──── (N) Label (pivot: TransactionLabel)

Budget (1) ──── (N) BudgetPeriod
BudgetPeriod (1) ──── (N) BudgetTransaction
```

### 4.2 Entidades Principales

#### User

```
- id: UUID (PK)
- email: String (encriptado)
- password_hash: String (bcrypt)
- encryption_salt: String (para key derivation)
- name: String
- currency_code: String (default: "ARS")
- locale: String (default: "es-AR")
- timezone: String (default: "America/Argentina/Buenos_Aires")
- created_at: DateTime
- updated_at: DateTime
```

#### Account

```
- id: UUID (PK)
- user_id: UUID (FK → User)
- name: String
- bank_name: String?
- type: Enum (checking | savings | credit_card | investment | cash | loan | real_estate)
- currency_code: String
- iban: String? (encriptado)
- notes: String? (encriptado)
- is_active: Boolean (default: true)
- created_at: DateTime
- updated_at: DateTime
- deleted_at: DateTime? (soft delete)
```

#### Transaction

```
- id: UUID (PK)
- account_id: UUID (FK → Account)
- category_id: UUID? (FK → Category, nullable)
- amount: Decimal (bigint stored, 2 decimales)
- description: String (encriptado)
- original_description: String? (encriptado — para imports)
- date: DateTime
- type: Enum (income | expense | transfer)
- source: Enum (manual | import | banking)
- transfer_pair_id: UUID? (FK → Transaction — para transferencias)
- notes: String? (encriptado)
- dedup_fingerprint: String? (hash para evitar duplicados)
- created_at: DateTime
- updated_at: DateTime
- deleted_at: DateTime? (soft delete)
```

#### Category

```
- id: UUID (PK)
- user_id: UUID (FK → User)
- name: String
- icon: String (emoji)
- color: String (hex)
- type: Enum (income | expense | investment | saving)
- cashflow_direction: Enum (inflow | outflow)
- is_default: Boolean (default: false)
- sort_order: Integer
- created_at: DateTime
- updated_at: DateTime
- deleted_at: DateTime? (soft delete)
```

#### Label

```
- id: UUID (PK)
- user_id: UUID (FK → User)
- name: String
- color: String (hex)
- created_at: DateTime
- updated_at: DateTime
- deleted_at: DateTime? (soft delete)
```

#### TransactionLabel (pivot)

```
- transaction_id: UUID (FK → Transaction)
- label_id: UUID (FK → Label)
- PRIMARY KEY (transaction_id, label_id)
```

#### Budget

```
- id: UUID (PK)
- user_id: UUID (FK → User)
- category_id: UUID (FK → Category)
- amount_limit: Decimal
- period: Enum (monthly | weekly | yearly)
- is_active: Boolean (default: true)
- created_at: DateTime
- updated_at: DateTime
```

#### BudgetPeriod

```
- id: UUID (PK)
- budget_id: UUID (FK → Budget)
- starts_at: DateTime
- ends_at: DateTime
- amount_spent: Decimal (default: 0)
- is_processing: Boolean (default: false)
- created_at: DateTime
```

#### AutomationRule

```
- id: UUID (PK)
- user_id: UUID (FK → User)
- name: String
- condition_type: Enum (description_contains | amount_equals | amount_greater | amount_less)
- condition_value: String
- category_id: UUID (FK → Category)
- label_id: UUID? (FK → Label, nullable)
- priority: Integer (default: 0)
- is_active: Boolean (default: true)
- created_at: DateTime
- updated_at: DateTime
```

---

## 5. Flujos de Usuario

### 5.1 Onboarding (Primera vez)

```
1. Usuario abre la app
2. Ve pantalla de bienvenida
3. Crea cuenta: email + password
4. Se genera encryption_salt
5. Se deriva encryption key del password
6. Se crea usuario en DB
7. Se redirige al dashboard vacío
8. Se muestra wizard: "Creá tu primera cuenta"
```

### 5.2 Registrar un Gasto

```
1. Usuario toca "+" o "Nueva transacción"
2. Selecciona tipo: Gasto
3. Ingresa: monto, descripción, fecha
4. Selecciona cuenta de origen
5. Selecciona categoría (o deja sin categoría)
6. Opcionalmente agrega labels
7. Confirma → transacción guardada
8. Dashboard se actualiza
```

### 5.3 Transferir entre Cuentas

```
1. Usuario selecciona "Transferencia"
2. Selecciona cuenta origen
3. Selecciona cuenta destino
4. Ingresa monto
5. Confirma → se crean 2 transacciones (débito + crédito)
6. Ambas cuentas se actualizan
```

### 5.4 Crear Presupuesto

```
1. Usuario va a "Presupuestos"
2. Toca "Nuevo presupuesto"
3. Selecciona categoría
4. Ingresa monto límite
5. Selecciona período (mensual)
6. Confirma → presupuesto creado
7. Dashboard muestra tracking del presupuesto
```

---

## 6. Priorización (MVP vs. Full)

### 🟢 MVP (Versión 1)

Las features mínimas para que la app sea USABLE:

- [ ] Autenticación (login con password)
- [ ] Encriptación E2E (datos sensibles)
- [ ] CRUD de Cuentas bancarias
- [ ] CRUD de Transacciones (ingresos + gastos)
- [ ] Categorías predefinidas + CRUD
- [ ] Dashboard básico (balance, ingresos vs gastos, top categorías)
- [ ] Búsqueda y filtros básicos
- [ ] Export/Import JSON (backup)
- [ ] Transferencias entre cuentas

### 🟡 Post-MVP (Versión 2)

Features que agregan valor pero no son críticas:

- [ ] Multi-moneda + exchange rates
- [ ] Labels / Tags
- [ ] Presupuestos
- [ ] Auto-categorización (reglas)
- [ ] Import CSV
- [ ] Filtros avanzados
- [ ] Historial de balances
- [ ] Net worth tracking
- [ ] PWA (offline)
- [ ] IBAN encriptado

### 🔴 Future (Versión 3+)

Features ambiciosas:

- [ ] Banking integration (Open Banking)
- [ ] IA para sugerencias de categorías
- [ ] Inversiones detalladas (acciones, bonos)
- [ ] Bienes raíces con revalorización
- [ ] Préstamos con tracking de cuotas
- [ ] Comparativa mensual/anual
- [ ] Forecast de gastos
- [ ] Auto-backup periódico
- [ ] Multi-usuario (familia)

---

## 7. Non-Goals (Qué NO hacemos)

- ❌ **No es una app de inversiones** — no conectamos con brokers ni mercados
- ❌ **No es multi-usuario** — es una app personal (un usuario)
- ❌ **No tiene notificaciones push** — es una PWA web (sin push nativo)
- ❌ **No procesa pagos** — solo registra transacciones
- ❌ **No tiene AI/ML** — por ahora, todo es manual o por reglas
- ❌ **No es una app móvil nativa** — es una PWA (web app instalable)

---

## 8. Decisiones Técnicas Clave

| Decisión       | Elección                      | Justificación                                           |
| -------------- | ----------------------------- | ------------------------------------------------------- |
| Database       | PostgreSQL (via Prisma)       | Cloud-first, robusto, backups automáticos, multi-device |
| IDs            | UUIDs                         | Previene enumeración, mejor para sync futuro            |
| Soft deletes   | Sí                            | Nada se borra realmente, se puede restaurar             |
| Encriptación   | AES-256-GCM                   | Estándar de la industria, authenticated encryption      |
| Key derivation | PBKDF2 (100k iterations)      | Resistente a brute-force                                |
| Moneda default | ARS                           | Target audience: Latinoamérica                          |
| Auth           | Password + session (NextAuth) | Server-side, seguro, multi-device                       |
| Deployment     | Vercel / Railway              | Deploy fácil, scaling automático, SSL incluido          |

---

## 9. Métricas de Éxito

- [ ] Tiempo de carga < 2s (SSR + cache)
- [ ] Accesible desde cualquier dispositivo (celu, compu, tablet)
- [ ] Datos encriptados en reposo (E2E)
- [ ] Backups automáticos de la base de datos
- [ ] Backup/restore manual funciona correctamente
- [ ] UI intuitiva (sin tutorial)
- [ ] Deploy en < 5 minutos (Vercel/Railway)

---

## 10. Próximos Pasos

1. **Aprobar documento funcional** — revisar y ajustar
2. **SDD Init** — inicializar contexto del proyecto
3. **SDD Proposal** — proponer arquitectura técnica
4. **SDD Spec** — especificaciones detalladas
5. **SDD Design** — diseño de componentes y database
6. **SDD Tasks** — breakdown de implementación
7. **SDD Apply** — implementar por lotes
8. **SDD Verify** — validar contra specs

---

_Documento generado como parte del proceso de planificación del proyecto Finanzas._
