# Decisiones Técnicas de ClinicalApp

Este documento registra las decisiones técnicas importantes tomadas durante el desarrollo de ClinicalApp, explicando el contexto, alternativas consideradas y el razonamiento detrás de cada elección.

## 📋 Formato de Registro

Cada decisión sigue el formato ADR (Architecture Decision Record):

- **Contexto**: Situación que llevó a la decisión
- **Alternativas**: Opciones consideradas
- **Decisión**: Elección final
- **Consecuencias**: Impacto positivo y negativo

---

## ADR-001: Uso de Astro como Framework Principal

**Fecha**: Inicio del proyecto  
**Estado**: Aceptada

### Contexto

Necesitábamos un framework que combinara:

- Server-Side Rendering (SSR) para SEO y performance
- Flexibilidad para usar React donde sea necesario
- API Routes integradas
- Excelente performance out-of-the-box

### Alternativas Consideradas

1. **Next.js**
   - ✅ Maduro y con gran ecosistema
   - ❌ Más pesado, requiere más configuración
   - ❌ Enfoque más opinado hacia React

2. **Remix**
   - ✅ Excelente para SSR y data loading
   - ❌ Menor ecosistema
   - ❌ Más complejo para nuestro caso de uso

3. **Astro**
   - ✅ Zero JS por defecto (solo donde se necesita)
   - ✅ Flexibilidad para usar múltiples frameworks
   - ✅ API Routes integradas
   - ✅ Excelente performance
   - ✅ Curva de aprendizaje suave

### Decisión

Elegimos **Astro** como framework principal.

### Consecuencias

**Positivas:**

- Bundle size reducido (solo carga JS donde es necesario)
- Mejor performance inicial
- Flexibilidad para usar React solo en componentes interactivos
- API Routes integradas sin configuración adicional
- Excelente DX (Developer Experience)

**Negativas:**

- Ecosistema más pequeño que Next.js
- Menos recursos y tutoriales disponibles
- Algunas características avanzadas pueden requerir más trabajo

---

## ADR-002: Drizzle ORM en lugar de Prisma

**Fecha**: Inicio del proyecto  
**Estado**: Aceptada

### Contexto

Necesitábamos un ORM que:

- Soporte SQLite/Turso
- Type-safe queries
- Migraciones versionadas
- Performance optimizado
- No genere código innecesario

### Alternativas Consideradas

1. **Prisma**
   - ✅ Maduro y popular
   - ✅ Excelente DX
   - ❌ Genera mucho código
   - ❌ Más pesado
   - ❌ Soporte para SQLite menos optimizado

2. **TypeORM**
   - ✅ Maduro
   - ❌ Más complejo de configurar
   - ❌ Menos type-safe
   - ❌ Performance inferior

3. **Drizzle ORM**
   - ✅ Type-safe sin generación de código
   - ✅ Lightweight
   - ✅ Excelente soporte para SQLite
   - ✅ Queries más cercanas a SQL
   - ✅ Migraciones simples

### Decisión

Elegimos **Drizzle ORM** como ORM principal.

### Consecuencias

**Positivas:**

- Código más limpio y mantenible
- Mejor performance (menos overhead)
- Type-safety completo sin generación
- Migraciones simples y versionadas
- Queries más expresivas y cercanas a SQL

**Negativas:**

- Ecosistema más pequeño que Prisma
- Menos recursos de aprendizaje
- Algunas características avanzadas pueden requerir más código manual

---

## ADR-003: Turso (SQLite Distribuido) como Base de Datos

**Fecha**: Inicio del proyecto  
**Estado**: Aceptada

### Contexto

Necesitábamos una base de datos que:

- Sea simple de configurar y mantener
- Soporte multi-tenancy (centros médicos)
- Escale horizontalmente
- Tenga bajo costo operativo
- Permita desarrollo local fácil

### Alternativas Consideradas

1. **PostgreSQL (Supabase/Neon)**
   - ✅ Maduro y robusto
   - ✅ Funciones avanzadas
   - ❌ Más complejo de configurar
   - ❌ Mayor costo operativo
   - ❌ Overhead para nuestro caso de uso

2. **MySQL (PlanetScale)**
   - ✅ Popular y conocido
   - ❌ Más complejo que SQLite
   - ❌ Requiere más recursos

3. **SQLite Local**
   - ✅ Simple y rápido
   - ❌ No escala horizontalmente
   - ❌ Problemas de concurrencia en producción

