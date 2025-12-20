# Arquitectura de ClinicalApp

Este documento describe la arquitectura técnica del sistema ClinicalApp, sus componentes principales, patrones de diseño y decisiones arquitectónicas.

## 📐 Visión General

ClinicalApp es una aplicación web moderna construida con un enfoque híbrido que combina:

- **Astro**: Framework principal para SSR (Server-Side Rendering) y routing
- **React**: Para componentes interactivos del lado del cliente
- **Drizzle ORM**: Para gestión de base de datos con type-safety
- **Turso (SQLite distribuido)**: Base de datos principal
- **Lucia Auth**: Sistema de autenticación y gestión de sesiones

### Stack Tecnológico

```
Frontend:
├── Astro 5.x (SSR Framework)
├── React 18.x (Componentes interactivos)
├── Tailwind CSS (Estilos)
└── Nanostores (Estado global)

Backend:
├── Astro API Routes (Endpoints)
├── Node.js (Runtime)
└── Lucia Auth (Autenticación)

Base de Datos:
├── Turso (SQLite distribuido)
├── Drizzle ORM (Query Builder)
└── Drizzle Kit (Migraciones)

Servicios Externos:
├── Google Gemini API (IA)
├── Groq API (IA alternativa)
└── WHO ICD-11 API (Códigos de diagnóstico)
```

## 🏗️ Arquitectura de Capas

```
┌─────────────────────────────────────────┐
│         PRESENTACIÓN (UI)               │
│  Astro Pages + React Components         │
│  Atomic Design Pattern                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         MIDDLEWARE                       │
│  Autenticación + Autorización            │
│  Protección CSRF + Validación de Rutas   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         API LAYER                        │
│  Astro API Routes                        │
│  Validación + Lógica de Negocio          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         SERVICIOS                       │
│  Business Logic                         │
│  Integraciones Externas                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         DATA LAYER                      │
│  Drizzle ORM                             │
│  Transacciones + Queries                 │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         BASE DE DATOS                   │
│  Turso (SQLite Distribuido)             │
└─────────────────────────────────────────┘
```

## 📁 Estructura de Directorios

```
src/
├── components/          # Componentes UI
│   ├── atomos/         # Componentes atómicos (botones, inputs)
│   ├── moleculas/      # Componentes moleculares (formularios simples)
│   ├── organismo/      # Componentes complejos (formularios completos)
│   └── layouts/         # Layouts de página
│
├── pages/              # Páginas y endpoints
│   ├── api/            # API Routes (endpoints REST)
│   ├── dashboard/      # Páginas del dashboard
│   └── login/          # Páginas públicas
│
├── db/                 # Base de datos
│   ├── schema/         # Esquemas de Drizzle ORM
│   └── scripts/       # Scripts de utilidad (seeds, migraciones)
│
├── lib/                # Librerías y utilidades core
│   ├── auth.ts         # Configuración de Lucia Auth
│   ├── audit.ts        # Sistema de auditoría
│   ├── sse/            # Server-Sent Events
│   └── templates/      # Plantillas de documentos
│
├── services/           # Servicios de negocio
│   ├── ia.services.ts  # Integración con IA
│   ├── agenda.services.ts
│   └── suscripciones/  # Gestión de suscripciones
│
├── context/            # Estado global (Nanostores)
│   ├── store.js        # Store principal
│   ├── agenda.store.ts
│   └── recepcion.store.ts
│
├── utils/              # Utilidades generales
├── middleware.ts       # Middleware de autenticación
└── types/              # Definiciones TypeScript
```

## 🎨 Patrón de Diseño: Atomic Design

El proyecto sigue la metodología **Atomic Design** para organizar componentes:

### Átomos (`components/atomos/`)

Componentes básicos e indivisibles:

- `Button.tsx` - Botones reutilizables
- `Input.tsx` - Campos de entrada
- `Select.tsx` - Selectores
- `Link.tsx` - Enlaces

**Características:**

- Sin dependencias de otros componentes
- Altamente reutilizables
- Props simples y claras

### Moléculas (`components/moleculas/`)

Combinaciones de átomos:

