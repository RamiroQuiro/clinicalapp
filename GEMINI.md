--- Context from: GEMINI.md ---
Eres **DevArchitect**, un asistente de desarrollo full-stack altamente especializado en el ecosistema JavaScript moderno. Tu expertise abarca:

## 🎯 ESPECIALIDADES TÉCNICAS


- **Astro** (v4+): SSR, islands architecture, optimización de rendimiento
- **React** (v18+): Hooks, Server Components, estado global
- **Drizzle ORM**: Schemas, relaciones, queries type-safe
- **TypeScript**: Tipado avanzado y mejores prácticas
- **Tailwind CSS**: Diseño responsive y sistemas de diseño

## 🚀 CARACTERÍSTICAS CLAVE

### INICIATIVA PROACTIVA

- Anticipa problemas técnicos antes de que ocurran
- Sugiere mejoras de arquitectura sin esperar ser preguntado
- Propone optimizaciones de performance automáticamente
- Identifica oportunidades para mejorar DX (Developer Experience)
- Propone soluciones alternativas a problemas técnicos
- Idioma: Español

### ARQUITECTURA Y ESTRUCTURA
para esto vamos a realizar una arquitectura multi-tenant, usaras la misma logica en las api, con varialbe locals, para validar la sesion con el usuario logueado.
para la respuesta de las api, vamos a usar la funcion createResponse que esta en utils/responseAPI.ts
las fucnioalidades van a estar separadas: services, lib, utils y store cada archivo correspodientes y cada uno con su seccion.
el diseño de coloresy estilos van a ir a una misma linea de diseño, claro sencillo, moderno y con las mejores practicas.

### 

---

# Registro de Sesiones - Proyecto Historia Clínica

Este archivo sirve como registro de las tareas, decisiones y cambios importantes realizados en el proyecto durante las sesiones de trabajo con Gemini.

## Stack Tecnológico Identificado

- **Framework Principal**: Astro
- **Framework UI**: React (con componentes `.jsx` y `.astro`)
- **Estilos**: Tailwind CSS
- **Base de Datos**: Turso DB con Drizzle ORM
- **Autenticación**: Lucia
- **Servidor**: Node.js
- **Gestión de Estado (Cliente)**: Nanostores
- **Comunicación Real-time**: Socket.IO

---

## Sesión 1: 2025-08-18

- **Inicio**: Se establece el plan de trabajo colaborativo.
- **Acción**: Se analiza la estructura del proyecto y se identifica el stack tecnológico.
- **Acción**: Se crea este archivo (`GEMINI.md`) para mantener un registro persistente entre sesiones.

---

## Sesión 2: 2025-08-20

- **Objetivo**: Refactorizar y mejorar la UI/UX de la pantalla de atención médica.
- **Decisión Arquitectónica**: Se descartó un enfoque multi-página en favor de una interfaz dinámica tipo SPA (Single-Page Application) utilizando una **Isla de React**.
- **Implementación (V2)**:
  - Se creó una nueva página (`IndexAtencionV2.astro`) que carga un componente principal de React (`Contenedor.tsx`).
  - `Contenedor.tsx` gestiona una interfaz de pestañas para navegar entre las secciones de la consulta sin recargar la página.
  - El código de React se refactorizó en una arquitectura modular: un componente para cada pantalla (`...Pantalla.tsx`) y un renderizador (`RenderizacionPantalla.tsx`) que elige qué pantalla mostrar.
  - Se creó el formulario principal de la consulta (`ConsultaActualPantalla.tsx`) con lógica para añadir y eliminar diagnósticos y tratamientos dinámicamente en el frontend.
- **Lógica de Guardado**:
  - Se implementó un sistema de dos botones en el header (`NavAtencionMedicaV2.astro`): "Guardar Borrador" y "Finalizar Consulta".
  - Estos botones se comunican con el componente de React mediante eventos de `window` para disparar la lógica de guardado.
- **Fix en Backend**:
  - Se corrigió un bug en el endpoint `/api/atencion/guardar.ts` que sobrescribía los diagnósticos. Se implementó un patrón de "borrar y re-insertar" para asegurar la consistencia de los datos.
- **Estado Actual**: El usuario está depurando un error surgido tras las últimas modificaciones, donde ha integrado `nanostores` para la gestión del estado del formulario.

---

## Sesión 3: 2025-08-20

- **Objetivo Principal**: Continuar el desarrollo y mejora de la interfaz de usuario para la gestión de consultas médicas.
- **Implementación de Vistas Históricas (Patrón de Tarjetas)**:
  - Se desarrolló un componente genérico `InfoCard.tsx` para mostrar elementos históricos de forma consistente.
  - **Historial de Diagnósticos (`DiagnosticosPantalla.tsx`):** Implementado con `InfoCard.tsx` y datos de ejemplo.
  - **Historial de Medicamentos (`MedicamentosPantalla.tsx`):** Implementado con `InfoCard.tsx` y datos de ejemplo.
  - **Historial de Visitas (`HistorialVisitasPantalla.tsx`):** Implementado con `InfoCard.tsx`. Se añadió funcionalidad para abrir un modal (`ModalReact`) con los detalles completos de la atención (`AtencionExistente.jsx`) al hacer clic en la tarjeta. Se integró con llamadas `fetch` a la API real para la lista y los detalles.
- **Visualización de Signos Vitales (`SignosVitalesPantalla.tsx`):**
  - Se implementaron gráficos de progreso utilizando `chart.js` y `react-chartjs-2`.
  - Mejoras UX/UI: Orden cronológico en el eje X, variación de colores en las líneas y un efecto "glassmorphism" en el fondo de los gráficos.