4. **Turso (SQLite Distribuido)**
   - ✅ Simplicidad de SQLite
   - ✅ Escalabilidad horizontal
   - ✅ Bajo costo
   - ✅ Réplicas automáticas
   - ✅ Desarrollo local con SQLite normal

### Decisión

Elegimos **Turso** como base de datos principal.

### Consecuencias

**Positivas:**

- Desarrollo local simple (SQLite normal)
- Escalabilidad sin cambios de código
- Bajo costo operativo
- Réplicas automáticas para alta disponibilidad
- Migración fácil desde SQLite local

**Negativas:**

- Menos funciones avanzadas que PostgreSQL
- Ecosistema más pequeño
- Algunas limitaciones de SQLite (ej: ALTER TABLE limitado)
- Dependencia de un servicio externo

---

## ADR-004: Lucia Auth en lugar de NextAuth/Auth.js

**Fecha**: Inicio del proyecto  
**Estado**: Aceptada

### Contexto

Necesitábamos un sistema de autenticación que:

- Sea framework-agnostic
- Soporte sesiones seguras
- Sea simple de integrar
- No dependa de OAuth providers
- Permita control total sobre el flujo

### Alternativas Consideradas

1. **NextAuth.js / Auth.js**
   - ✅ Popular y maduro
   - ✅ Muchos providers OAuth
   - ❌ Diseñado para Next.js
   - ❌ Más complejo de lo necesario
   - ❌ Menos control sobre el flujo

2. **Clerk**
   - ✅ Muy fácil de usar
   - ✅ UI pre-construida
   - ❌ Servicio externo (costo)
   - ❌ Menos control
   - ❌ Vendor lock-in

3. **Lucia Auth**
   - ✅ Framework-agnostic
   - ✅ Simple y ligero
   - ✅ Control total
   - ✅ Sesiones seguras
   - ✅ Fácil integración con Drizzle

### Decisión

Elegimos **Lucia Auth** como sistema de autenticación.

### Consecuencias

**Positivas:**

- Control total sobre el flujo de autenticación
- Integración perfecta con Drizzle
- Sin dependencias externas
- Sesiones seguras y configurables
- Fácil de extender y personalizar

**Negativas:**

- Más código manual que soluciones managed
- No incluye UI pre-construida
- Menos recursos y ejemplos disponibles
- OAuth requiere implementación manual

---

## ADR-005: Server-Sent Events (SSE) en lugar de WebSockets

**Fecha**: Durante desarrollo  
**Estado**: Aceptada

### Contexto

Necesitábamos comunicación en tiempo real para:

- Actualizaciones de turnos
- Notificaciones de nuevas consultas
- Sincronización entre usuarios del mismo centro médico
- Sin necesidad de comunicación bidireccional compleja

### Alternativas Consideradas

1. **WebSockets (Socket.io)**
   - ✅ Bidireccional completo
   - ✅ Popular y maduro
   - ❌ Más complejo de implementar
   - ❌ Requiere servidor adicional o configuración
   - ❌ Overhead innecesario para nuestro caso

2. **Polling**
   - ✅ Simple de implementar
   - ❌ Ineficiente (muchas requests)
   - ❌ Mayor latencia
   - ❌ Mayor carga en servidor

3. **Server-Sent Events (SSE)**
   - ✅ Simple de implementar
   - ✅ Nativo del navegador
   - ✅ Menor overhead que WebSockets
   - ✅ Perfecto para unidireccional (servidor → cliente)
   - ✅ Reconexión automática

### Decisión

Elegimos **Server-Sent Events (SSE)** para comunicación en tiempo real.

### Consecuencias

**Positivas:**

- Implementación simple (sin librerías adicionales)
- Menor overhead que WebSockets
- Reconexión automática
- Perfecto para nuestro caso de uso (unidireccional)
- Nativo del navegador

**Negativas:**

- Solo unidireccional (servidor → cliente)
- Si necesitamos comunicación bidireccional en el futuro, requerirá cambio
- Algunos proxies pueden tener problemas con SSE

---

## ADR-006: Nanostores para Estado Global

**Fecha**: Durante desarrollo  
**Estado**: Aceptada

### Contexto

Necesitábamos gestión de estado que:

- Funcione con Astro y React
- Sea ligero y performante
- Soporte persistencia
- No requiera providers complejos
- Sea simple de usar