- `FormularioLogin.tsx` - Input + Button
- `CardTurno.tsx` - Múltiples átomos combinados
- `ModalReact.tsx` - Overlay + Contenido

**Características:**

- Compuestos de 2+ átomos
- Lógica simple de UI
- Reutilizables en diferentes contextos

### Organismos (`components/organismo/`)

Componentes complejos con lógica de negocio:

- `FormularioNuevoPaciente.tsx` - Formulario completo
- `Agenda.tsx` - Calendario interactivo
- `HistoriaClinica.tsx` - Vista completa de HC

**Características:**

- Lógica de negocio integrada
- Múltiples moléculas y átomos
- Específicos del dominio

## 🔐 Sistema de Autenticación y Autorización

### Autenticación con Lucia Auth

```typescript
// src/lib/auth.ts
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: import.meta.env.PROD, // HTTPS en producción
    },
  },
});
```

**Flujo de Autenticación:**

1. **Login** (`/api/auth/signin`)
   - Validación de credenciales
   - Hash de contraseña con bcrypt
   - Creación de sesión con Lucia
   - Generación de JWT para datos de usuario
   - Log de auditoría

2. **Middleware** (`src/middleware.ts`)
   - Validación de sesión en cada request
   - Protección CSRF en métodos no-GET
   - Verificación de roles y permisos
   - Redirección según rol del usuario

3. **Sesión**
   - Cookie HTTP-only para seguridad
   - Refresh automático de sesión
   - Invalidación en logout

### Sistema de Roles

```typescript
roles: 'superadmin' | 'admin' | 'profesional' | 'recepcionista' | 'dataEntry' | 'reader';
```

**Jerarquía de Permisos:**

```
superadmin
  └── Acceso total al sistema

admin (adminLocal)
  └── Gestión completa del centro médico
  └── Usuarios, configuración, facturación

profesional
  └── Gestión de pacientes
  └── Historia clínica
  └── Agenda personal

recepcionista
  └── Gestión de turnos
  └── Recepción de pacientes
  └── Vista limitada de pacientes

dataEntry
  └── Solo entrada de datos

reader
  └── Solo lectura
```

### Protección de Rutas

```typescript
// src/lib/protectRoutes.js
const PUBLIC_ROUTES = ['/login', '/api/auth/signin', ...]
const ADMIN_ROUTES = ['/dashboard/usuarios/', ...]
const RECEPCION_ROUTES = ['/dashboard/recepcion/', ...]
```

El middleware valida:

- Sesión activa
- Rol del usuario
- Permisos específicos por centro médico

## 🗄️ Arquitectura de Base de Datos

### ORM: Drizzle

**Ventajas:**

- Type-safe queries
- Migraciones versionadas
- Soporte para transacciones
- Performance optimizado

**Ejemplo de Schema:**

```typescript
// src/db/schema/pacientes.ts
export const pacientes = sqliteTable('pacientes', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  dni: integer('dni').notNull().unique(),
  centroMedicoId: text('centroMedicoId')
    .references(() => centrosMedicos.id)
    .notNull(),
  // ...
});
```

### Transacciones Atómicas

Operaciones críticas usan transacciones para garantizar consistencia:

```typescript
const result = await db.transaction(async (trx) => {
  // 1. Crear paciente
  const [paciente] = await trx.insert(pacientes).values(...).returning();

  // 2. Crear historia clínica
  await trx.insert(historiaClinica).values({ pacienteId: paciente.id, ... });

  // 3. Crear relación profesional-paciente
  await trx.insert(pacienteProfesional).values({ ... });

  return paciente;
});
```

### Migraciones

```bash
# Generar migración
pnpm drizzle-kit generate

# Aplicar migración
pnpm drizzle-kit push
```

Las migraciones se almacenan en `drizzle/` y son versionadas.

## 🔄 Comunicación en Tiempo Real

### Server-Sent Events (SSE)

El sistema usa SSE para actualizaciones en tiempo real sin WebSockets:

**Arquitectura:**

```
Cliente                    Servidor
  │                          │
  ├─ GET /api/events ────────>│
  │                          │
  │<─── Event Stream ────────┤
  │                          │
  │                          │ (Evento: turno-creado)
  │<─── event: turno-creado ──┤
  │     data: {...}          │
  │                          │
```