- **Estado Actual de `AntecedentesPantalla.tsx`:** Se revirtió a su estado anterior, utilizando `CardAntecedente.tsx` en lugar de `InfoCard.tsx` por preferencia del usuario.
- **Próximos Pasos (Pendientes):** Depuración de un error en `ConsultaActualPantalla.tsx` relacionado con la integración de `nanostores` y la lógica de guardado.

---

## Sesión 4: 2025-08-21

- **Objetivo**: Implementar un sistema de búsqueda y creación para "Motivos Iniciales" en la pantalla de consulta y refactorizar la UI de la sección de medicamentos.
- **Hook `useBusquedaFiltro.jsx`**:
  - Refactorizado para usar `useMemo` para mayor eficiencia.
  - Añadida la capacidad de detectar cuándo no hay resultados (`noResultados`) para mostrar un botón de "agregar" dinámicamente.
- **Componente `ContenedorMotivoInicialV2.tsx`**:
  - Reescrito para usar el hook mejorado, implementando un flujo completo de búsqueda, selección y creación.
  - Conectado a la API para obtener la lista de motivos y para crear nuevos.
- **Estado (`consultaAtencion.store.ts`)**:
  - Añadido el campo `motivoInicial` para separar el dato del `motivoConsulta` general, mejorando la integridad para futuras estadísticas.
- **Backend (API)**:
  - Creado endpoint `POST /api/motivos/create.ts` para guardar nuevos motivos.
  - Creado endpoint `GET /api/motivos/index.ts` para listar los motivos existentes (globales y por médico).
  - La API de listado se configuró para devolver temporalmente datos de un array local para facilitar el desarrollo del frontend.
- **Base de Datos (`motivoInicial.ts` schema)**:
  - Modificada la tabla `motivosIniciales` para añadir `creadoPorId` y `medicoId` (opcional), permitiendo así motivos globales o específicos por doctor.
  - Corregidos los nombres de las columnas a `snake_case` por convención.
- **UI Refactor (`MedicamentosPantalla.tsx`)**:
  - Creado un nuevo componente `CardMedicamentoV2.tsx` con un estilo cuadrado, inspirado en las tarjetas de "Signos Vitales".
  - Actualizada la pantalla de historial de medicamentos para usar estas nuevas tarjetas en una disposición de grilla, unificando el diseño.
- **Próximos Pasos**: Activar la funcionalidad de carga de detalles de visitas anteriores en `HistorialVisitasPantalla.tsx`.

---

## Sesión 5: 2025-08-22

- **Objetivo**: Implementar la visualización de detalles de atenciones médicas anteriores y corregir errores en el formulario de la consulta actual.
- **Corrección en Formulario (`ConsultaActualPantalla.tsx`)**:
  - Se solucionó un bug que impedía agregar medicamentos al estado cuando se usaban los nuevos campos `nombreGenerico` y `nombreComercial`. La validación fue actualizada para reflejar la nueva estructura de datos.
- **Refactorización de UI (Historial de Visitas)**:
  - Se creó un nuevo componente de tarjeta, `CardVisitaV2.tsx`, con un diseño "glassmorphism" para mostrar los resúmenes de las visitas en el historial.
  - Se actualizó la pantalla `HistorialVisitasPantalla.tsx` para usar estas nuevas tarjetas en un layout de grilla, reemplazando el `InfoCard` anterior.
- **Backend (API)**:
  - Se implementó un nuevo endpoint: `GET /api/pacientes/[pacienteId]/atenciones/[atencionId].ts`.
  - Este endpoint consulta y devuelve un objeto JSON con todos los datos detallados de una atención específica, incluyendo información del paciente, diagnósticos, medicamentos y signos vitales.
- **Visualización de Detalles de Atención**:
  - Se creó un nuevo componente, `AtencionExistenteV2.jsx`, para mostrar de forma limpia y estructurada los datos completos de una atención pasada obtenidos de la nueva API.
  - Este componente fue integrado en el modal que se abre al hacer clic en una visita en la pantalla `HistorialVisitasPantalla.tsx`.
- **Próximos Pasos**: El usuario continuará trabajando en un `AtencionExistenteV3.tsx` para refinar la visualización de los datos.

---

---

## Sesión 6: 2025-08-27

- **Objetivo**: Implementar la funcionalidad de editar y eliminar notas médicas.
- **Implementación**:
  - Se añadieron botones de "Editar" y "Eliminar" a la interfaz de `NotasMedicas.tsx`.
  - Se implementó la lógica en el frontend para manejar el estado de edición y la confirmación de borrado.
  - Se creó el endpoint `POST /api/notas/update.ts` para actualizar notas.
  - Se creó el endpoint `POST /api/notas/delete.ts` para el borrado lógico de notas.
- **Bug Fix**: Se solucionó un problema que impedía escribir en el editor de texto enriquecido (`react-quill`) al separar el formulario del modal en su propio componente (`FormularioNota.tsx`) para aislar el estado y evitar re-renderizados no deseados.
- **Próximos Pasos**: Discutir e implementar una vista de próximos turnos para el paciente.

- **Objetivo**: Implementar la visualización de próximos turnos del paciente.
- **Discusión de Schema**: Se propuso y se implementó una modificación del schema `turnos.ts` para incluir campos como `estado`, `duracion`, `tipoDeTurno`, `otorgaUserId`, `userMedicoId` y `atencionId`, mejorando la completitud de los datos.
- **Implementación**:
  - Se actualizó el servicio `pacientePerfil.services.ts` para incluir la consulta de próximos turnos, obteniendo `userMedicoId` para la lógica de permisos.
  - Se creó el componente `CardTurno.tsx` con un diseño similar a `CardMedicamentoV2.tsx`, incluyendo un menú de acciones (confirmar, cancelar, iniciar atención).
  - Se creó el componente `ProximosTurnos.astro` para mostrar la lista de turnos en tarjetas.
  - Se integró `ProximosTurnos.astro` en `index.astro`, posicionándolo debajo de la sección "Progresos" y haciéndolo colapsable.
  - Se añadió lógica condicional en `CardTurno.tsx` para habilitar/deshabilitar el botón "Atención" según el `userMedicoId` del turno y el `currentUserId`.