### Alternativas Consideradas

1. **Redux / Zustand**
   - ✅ Maduro y popular
   - ❌ Más complejo de configurar
   - ❌ Requiere providers en React
   - ❌ Más overhead

2. **Context API de React**
   - ✅ Nativo de React
   - ❌ No funciona bien con Astro
   - ❌ Puede causar re-renders innecesarios
   - ❌ No tiene persistencia built-in

3. **Jotai / Recoil**
   - ✅ Moderno y ligero
   - ❌ Más orientado a React
   - ❌ Menos compatible con Astro

4. **Nanostores**
   - ✅ Framework-agnostic
   - ✅ Muy ligero
   - ✅ Persistencia integrada
   - ✅ Funciona con Astro y React
   - ✅ Simple API

### Decisión

Elegimos **Nanostores** para gestión de estado global.

### Consecuencias

**Positivas:**

- Funciona perfectamente con Astro y React
- Muy ligero (minimal bundle size)
- Persistencia fácil con `@nanostores/persistent`
- API simple y directa
- Sin providers complejos

**Negativas:**

- Ecosistema más pequeño
- Menos recursos y ejemplos
- Algunas características avanzadas pueden requerir más código

---

## ADR-007: Atomic Design para Organización de Componentes

**Fecha**: Inicio del proyecto  
**Estado**: Aceptada

### Contexto

Necesitábamos una metodología para organizar componentes que:

- Sea escalable
- Facilite la reutilización
- Sea fácil de entender para nuevos desarrolladores
- Permita crecimiento del proyecto

### Alternativas Consideradas

1. **Organización por Feature**
   - ✅ Agrupa código relacionado
   - ❌ Puede llevar a duplicación
   - ❌ Menos reutilización entre features

2. **Organización por Tipo (Components/Pages/Utils)**
   - ✅ Simple
   - ❌ Puede volverse desordenado con muchos componentes
   - ❌ No guía sobre nivel de complejidad

3. **Atomic Design**
   - ✅ Escalable y organizado
   - ✅ Fomenta reutilización
   - ✅ Fácil de entender (átomos → moléculas → organismos)
   - ✅ Estándar de la industria

### Decisión

Elegimos **Atomic Design** para organizar componentes.

### Consecuencias

**Positivas:**

- Estructura clara y predecible
- Fomenta reutilización de componentes
- Fácil onboarding de nuevos desarrolladores
- Escala bien con el crecimiento del proyecto
- Separación clara de responsabilidades

**Negativas:**

- Puede ser excesivo para proyectos pequeños
- Requiere disciplina para mantener la estructura
- Algunos componentes pueden no encajar claramente en una categoría

---

## ADR-008: Integración Multi-Provider para IA

**Fecha**: Durante desarrollo  
**Estado**: Aceptada

### Contexto

Necesitábamos integración con IA para:

- Dictado médico
- Autocompletado inteligente
- Procesamiento de texto médico

Pero queríamos evitar vendor lock-in y tener flexibilidad.

### Alternativas Consideradas

1. **Solo Google Gemini**
   - ✅ Excelente calidad
   - ❌ Vendor lock-in
   - ❌ Sin alternativa si hay problemas

2. **Solo Groq**
   - ✅ Rápido y económico
   - ❌ Vendor lock-in
   - ❌ Menos features que Gemini

3. **Multi-Provider (Abstracción)**
   - ✅ Flexibilidad para cambiar providers
   - ✅ Fallback si un provider falla
   - ✅ Comparación de resultados
   - ✅ Menos vendor lock-in

### Decisión

Elegimos implementar una **arquitectura multi-provider** con abstracción.

### Consecuencias

**Positivas:**

- Flexibilidad para cambiar providers
- Posibilidad de fallback automático
- Menos dependencia de un solo vendor
- Facilita comparación de resultados
- Mejor resiliencia

**Negativas:**

- Más código para mantener
- Necesidad de mantener compatibilidad entre providers
- Posible complejidad adicional

---

## ADR-009: Transacciones Atómicas para Operaciones Críticas

**Fecha**: Durante desarrollo  
**Estado**: Aceptada

### Contexto

Operaciones como crear un paciente requieren múltiples inserts relacionados:

- Insertar paciente
- Crear historia clínica
- Crear relación profesional-paciente

Si alguna falla, todo debe revertirse.

### Alternativas Consideradas