**Implementación:**

```typescript
// src/lib/sse/sse.ts
export function emitEvent(
  event: string,
  data: unknown,
  opts?: { centroMedicoId?: string; userId?: string }
): void {
  // Filtrado por centro médico o usuario
  // Envío a clientes conectados
}
```

**Eventos Principales:**

- `turno-creado` - Nuevo turno creado
- `turno-eliminado` - Turno cancelado
- `paciente-creado` - Nuevo paciente
- `atencion-guardada` - Consulta guardada

**Heartbeat:**

- Ping cada 15 segundos para mantener conexión
- Limpieza automática de clientes desconectados

## 🤖 Integración con Inteligencia Artificial

### Arquitectura Multi-Provider

El sistema soporta múltiples proveedores de IA:

```typescript
// src/services/ia.services.ts
type AIProvider = 'gemini' | 'groq';

export const callAIModel = async (text: string, provider: AIProvider = 'groq') => {
  if (provider === 'gemini') {
    return await callGeminiModel(text);
  } else {
    return await callGroqModel(text);
  }
};
```

### Casos de Uso

1. **Dictado Médico**
   - Transcripción de audio a texto estructurado
   - Extracción de: diagnósticos, medicamentos, signos vitales
   - Formato JSON estructurado

2. **Autocompletado**
   - Sugerencias inteligentes en formularios
   - Completado de diagnósticos
   - Asistencia en redacción de notas

### Flujo de Procesamiento

```
Usuario dicta →
  Transcripción (cliente) →
    Envío a API →
      Procesamiento con IA →
        Estructuración JSON →
          Validación →
            Guardado en BD
```

## 💳 Sistema de Suscripciones

### Arquitectura

```
Planes (planes)
  └── Define límites y características

Suscripciones (suscripciones)
  └── Relaciona centro médico con plan
  └── Estado: activa | cancelada | impaga | prueba
  └── planSnapshot: Snapshot de límites al contratar

SubscriptionService
  └── Verifica límites en tiempo real
  └── Valida features disponibles
```

### Verificación de Límites

```typescript
// src/services/suscripciones/SubscriptionService.ts
async checkLimit(
  centroMedicoId: string,
  resourceKey: string,
  currentCount: number
): Promise<{ allowed: boolean; limit: number | string }> {
  const plan = await this.getPlanActual(centroMedicoId);
  const limite = plan.limites[resourceKey];

  // Verificar si está dentro del límite
  return {
    allowed: currentCount < limite,
    limit: limite
  };
}
```

### Grandfathering

El sistema soporta "grandfathering" - usuarios mantienen límites de planes antiguos:

```typescript
// Si hay planSnapshot, usa ese en lugar del plan actual
const limites = result.suscripcion.planSnapshot
  ? result.suscripcion.planSnapshot
  : result.plan.limites;
```

## 📊 Flujo de Datos

### Request Flow

```
1. Usuario hace request
   ↓
2. Middleware valida sesión y permisos
   ↓
3. Astro API Route recibe request
   ↓
4. Validación de datos de entrada
   ↓
5. Servicio de negocio procesa lógica
   ↓
6. Drizzle ORM ejecuta queries
   ↓
7. Transacción (si aplica)
   ↓
8. Auditoría (log de acción)
   ↓
9. Emisión de evento SSE (si aplica)
   ↓
10. Respuesta al cliente
```

### Estado Global

**Nanostores** para estado compartido:

```typescript
// src/context/store.js
export const globalStore = persistentMap('global', {
  user: null,
  theme: 'light',
  // ...
});
```

**Stores Específicos:**

- `agenda.store.ts` - Estado de agenda
- `recepcion.store.ts` - Estado de recepción
- `consultaAtencion.store.ts` - Estado de consulta actual

## 🔒 Seguridad

### Protecciones Implementadas

1. **CSRF Protection**
   - Validación de origen en métodos no-GET
   - Verificación de headers Origin/Host

2. **Autenticación**
   - Cookies HTTP-only
   - Sesiones seguras con Lucia
   - JWT para datos de usuario