---

## Sesión 7: 2025-08-30

- **Objetivo**: Refactorizar la barra de navegación (`NavDash`) e implementar un buscador de pacientes global y profesional.
- **Decisión de Arquitectura Clave**: Tras iterar con un enfoque multi-componente (Input en Astro + Nanostore + Resultados en React), se decidió a petición del usuario encapsular toda la funcionalidad en una **única Isla de React** (`BuscadorGlobal.tsx`) para mayor robustez y simpleza, eliminando la necesidad de stores intermedios para esta funcionalidad.
- **Implementación - `NavDash`**:
  - Se rediseñó el menú de usuario para usar un dropdown desde el avatar, proveyendo enlaces a "Mi Perfil" y "Cerrar Sesión".
  - El usuario optó por mantener el saludo "Bienvenido [Nombre] + Fecha" en lugar de un título de página dinámico.
  - El botón de "Crear Paciente" fue movido por el usuario al `NavDash` para tener un acceso global.
- **Implementación - Buscador Global**:
  - **Componente (`BuscadorGlobal.tsx`)**: Se creó un componente React "todo en uno" que maneja el estado del input, el debouncing para no saturar la API, la llamada fetch, y el renderizado de la lista de resultados.
  - **Backend (`/api/pacientes/buscar.ts`)**: Se creó un nuevo endpoint que realiza una búsqueda case-insensitive en la base de datos (sobre `nombre`, `apellido` y `dni`) usando Drizzle ORM y devuelve los resultados.
  - **UX - Acciones Rápidas**: Los resultados de la búsqueda se mejoraron para incluir botones de acción ("Dar Turno", "Atender", "Perfil"), convirtiendo el buscador en una paleta de comandos.
  - **UX - Atajo de Teclado**: Se implementó un atajo de teclado global (`Ctrl+K` / `Cmd+K`) en el layout principal para dar foco al buscador desde cualquier parte de la aplicación.
- **Layout y Refactorización**:
  - Se corrigieron conflictos de `group-hover` en el `Sidebar` mediante el uso de grupos nombrados en Tailwind CSS.
  - Se discutieron y exploraron varios patrones de layout para el dashboard y los títulos de página, revirtiendo algunos cambios a preferencia del usuario para dejar el layout final a su gusto.

---

## Sesión 8: 2025-08-30

- **Objetivo**: Implementar el dictado por voz (Speech-to-Text) para campos de texto y resolver problemas relacionados.
- **Decisión de Arquitectura Clave**: Implementación de dictado por voz usando un custom hook de React (`useSpeechRecognition.ts`) para encapsular la lógica de la Web Speech API.
- **Implementación - Dictado por Voz**:
  - **Hook (`useSpeechRecognition.ts`)**: Se creó un custom hook de React para manejar la API `SpeechRecognition`, proveyendo estados/funciones (`isListening`, `newFinalSegment`, `startListening`, `stopListening`, `error`).
  - **Integración (`FormularioNota.tsx`)**: Se integró el hook en el componente `FormularioNota.tsx` (usado en el modal de "Notas Médicas").
  - **UI**: Se añadió un botón de micrófono al formulario que alterna la escucha y provee feedback visual.
  - **Manejo de Texto**: Se configuró el componente para añadir `newFinalSegment` a la descripción de la nota, asegurando una acumulación correcta sin repeticiones.
- **Depuración y Refinamientos**:
  - **Compatibilidad del Navegador**: Se identificaron y abordaron problemas con el soporte de la API `SpeechRecognition` en ciertos navegadores (ej. Opera GX), añadiendo manejo de errores.
  - **Lógica de Acumulación**: Se refinó el hook `useSpeechRecognition.ts` y la integración en `FormularioNota.tsx` para añadir correctamente solo los nuevos segmentos de texto transcrito, resolviendo problemas de repetición.
  - **Manejo de Errores**: Se implementaron comprobaciones robustas para la inicialización de `recognitionRef` para prevenir errores en tiempo de ejecución cuando la API no es soportada o inicializada.

---

## Sesión 9: 2025-09-02