1. **Inserts Separados con Rollback Manual**
   - ❌ Complejo de manejar
   - ❌ Propenso a errores
   - ❌ Difícil de mantener consistencia

2. **Transacciones de Base de Datos**
   - ✅ Garantiza atomicidad
   - ✅ Rollback automático en caso de error
   - ✅ Consistencia garantizada
   - ✅ Simple de usar con Drizzle

### Decisión

Elegimos usar **transacciones de base de datos** para todas las operaciones críticas.

### Consecuencias

**Positivas:**

- Consistencia garantizada
- Rollback automático en errores
- Código más limpio y mantenible
- Menos bugs relacionados con estados inconsistentes

**Negativas:**

- Puede ser más lento en algunos casos
- Requiere entender bien las transacciones
- Posibles deadlocks si no se manejan bien

---

## ADR-010: Sistema de Auditoría Integrado

**Fecha**: Inicio del proyecto  
**Estado**: Aceptada

### Contexto

Para cumplimiento normativo y seguridad, necesitamos:

- Registro de todas las acciones críticas
- Trazabilidad de cambios
- Información de quién, cuándo y qué cambió

### Alternativas Consideradas

1. **Logs en Archivos**
   - ✅ Simple
   - ❌ Difícil de consultar
   - ❌ No estructurado
   - ❌ No relacionado con datos

2. **Servicio Externo de Auditoría**
   - ✅ Especializado
   - ❌ Costo adicional
   - ❌ Dependencia externa
   - ❌ Más complejo de integrar

3. **Tabla de Auditoría en BD**
   - ✅ Integrado con la aplicación
   - ✅ Fácil de consultar
   - ✅ Relacionado con datos
   - ✅ Sin costo adicional

### Decisión

Elegimos implementar una **tabla de auditoría integrada** en la base de datos.

### Consecuencias

**Positivas:**

- Trazabilidad completa
- Fácil de consultar y analizar
- Integrado con la aplicación
- Sin costo adicional
- Cumplimiento normativo facilitado

**Negativas:**

- Puede crecer mucho con el tiempo
- Requiere estrategia de archivado/limpieza
- Impacto en performance si no se indexa bien

---

## ADR-011: Sistema de Suscripciones con Grandfathering

**Fecha**: Durante desarrollo  
**Estado**: Aceptada

### Contexto

Necesitamos un sistema de suscripciones que:

- Permita diferentes planes
- Verifique límites en tiempo real
- Permita que usuarios mantengan beneficios de planes antiguos (grandfathering)

### Alternativas Consideradas

1. **Solo Plan Actual**
   - ✅ Simple
   - ❌ Usuarios pierden beneficios al cambiar planes
   - ❌ Mala experiencia de usuario

2. **Grandfathering con planSnapshot**
   - ✅ Usuarios mantienen beneficios
   - ✅ Flexibilidad para cambiar planes
   - ✅ Mejor experiencia de usuario

### Decisión

Elegimos implementar **grandfathering con planSnapshot**.

### Consecuencias

**Positivas:**

- Mejor experiencia de usuario
- Flexibilidad para cambiar planes sin perder beneficios
- Permite promociones y ofertas especiales
- Facilita migración de planes

**Negativas:**

- Más complejidad en la lógica
- Necesidad de mantener snapshots
- Posible confusión si no se documenta bien

---

## ADR-012: TypeScript Opcional (Migración Gradual)

**Fecha**: Durante desarrollo  
**Estado**: Aceptada

### Contexto

El proyecto comenzó con JavaScript y algunos archivos TypeScript. Necesitábamos decidir sobre la estrategia de tipos.

### Alternativas Consideradas

1. **Migrar Todo a TypeScript**
   - ✅ Consistencia total
   - ✅ Type-safety completo
   - ❌ Mucho trabajo
   - ❌ Puede romper cosas existentes

2. **Solo JavaScript**
   - ✅ Simple
   - ❌ Sin type-safety
   - ❌ Más errores en runtime

3. **TypeScript Opcional (Migración Gradual)**
   - ✅ Permite migración incremental
   - ✅ Nuevos archivos en TypeScript
   - ✅ Sin romper código existente
   - ✅ Mejora gradual del type-safety

### Decisión

Elegimos **TypeScript opcional con migración gradual**.

### Consecuencias

**Positivas:**

- Migración sin interrumpir desarrollo
- Nuevos archivos con type-safety
- Mejora gradual del código
- Flexibilidad para el equipo