3. **Autorización**
   - Validación de roles en middleware
   - Verificación de permisos por centro médico
   - Protección de rutas sensibles

4. **Auditoría**
   - Log de todas las acciones críticas
   - Registro de IP y User-Agent
   - Trazabilidad completa

5. **Validación de Datos**
   - Normalización de inputs
   - Validación de tipos
   - Sanitización de datos

### Áreas de Mejora

- [ ] Rate limiting en APIs
- [ ] Validación de archivos en servidor
- [ ] CORS configurado explícitamente
- [ ] Headers de seguridad (Helmet)

## 📦 Gestión de Archivos

### Almacenamiento

```
documentos/
  └── {centroMedicoId}/
      └── {pacienteId}/
          └── {archivo-unique-id}.pdf
```

**Características:**

- Organización por centro médico y paciente
- Nombres únicos para evitar colisiones
- Metadatos en base de datos (`archivosAdjuntos`)

**Validación:**

- Tipos permitidos: PDF, JPG, PNG
- Tamaño máximo: Configurable (actualmente en cliente)
- ⚠️ **TODO**: Validación en servidor

## 🎯 Patrones de Diseño Utilizados

### 1. Repository Pattern (Implícito)

- Drizzle ORM actúa como repositorio
- Abstracción de acceso a datos

### 2. Service Layer Pattern

- Lógica de negocio en `services/`
- Separación de responsabilidades

### 3. Middleware Pattern

- Interceptores de requests
- Validación centralizada

### 4. Observer Pattern

- SSE para eventos en tiempo real
- Stores reactivos con Nanostores

### 5. Factory Pattern

- Generación de IDs únicos
- Creación de instancias de servicios

## 🚀 Optimizaciones

### Performance

1. **SSR con Astro**
   - Renderizado en servidor
   - Menos JavaScript en cliente

2. **Code Splitting**
   - Componentes React con `client:load`
   - Lazy loading donde aplica

3. **Índices de BD**
   - Índices en campos de búsqueda frecuente
   - Optimización de queries

4. **Caché (Futuro)**
   - Implementar caché para datos estáticos
   - Redis para sesiones (opcional)

### Escalabilidad

- **Base de datos**: Turso permite réplicas
- **Archivos**: Considerar S3/Cloud Storage
- **SSE**: Implementar Redis para multi-instancia

## 📝 Convenciones de Código

### Naming

- **Componentes**: PascalCase (`FormularioPaciente.tsx`)
- **Funciones**: camelCase (`crearPaciente`)
- **Constantes**: UPPER_SNAKE_CASE (`PUBLIC_ROUTES`)
- **Archivos**: camelCase para funciones, PascalCase para componentes

### Estructura de Archivos API

```typescript
// src/pages/api/pacientes/create.ts
export const POST: APIRoute = async ({ request, locals }) => {
  // 1. Validación de sesión
  // 2. Validación de datos
  // 3. Lógica de negocio
  // 4. Transacción (si aplica)
  // 5. Auditoría
  // 6. Respuesta
};
```

## 🔄 Ciclo de Vida de una Consulta

```
1. Recepción crea turno
   ↓
2. Profesional inicia consulta
   ↓
3. Carga de datos del paciente
   ↓
4. Registro de motivo de consulta
   ↓
5. Signos vitales (opcional)
   ↓
6. Diagnósticos (con CIE-11)
   ↓
7. Medicamentos (con vademecum)
   ↓
8. Tratamiento y plan
   ↓
9. Archivos adjuntos (opcional)
   ↓
10. Guardado (transacción atómica)
   ↓
11. Generación de documentos (PDFs)
   ↓
12. Notificación vía SSE
```

## 🧪 Testing (Futuro)

**Estrategia recomendada:**

- **Unit Tests**: Vitest para lógica de negocio
- **Integration Tests**: Tests de API endpoints
- **E2E Tests**: Playwright para flujos completos

## 📚 Referencias

- [Astro Documentation](https://docs.astro.build)
- [Drizzle ORM](https://orm.drizzle.team)
- [Lucia Auth](https://lucia-auth.com)
- [Turso Database](https://turso.tech)

---

**Última actualización**: 2024
**Versión del documento**: 1.0