- **Objetivo**: Definir el roadmap de desarrollo y comenzar con la implementación del sistema de auditoría.
- **Acción**: Se establece el siguiente roadmap de funcionalidades a desarrollar:

  ### Roadmap de Desarrollo

  #### 0. Flujo de Auto Check-in (Prioridad Inmediata)
  - **Objetivo**: Permitir que los pacientes hagan el check-in ellos mismos al llegar al consultorio sin necesidad de una recepcionista.
  - **Componentes**:
    - Página pública `/autocheckin` con campo para DNI.
    - Endpoint de API `POST /api/autocheckin` para validar el DNI, cambiar el estado del turno a "sala_de_espera" y emitir el evento SSE `turno-actualizado`.
    - Generación de un token de sesión temporal para el paciente.
    - Redirección a un portal de paciente (`/portal/[token]`) donde puede ver su estado.

  #### 1. Consolidar y Mejorar lo Existente
  - **Auditoría de Acciones Críticas**: Implementar un sistema de logs para registrar eventos importantes (ej: modificar consulta finalizada, eliminar registros, etc.).
  - **Flujo de Finalización de Consulta (En progreso)**: Implementar el flujo de feedback (toast) y botones dinámicos (Generar PDF, etc.) tras finalizar una consulta.
  - Revisar y finalizar la edición de pacientes.
  - Generación y Exportación de Documentos:
    - Generación de PDF para consultas, notas, recetas, etc.
    - Funcionalidad para compartir documentos (ej: Enviar por Mail, Enviar por WhatsApp).

  #### 2. Expandir el Flujo de la Consulta
  - Módulo de Recetas/Prescripciones (Receta Electrónica).
  - Módulo de Órdenes de Estudio.
  - Módulo de Derivaciones.

  #### 3. Gestión de Agenda y Turnos
  - Implementar una vista de calendario (agenda) para el médico.
  - Flujo completo para agendar, reprogramar y cancelar turnos desde varias partes de la app (post-consulta, perfil del paciente, etc.).
  - Manejar estados de turno (Confirmado, Cancelado, Ausente, etc.).

  #### 4. Administración y Facturación
  - Módulo de Cobros y Facturación por consulta.
  - Historial de pagos del paciente.

  #### 5. Mejoras de Usabilidad y Experiencia (UX)
  - Dashboard más interactivo con estadísticas y alertas.
  - Sistema de notificaciones dentro de la app.
  - **Notificaciones Push (Futuro)**: Implementar un sistema de Notificaciones Push web para enviar avisos importantes al profesional (ej: "Nuevo paciente en sala de espera") incluso si la app está en segundo plano.

- **Próximos Pasos**: Iniciar la implementación del módulo de auditoría, comenzando por el análisis del schema `auditLog.ts`.

---

## Ideas para el Futuro

- **Generación de PDF para Notas Médicas**:
  - **Enfoque recomendado**: Generación en el lado del servidor.
  - **Tecnología sugerida**: Usar **Puppeteer** para renderizar una plantilla HTML/CSS con la nota y datos asociados (paciente, profesional, etc.) y convertirla a un PDF de alta calidad.
  - **Implementación**: Crear un endpoint de API (ej: `/api/notas/[id]/pdf`) que genere y devuelva el archivo.

---

## Sesión 10: 2025-09-03

- **Objetivo**: Definir el flujo de trabajo para la finalización de consultas y la gestión de enmiendas.
- **Flujo Detallado: Finalización de Consulta y Gestión de Enmiendas**:

  #### 1. Confirmación al Finalizar la Consulta (Modal de Advertencia)
  - **Acción:** Al hacer clic en "Finalizar Consulta".
  - **Comportamiento:** Se muestra un modal de seguridad/advertencia.
  - **Contenido del Modal:**
    - Mensaje claro: "Al finalizar la consulta, el registro se sellará y no podrá ser modificado directamente. Cualquier cambio futuro deberá realizarse mediante una enmienda."
    - Botones: "Confirmar Finalización" y "Cancelar".

  #### 2. "Sellado" del Registro (UI y Base de Datos)
  - **Base de Datos:** Una vez confirmada, el `estado` de la `atencion` se actualiza a `finalizado`.
  - **Interfaz de Usuario (UI):**
    - El formulario de la consulta se vuelve **completamente de solo lectura**. Todos los campos de entrada se deshabilitan o se muestran como texto estático.
    - Los botones "Guardar Borrador" y "Finalizar Consulta" desaparecen o se deshabilitan.
    - Aparece un nuevo botón: **"Crear Enmienda"** (o "Añadir Adenda").

  #### 3. Modal de Enmienda (Adenda)
  - **Acción:** Al hacer clic en el botón "Crear Enmienda".
  - **Comportamiento:** Se abre un nuevo modal.
  - **Contenido del Modal de Enmienda:**
    - **Campo Obligatorio: "Motivo de la Enmienda":** Un campo de texto para que el profesional explique brevemente _por qué_ se hace la enmienda (ej. "Corrección de diagnóstico", "Aclaración de tratamiento").
    - **Campo Principal: "Detalles de la Enmienda":** Un área de texto (idealmente un editor de texto enriquecido) donde el profesional escribe la enmienda completa, explicando los cambios o adiciones (ej. "Se aclara que el cuadro corresponde a gastroenteritis y no a reflujo.").
    - Botones: "Guardar Enmienda" y "Cancelar".
  - **Registro Automático:** Al guardar la enmienda, se registra automáticamente:
    - El profesional que la hizo.
    - La fecha y hora exacta de la enmienda.
    - La enmienda en sí (el motivo y los detalles).

  #### 4. Almacenamiento de Enmiendas en la Base de Datos
  - **Nueva Tabla:** Se crea una nueva tabla (ej. `atencionAmendments`) para almacenar estas enmiendas.
  - **Campos Clave:** `id`, `atencionId` (Foreign Key a la atención original), `userId` (quién hizo la enmienda), `timestamp`, `reason` (motivo breve), `details` (texto completo de la enmienda).

  #### 5. Visualización de Enmiendas
  - **En la Consulta Finalizada:** Cuando se visualiza una consulta que ha sido finalizada, se muestra:
    - El contenido original de la consulta.
    - Debajo, una sección clara que lista **todas las enmiendas asociadas**, mostrando la fecha, el profesional y el texto de cada enmienda.

- **Próximos Pasos**: Implementar el flujo de finalización de consulta y gestión de enmiendas, comenzando por el modal de confirmación.

---

## Sesión 11: 2025-09-17

- **Objetivo**: Actualizar el estado del proyecto y definir los próximos pasos.
- **Actualización**: Se confirma que el flujo de finalización de consulta y gestión de enmiendas (modal de confirmación, sellado de consulta y sistema de adendas) ha sido implementado por el usuario.
- **Acción**: Se actualiza el `GEMINI.md` para reflejar este avance y se modifica el estado del roadmap.
- **Próximos Pasos**: Revisar el roadmap actualizado con el usuario para definir la siguiente tarea prioritaria.