**Negativas:**

- Inconsistencia temporal
- Necesidad de mantener ambos lenguajes
- Puede llevar tiempo completar la migración

---

## 📊 Resumen de Decisiones

| ADR     | Decisión               | Impacto | Estado      |
| ------- | ---------------------- | ------- | ----------- |
| ADR-001 | Astro como framework   | Alto    | ✅ Aceptada |
| ADR-002 | Drizzle ORM            | Alto    | ✅ Aceptada |
| ADR-003 | Turso como BD          | Alto    | ✅ Aceptada |
| ADR-004 | Lucia Auth             | Medio   | ✅ Aceptada |
| ADR-005 | SSE para tiempo real   | Medio   | ✅ Aceptada |
| ADR-006 | Nanostores             | Bajo    | ✅ Aceptada |
| ADR-007 | Atomic Design          | Bajo    | ✅ Aceptada |
| ADR-008 | Multi-provider IA      | Medio   | ✅ Aceptada |
| ADR-009 | Transacciones atómicas | Alto    | ✅ Aceptada |
| ADR-010 | Auditoría integrada    | Medio   | ✅ Aceptada |
| ADR-011 | Grandfathering         | Bajo    | ✅ Aceptada |
| ADR-012 | TypeScript gradual     | Medio   | ✅ Aceptada |

---

## 🔄 Decisiones Pendientes / Futuras

### ADR-013: Rate Limiting (PRIORIDAD ALTA)

**Contexto**: Necesitamos proteger APIs de abuso. Actualmente todas las APIs están sin límites, lo que representa un riesgo de seguridad y costos.

**Problemas Identificados**:

- Ataques de fuerza bruta en login/registro sin protección
- Endpoints costosos (IA, PDFs) pueden ser abusados
- Sin límites por usuario/IP, un atacante puede sobrecargar el servidor
- Costos potenciales altos en APIs de terceros (Gemini, Groq)

**Opciones Consideradas**:

1. **Upstash Rate Limit** (Recomendada)
   - ✅ Servicio gestionado, sin infraestructura propia
   - ✅ Funciona con múltiples instancias
   - ✅ Free tier generoso (10,000 requests/día)
   - ✅ Simple de integrar
   - ❌ Dependencia externa
   - ❌ Costo cuando crezca (~$0.20/millón requests)

2. **Redis + librería custom**
   - ✅ Control total
   - ✅ Sin dependencias externas (si ya tienes Redis)
   - ❌ Requiere infraestructura Redis
   - ❌ Más código a mantener

3. **In-memory (Map/Set)**
   - ✅ Sin dependencias
   - ✅ Simple
   - ❌ No funciona con múltiples instancias
   - ❌ Se pierde al reiniciar

**Recomendación**: Empezar con **Upstash Rate Limit** para MVP, migrar a Redis propio si el tráfico crece.

**Configuración Propuesta**:

```typescript
// Límites sugeridos por tipo de endpoint
- /api/auth/signin: 5 requests / 15 minutos (por IP)
- /api/auth/signup: 3 requests / hora (por IP)
- /api/atencion/process-notes: 20 requests / minuto (por usuario)
- /api/certificados, /api/recetas: 10 requests / minuto (por usuario)
- /api/pacientes/buscar: 30 requests / 10 segundos (por usuario)
- Endpoints normales: 60 requests / minuto (por usuario)
```

**Estado**: 🔴 **PRIORIDAD ALTA** - Implementar antes de producción

### ADR-014: Almacenamiento de Archivos (Futuro)

**Contexto**: Actualmente en filesystem local, necesitamos escalar.

**Opciones**:

- AWS S3
- Cloudflare R2
- Backblaze B2

**Estado**: ⏳ Pendiente de decisión

### ADR-015: Sistema de Caché (Futuro)

**Contexto**: Mejorar performance con caché.

**Opciones**:

- Redis
- In-memory cache
- CDN para assets estáticos

**Estado**: ⏳ Pendiente de decisión

---

## 📝 Notas sobre el Proceso

- Las decisiones se documentan cuando tienen impacto significativo
- Se revisan periódicamente y pueden cambiar si el contexto cambia
- Las decisiones rechazadas también se documentan para referencia futura
- Cualquier miembro del equipo puede proponer nuevas ADRs

---

**Última actualización**: 2024  
**Versión del documento**: 1.0