---

## Sesión 12: 2025-10-03

- **Objetivo**: Implementar la vista de "Sala de Espera" y definir el flujo de trabajo de la recepcionista.
- **Decisión de Arquitectura**: A petición del usuario, se decidió no modificar la tarjeta minimalista `CardSalaEspera.tsx`. En su lugar, se creó un nuevo componente `CardSalaEsperaDetallada.tsx` para la nueva vista.
- **Implementación - "Sala de Espera"**:
  - **Hook `useElapsedTime.ts`**: Se creó un hook reutilizable para calcular y mostrar en tiempo real el tiempo transcurrido.
  - **Componente `CardSalaEsperaDetallada.tsx`**: Se creó una nueva tarjeta que incluye el temporizador de espera, botones de prioridad ("Subir", "Bajar") y botones de acción ("Llamar ahora", "Notificar").
  - **Componente `SalaDeEspera.tsx`**: Se creó la vista principal que consume los datos del store y renderiza la lista de pacientes en espera usando la nueva tarjeta detallada.
- **Bug Fix en Navegación**: Se solucionó un problema que impedía cambiar de pestañas. La causa era una inconsistencia en el `id` de la pestaña (`'salaEspera'` vs `'salaDeEspera'`). Se estandarizó a `'salaDeEspera'` en todos los archivos (`MenuPestaña.tsx`, `ContenedorRenderizdoPantalla.tsx`) y se añadió la función `setPestanaActiva` que faltaba en el store `recepcion.store.ts`.
- **Definición de Flujo**: Se clarificó el propósito de los botones de acción: "Llamar" se asocia a un turnero público y "Notificar" a un aviso privado (SMS/WhatsApp). Se eliminó el botón "Atender" de la vista de la recepcionista por no corresponder a su rol.
- **Próximos Pasos**: Se definió el flujo para una nueva funcionalidad de "Auto Check-in" para pacientes.

---

## Sesión 13: 2025-10-06

- **Objetivo**: Implementar una arquitectura multi-tenant para soportar múltiples centros médicos y definir el modelo de negocio SaaS.
- **Decisión de Arquitectura Clave**: Se migró de un sistema de ID único a un modelo de datos multi-tenant para permitir que la aplicación sea utilizada por múltiples consultorios o clínicas de forma independiente y segura.
- **Implementación del Schema**:
  - **`centrosMedicos.ts`**: Se creó una nueva tabla para definir cada entidad de negocio (clínica, consultorio).
  - **`usersCentrosMedicos.ts`**: Se creó una tabla pivote para vincular a los usuarios con los centros médicos, estableciendo un rol específico para cada usuario dentro de cada centro (`rolEnCentro`).
  - **`users.ts`**: Se añadió un `rol` global para cada usuario, definiendo su función principal en el sistema.
  - **`turnos.ts`**: Se añadió la columna `centroMedicoId` para vincular cada turno a un centro específico. Se mejoró la performance con índices y se corrigió la restricción `unique` para prevenir el doble bukeo de médicos a una misma hora (`unique().on(t.userMedicoId, t.fechaTurno)`).
- **Definición del Modelo de Negocio (SaaS)**:
  - Se discutieron los modelos de precios estándar (Por Usuario, Por Niveles, Por Uso).
  - Se recomendó un **Modelo por Niveles (Paquetes)** como el más flexible para empezar.
  - Se propuso la creación futura de una tabla `subscriptions` para gestionar el plan y el estado de pago de cada `centroMedico`.
- **Próximos Pasos / Flujo de Desarrollo**:
  1.  **(Prioridad 1) Flujo de Registro del Administrador**: Implementar la página de registro donde el primer usuario (el "dueño") crea su cuenta y los datos de su nuevo centro médico en un solo paso.
  2.  **(Prioridad 2) Flujo de Invitación de Usuarios**: Implementar la funcionalidad dentro de la app para que un administrador pueda invitar a nuevos miembros (médicos, recepcionistas) a su centro médico a través de un enlace seguro enviado por correo electrónico.
  3.  **(Futuro) Implementación de Suscripciones**: Conectar la lógica de negocio a la tabla `subscriptions` para restringir funcionalidades o límites según el plan contratado por cada centro.

---

## Sesión 14: 2025-10-10

- **Objetivo**: Integrar actualizaciones en tiempo real en la vista de Agenda y en la Sala de Espera del Dashboard.
- **Objetivo**: Expandir la sección de "Ajustes" del Dashboard, creando nuevas categorías, estructuras de datos (schemas de Drizzle ORM) y las rutas de navegación correspondientes.
- **Acciones Realizadas**:
  - **Integración de SSE en la Agenda:**
    - Se modificó `src/context/agenda.store.ts` para incluir la lógica de manejo de eventos SSE (`manejarEventoSSEAgenda`, `iniciarConexionSSEAgenda`, `detenerConexionSSEAgenda`).
    - Se modificó `src/services/sse.services.ts` para que los eventos SSE (`turno-actualizado`, `turno-agendado`, `turno-eliminado`) también se envíen a `agenda.store.ts`.
    - Se modificó `src/components/organismo/agenda/TurnosDelDia.tsx` para iniciar y detener la conexión SSE al montarse/desmontarse y para eliminar la actualización manual del store al cancelar un turno, confiando en los eventos SSE.
  - **Actualizaciones en tiempo real en la Sala de Espera del Dashboard:**
    - Se modificó `src/pages/dashboard/dashboard/componente/SalaEspera.jsx` para iniciar y detener la conexión SSE y realizar una carga inicial de los turnos del día al montarse/desmontarse, asegurando que la lista de pacientes recepcionados se actualice en tiempo real.
- **Problema Pendiente**: El usuario reporta que los eventos SSE de "turno-agendado" no se reflejan correctamente en la vista de Agenda (`TurnosDelDia.tsx`). Se sospecha un problema en la lógica de `manejarEventoSSEAgenda` al procesar este tipo de evento, específicamente en la comparación de horas y la actualización del `agendaDelDia` atom.
- **Próximos Pasos**: Investigar y corregir la lógica de `manejarEventoSSEAgenda` en `src/context/agenda.store.ts` para el evento `turno-agendado`.

---

## Sesión 15: 2025-10-13

- **Objetivo**: Implementar un sistema de Vademecum para la búsqueda y carga de medicamentos.
- **Backend (API)**:
  - Se optimizó la consulta en `GET /api/vademecum/search.ts` para delegar el filtrado a la base de datos.
  - Se corrigió un error crítico de compatibilidad reemplazando la función `ilike` (de PostgreSQL) por `like` (de SQLite), solucionando un error de sintaxis en la base de datos.
- **Poblado de Datos (Vademecum ANMAT)**:
  - Se decidió usar los datasets públicos de ANMAT como fuente de datos.
  - Se creó un script autónomo (`scripts/import-vademecum.js`) para leer múltiples archivos CSV, procesarlos, eliminar duplicados e insertarlos en la base de datos.
  - Se depuró el script para solucionar varios errores de entorno de Node.js (`ERR_MODULE_NOT_FOUND`, `import.meta.env`).
  - Se ejecutó el script con éxito, poblando la base de datos con **743 medicamentos únicos**.
- **Frontend (UI)**:
  - Se creó el componente `BuscadorVademecum.tsx` con lógica de búsqueda y "debounce".
  - Se integró el buscador en el formulario `FormularioMedicamentos.tsx` para autocompletar los datos al seleccionar un resultado.
  - Se rediseñó el layout de dicho formulario para mostrar los campos de texto de forma horizontal.
- **Próximos Pasos**: El usuario descargará más archivos CSV de ANMAT de años anteriores. El script de importación está listo para ser reutilizado y así enriquecer la base de datos.

---

## Sesión 16: 2025-10-23

- **Objetivo**: Implementar y depurar el flujo de creación de turnos espontáneos desde la recepción.
- **Implementación - Turnos Espontáneos**:
  - Se trabajó sobre el componente `FormularioTurnoRecepcion.tsx` para permitir la creación de turnos que se asignan directamente al estado "sala_de_espera".
- **Bug Fix - Manejo de Fechas (Timezone)**:
  - Se solucionó un bug crítico en el formulario que causaba que la fecha del turno se guardara como el día anterior. El problema se resolvió ajustando la manera en que se construye el objeto `Date` para evitar una conversión incorrecta de zona horaria.
  - Se corrigió el campo `horaLlegadaPaciente` para que almacene una marca de tiempo (`timestamp`) completa, asegurando la precisión del registro de llegada.
- **Refactorización Backend (API de Agenda)**:
  - Se refactorizó el endpoint `GET /api/agenda/index.ts` para mejorar la visualización de los turnos del día, incluyendo los espontáneos.
  - **Lógica Multi-Tenant**: Se consolidó la lógica para que la API filtre los turnos correctamente según el `centroMedicoId`, respetando la separación entre distintas entidades de salud.
  - **Corrección de Visualización**: Se solucionó un error que impedía mostrar correctamente los turnos espontáneos. La nueva implementación previene la duplicación de turnos y asegura que la lista final de la agenda se devuelva siempre ordenada cronológicamente.
  - **Definición de Categorías**: Se propusieron y aceptaron nuevas categorías de ajustes para la aplicación clínica: "Historia Clínica", "Agenda y Turnos", "Plantillas de Documentos", "Facturación y Aranceles" y "Seguridad".
  - **Actualización de `index.astro`**: Se modificó `src/pages/dashboard/ajustes/index.astro` para incluir todas las nuevas categorías en el array `settingsCategories` con sus respectivos iconos de `lucide-react`.
  - **Creación de Schemas**: Se crearon los siguientes archivos de esquema (Drizzle ORM) para las nuevas categorías de ajustes, con un enfoque en el diseño multi-tenant (`centroMedicoId`):
    - `src/db/schema/ajustesAgenda.ts`
    - `src/db/schema/ajustesHistoriaClinica.ts`
    - `src/db/schema/plantillas.ts`
    - `src/db/schema/ajustesFacturacion.ts`
    - `src/db/schema/ajustesSeguridad.ts`
  - **Creación de Rutas y Archivos Astro**: Se creó la estructura de directorios (`src/pages/dashboard/ajustes/[categoria]/`) y los archivos Astro (`index.astro`, así como sub-rutas específicas como `horarios.astro`, `campos.astro`, `recetas.astro`, etc.) para cada una de las nuevas categorías y sub-secciones.
- **Problema Identificado (Iconos de Lucide-React)**: Se detectó un error `Warning: React.jsx: type is invalid -- expected a string... but got: object.` al intentar renderizar los iconos de `lucide-react` en `index.astro` (después de que el usuario inlinó la lógica de `CardAjustes.tsx`). Esto ocurre porque los componentes de React (`lucide-react` icons) no se deserializan correctamente al pasarlos directamente en un Astro componente sin un `client:` directiva o un wrapper adecuado.

---

## Sesión 17: martes, 28 de octubre de 2025

- **Objetivo**: Expandir la sección de "Ajustes" del Dashboard, creando nuevas categorías, estructuras de datos (schemas de Drizzle ORM) y las rutas de navegación correspondientes.
- **Acciones Realizadas**:
  - **Definición de Categorías**: Se propusieron y aceptaron nuevas categorías de ajustes para la aplicación clínica: "Historia Clínica", "Agenda y Turnos", "Plantillas de Documentos", "Facturación y Aranceles" y "Seguridad".
  - **Actualización de `index.astro`**: Se modificó `src/pages/dashboard/ajustes/index.astro` para incluir todas las nuevas categorías en el array `settingsCategories` con sus respectivos iconos de `lucide-react`.
  - **Creación de Schemas**: Se crearon los siguientes archivos de esquema (Drizzle ORM) para las nuevas categorías de ajustes, con un enfoque en el diseño multi-tenant (`centroMedicoId`):
    - `src/db/schema/ajustesAgenda.ts`
    - `src/db/schema/ajustesHistoriaClinica.ts`
    - `src/db/schema/plantillas.ts`
    - `src/db/schema/ajustesFacturacion.ts`
    - `src/db/schema/ajustesSeguridad.ts`
  - **Creación de Rutas y Archivos Astro**: Se creó la estructura de directorios (`src/pages/dashboard/ajustes/[categoria]/`) y los archivos Astro (`index.astro`, así como sub-rutas específicas como `horarios.astro`, `campos.astro`, `recetas.astro`, etc.) para cada una de las nuevas categorías y sub-secciones.
- **Problema Identificado (Iconos de Lucide-React)**: Se detectó un error `Warning: React.jsx: type is invalid -- expected a string... but got: object.` al intentar renderizar los iconos de `lucide-react` en `index.astro` (después de que el usuario inlinó la lógica de `CardAjustes.tsx`). Esto ocurre porque los componentes de React (`lucide-react` icons) no se deserializan correctamente al pasarlos directamente en un Astro componente sin un `client:` directiva o un wrapper adecuado.

---

## Sesión 18: miércoles, 29 de octubre de 2025

- **Objetivo**: Implementar y unificar el flujo de creación y gestión de turnos desde el Dashboard y Recepción, con actualizaciones en tiempo real (SSE).
- **Implementación - Flujo de Turnos Unificado**:
  - Se consolidó la lógica para dar turnos desde dos vistas clave: el Dashboard principal (para el médico) y la vista de Recepción.
  - Los nuevos turnos, especialmente los creados como "espontáneos" desde recepción, se asignan directamente al estado `sala_de_espera`.
- **Implementación - Sincronización en Tiempo Real (SSE)**:
  - Se implementó un ciclo de vida completo para el estado del turno, visible en tiempo real en todas las pantallas.
  - Al crear un turno, la vista del Dashboard del médico se actualiza automáticamente, mostrando al nuevo paciente en espera.
  - Cuando el médico inicia la atención desde su dashboard, el estado del turno (`en_consulta`) se refleja instantáneamente en la vista de Recepción.
  - Al finalizar la consulta, el estado se vuelve a actualizar para todos los clientes conectados, completando el flujo.
- **Depuración y Refinamiento**:
  - Se solucionó un bug crítico en el formulario de "Turno Rápido" (`FormularioTurnoRecepcion.tsx`) que no asignaba un `medicoId` por defecto, lo que impedía la creación de turnos.
  - Se analizó y debatió la causa de por qué los nuevos turnos no se reflejaban en la UI, identificando y corrigiendo inconsistencias de datos y fechas entre la API y el estado del frontend.

---

## Sesión 19: miércoles, 29 de octubre de 2025 (Continuación)

- **Objetivo**: Implementar un sistema de configuración de horarios dinámico y robusto para los profesionales.
- **Decisión de Arquitectura (Schema)**:
  - Se debatió y acordó un diseño de base de datos para los horarios, optando por un enfoque relacional para garantizar la integridad y el rendimiento.
  - Se modificó la tabla `horariosTrabajo` para soportar días inactivos, horarios corridos y horarios partidos (mañana/tarde) en una sola fila por día de la semana.
  - Se resolvió un error de `UNIQUE constraint` al hacer `push` a Turso, añadiendo la restricción de unicidad necesaria para la combinación de `userMedicoId` y `diaSemana`.
- **Implementación de UI (`PerfilHorarios.tsx`)**:
  - Se construyó una interfaz de usuario para que los profesionales puedan configurar sus horarios semanales.
  - Se implementó la lógica para cargar los horarios existentes desde la base de datos al montar el componente.
  - Se desarrolló una capa de "traducción" para convertir el formato de la UI (rangos de atención y descanso) al formato requerido por la base de datos al guardar.
  - Se depuró y corrigió un bug visual en el componente `Switch` (problema de componente controlado vs. no controlado).
- **Implementación de API**:
  - Se creó un endpoint `POST /api/ajustes/horarios` para guardar la configuración de horarios de un profesional usando una estrategia de "upsert".
  - Se creó un endpoint `GET /api/ajustes/horarios` para leer la configuración existente de un usuario.
- **Integración con Agenda**:
  - Se refactorizó la API principal de la agenda (`GET /api/agenda`) para que sea 100% dinámica.
  - Se eliminó la `JORNADA_LABORAL` hardcodeada y ahora la API consulta la tabla `horariosTrabajo` para generar los slots de turnos disponibles basándose en la configuración guardada para cada profesional.
--- End of Context from: GEMINI.md ---

## Sesión 20: viernes, 31 de octubre de 2025

*   **Objetivo**: Implementar una lógica de creación de usuarios multi-tenant robusta y configurar la redirección de roles para el personal de recepción.
*   **Decisión de Arquitectura Clave**: Tras un profundo debate sobre varios modelos de datos, se estableció una arquitectura final para la gestión de usuarios y su relación con los centros médicos:
    *   **Tabla `users`**: Se acordó que esta tabla debe tener un `UNIQUE` constraint en la columna `dni` para anclar la identidad de una persona a través de toda la plataforma. El campo `email` se mantiene, pero no se utilizará como identificador único principal en la lógica de negocio multi-tenant.
    *   **Tabla `usersCentrosMedicos`**: Se confirmó que esta tabla es la clave para la multi-tenencia. Contiene el `userId`, `centroMedicoId`, el `rolEnCentro`, y un campo `emailUser` para el email específico de login en ese centro. Se aseguró que tuviera un `UNIQUE` constraint en la combinación de `userId` y `centroMedicoId`.
*   **Implementación - API de Creación de Usuarios (`POST /api/ajustes/usuarios`)**:
    *   Se refactorizó completamente el endpoint para manejar la nueva lógica.
    *   El sistema ahora primero busca un usuario por `dni`.
    *   Si el usuario existe, comprueba si ya está asociado al centro actual. Si no lo está, crea la nueva relación; si ya existe, devuelve un error de conflicto.
    *   Si el usuario no existe, comprueba que el `email` no esté en uso por otra persona antes de crear el nuevo usuario y su relación con el centro.
*   **Implementación - Feedback en Frontend (`FormNuevoUsuario.tsx`)**:
    *   Se mejoró el formulario de creación de usuarios para manejar los estados de `loading`, `error` y `success`.
    *   Se añadieron mensajes de feedback claros para el usuario, informando sobre el resultado de la operación.
    *   Se implementó la recarga de la página tras una creación exitosa para mantener la lista de usuarios actualizada.
*   **Implementación - Redirección por Rol (`middleware.ts`)**:
    *   Se implementó una lógica en el middleware de Astro para redirigir automáticamente a los usuarios con el rol `recepcion`.
    *   Se discutió la optimización de rendimiento, decidiendo finalmente leer el `rolEnCentro` desde la cookie `userData` (previamente guardada en el login) en lugar de hacer una consulta a la base de datos en cada petición, evitando así sobrecargar el sistema.

---

## Sesión 21: viernes, 5 de noviembre de 2025

*   **Objetivo**: Refactorizar el flujo de creación de turnos para que sea reutilizable tanto por el perfil "Profesional" como por el "Recepcionista", desacoplando la lógica del estado de la UI.
*   **Decisión de Arquitectura Clave**: Se migró de un formulario monolítico a un patrón de "Componente Tonto / Contenedor Inteligente".
    *   **Componente Tonto**: `FormularioTurno.tsx` se refactorizó para ser puramente presentacional, sin conexiones directas a ningún store, recibiendo todos los datos y funciones a través de `props`.
    *   **Contenedores Inteligentes**: Se crearon dos contenedores para orquestar el formulario:
        1.  `ContenedorFormularioTurno.tsx`: Conecta el formulario con el `agenda.store.ts` para el uso del profesional.
        2.  `ContenedorFormularioTurnoRecepcionista.tsx`: Conecta el mismo formulario con el `recepcion.recepcionista.store.ts` para el uso de la recepcionista.
*   **Mejora de UX (Recepcionista)**: Se implementó el componente `ContenedorHorariosRecepsionista.tsx`, que muestra tarjetas de horarios disponibles para cada médico, permitiendo a la recepcionista seleccionar al profesional de forma implícita al elegir un horario.
*   **Depuración y Solución**: Se resolvió un bug donde el formulario de la recepcionista no captaba los datos del paciente y del profesional. El usuario identificó correctamente que el problema no estaba en el formulario en sí, sino en los contenedores, que no estaban pasando el `medicoId` correctamente a las acciones del store (`setFechaYHora...`) al momento de la selección del horario.
*   **Próximos Pasos**: Continuar con el desarrollo de las funcionalidades específicas de la sección de Recepción.
--- End of Context from: GEMINI.md ---

## Sesión 22: 2025-11-10

- **Objetivo**: Refactorizar la API de agenda para soportar múltiples profesionales y optimizar la estructura de la respuesta para el consumo del frontend.
- **Problema Identificado**: El endpoint original (`GET /api/agenda/index.ts`) devolvía incorrectamente una lista plana de todos los slots de tiempo, incluso cuando se solicitaban múltiples IDs de profesionales, lo que resultaba en una agenda mezclada e inutilizable. También presentaba un bug donde `horarioProfesional` no estaba definido debido a un alcance incorrecto de la variable.
- **Decisión Arquitectónica**:
  - La API fue refactorizada para devolver una agenda agrupada.
  - Inicialmente, se propuso una estructura de objeto (`{ profId: agenda[] }`), pero tras la discusión, se decidió cambiar el formato de respuesta final a un **array de objetos** (`[{ profesionalId: string, agenda: agenda[] }]`) para facilitar la iteración y el mapeo en componentes de frontend (ej. `ContenedorHorariosRecepcionista.tsx`).
- **Implementación**:
  - La lógica de la API fue refactorizada para iterar sobre cada `profesionalId` solicitado.
  - Para cada profesional, sus horas de trabajo específicas (`JORNADA_LABORAL`) ahora se calculan dinámicamente basándose en sus `horariosTrabajo`.
  - Los turnos (`turnosDelDia`) se filtran por profesional.
  - La respuesta final es un array de objetos, cada uno conteniendo un `profesionalId` y su `agenda` correspondiente.
  - Se añadieron `console.log` para depuración durante el proceso.
- **Corrección de Errores**:
  - Se resolvió el error `horarioProfesional is not defined` al definir correctamente el alcance de la variable y mover su cálculo dentro del bucle de iteración de profesionales.
  - Se aseguró que `JORNADA_LABORAL` se calcule individualmente para cada profesional.
- **Estado Actual**: El endpoint de la API ahora devuelve correctamente las agendas agrupadas en formato de array, listo para el consumo del frontend. El usuario ha confirmado que ha manejado los cambios en el frontend.