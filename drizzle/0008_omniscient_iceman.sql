ALTER TABLE `diagnostico` RENAME COLUMN "userId" TO "userMedicoId";--> statement-breakpoint
CREATE TABLE `auditLog` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`actionType` text NOT NULL,
	`tableName` text NOT NULL,
	`recordId` text,
	`oldValue` text,
	`newValue` text,
	`timestamp` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `pacienteProfesional` (
	`id` text PRIMARY KEY NOT NULL,
	`pacienteId` text NOT NULL,
	`userId` text NOT NULL,
	`estado` text DEFAULT 'activo',
	`create_at` integer DEFAULT (strftime('%s','now')),
	`update_at` integer DEFAULT (strftime('%s','now')),
	`delete_at` integer,
	FOREIGN KEY (`pacienteId`) REFERENCES `pacientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pacienteProfesional_pacienteId_userId_unique` ON `pacienteProfesional` (`pacienteId`,`userId`);--> statement-breakpoint
DROP INDEX "archivosAdjuntos_id_unique";--> statement-breakpoint
DROP INDEX "atencionAntecedentes_id_unique";--> statement-breakpoint
DROP INDEX "atencionDiagnosticos_id_unique";--> statement-breakpoint
DROP INDEX "atencionTratamientos_id_unique";--> statement-breakpoint
DROP INDEX "derivaciones_id_unique";--> statement-breakpoint
DROP INDEX "diagnostico_id_unique";--> statement-breakpoint
DROP INDEX "motivosIniciales_id_unique";--> statement-breakpoint
DROP INDEX "notasMedicas_id_unique";--> statement-breakpoint
DROP INDEX "pacienteProfesional_pacienteId_userId_unique";--> statement-breakpoint
DROP INDEX "pacientes_dni_unique";--> statement-breakpoint
DROP INDEX "recetaMedica_id_unique";--> statement-breakpoint
DROP INDEX "signosVitales_atencionId_pacienteId_unique";--> statement-breakpoint
DROP INDEX "turnos_id_unique";--> statement-breakpoint
DROP INDEX "users_id_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `diagnostico` ALTER COLUMN "codigoCIE" TO "codigoCIE" text;--> statement-breakpoint
CREATE UNIQUE INDEX `archivosAdjuntos_id_unique` ON `archivosAdjuntos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `atencionAntecedentes_id_unique` ON `atencionAntecedentes` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `atencionDiagnosticos_id_unique` ON `atencionDiagnosticos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `atencionTratamientos_id_unique` ON `atencionTratamientos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `derivaciones_id_unique` ON `derivaciones` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `diagnostico_id_unique` ON `diagnostico` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `motivosIniciales_id_unique` ON `motivosIniciales` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `notasMedicas_id_unique` ON `notasMedicas` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `pacientes_dni_unique` ON `pacientes` (`dni`);--> statement-breakpoint
CREATE UNIQUE INDEX `recetaMedica_id_unique` ON `recetaMedica` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `signosVitales_atencionId_pacienteId_unique` ON `signosVitales` (`atencionId`,`pacienteId`);--> statement-breakpoint
CREATE UNIQUE INDEX `turnos_id_unique` ON `turnos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `diagnostico` ALTER COLUMN "updated_at" TO "updated_at" integer;--> statement-breakpoint
ALTER TABLE `diagnostico` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `diagnostico` ALTER COLUMN "deleted_at" TO "deleted_at" integer;--> statement-breakpoint
ALTER TABLE `diagnostico` ALTER COLUMN "atencionId" TO "atencionId" text NOT NULL REFERENCES atenciones(id) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `diagnostico` ALTER COLUMN "pacienteId" TO "pacienteId" text NOT NULL REFERENCES pacientes(id) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `diagnostico` ALTER COLUMN "userMedicoId" TO "userMedicoId" text NOT NULL REFERENCES users(id) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_medicamentos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombreGenerico` text NOT NULL,
	`nombreComercial` text,
	`laboratorio` text,
	`descripcion` text,
	`tipoMedicamento` text,
	`historiaClinicaId` text,
	`atencionId` text,
	`pacienteId` text,
	`userMedicoId` text NOT NULL,
	`dosis` text,
	`frecuencia` text,
	`duracion` text,
	`precio` text,
	`stock` text,
	`updated_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`historiaClinicaId`) REFERENCES `historiaClinica`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`atencionId`) REFERENCES `atenciones`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pacienteId`) REFERENCES `pacientes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userMedicoId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_medicamentos`("id", "nombreGenerico", "nombreComercial", "laboratorio", "descripcion", "tipoMedicamento", "historiaClinicaId", "atencionId", "pacienteId", "userMedicoId", "dosis", "frecuencia", "duracion", "precio", "stock", "updated_at", "created_at", "deleted_at") SELECT "id", "nombreGenerico", "nombreComercial", "laboratorio", "descripcion", "tipoMedicamento", "historiaClinicaId", "atencionId", "pacienteId", "userMedicoId", "dosis", "frecuencia", "duracion", "precio", "stock", "updated_at", "created_at", "deleted_at" FROM `medicamentos`;--> statement-breakpoint
DROP TABLE `medicamentos`;--> statement-breakpoint
ALTER TABLE `__new_medicamentos` RENAME TO `medicamentos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_recetaMedica` (
	`id` text PRIMARY KEY NOT NULL,
	`atencionId` integer NOT NULL,
	`pacienteId` integer NOT NULL,
	`userMecidoId` integer NOT NULL,
	`medicamentos` text NOT NULL,
	`nombreComercial` text,
	`nombreGenerico` text,
	`fecha` integer NOT NULL,
	`observaciones` text,
	`horarios` text,
	`indicaciones` text,
	`dosis` text,
	`cantidad` text,
	`activo` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`atencionId`) REFERENCES `atenciones`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pacienteId`) REFERENCES `pacientes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userMecidoId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_recetaMedica`("id", "atencionId", "pacienteId", "userMecidoId", "medicamentos", "nombreComercial", "nombreGenerico", "fecha", "observaciones", "horarios", "indicaciones", "dosis", "cantidad", "activo", "created_at", "updated_at", "deleted_at") SELECT "id", "atencionId", "pacienteId", "userMecidoId", "medicamentos", "nombreComercial", "nombreGenerico", "fecha", "observaciones", "horarios", "indicaciones", "dosis", "cantidad", "activo", "created_at", "updated_at", "deleted_at" FROM `recetaMedica`;--> statement-breakpoint
DROP TABLE `recetaMedica`;--> statement-breakpoint
ALTER TABLE `__new_recetaMedica` RENAME TO `recetaMedica`;--> statement-breakpoint
CREATE TABLE `__new_atenciones` (
	`id` text PRIMARY KEY NOT NULL,
	`historiaClinicaId` text,
	`pacienteId` text NOT NULL,
	`userIdMedico` text NOT NULL,
	`fecha` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`motivoConsulta` text,
	`sintomas` text,
	`tratamientoId` text,
	`motivoInicial` text,
	`observaciones` text,
	`estado` text DEFAULT 'pendiente',
	`inicioAtencion` integer,
	`finAtencion` integer,
	`duracionAtencion` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`historiaClinicaId`) REFERENCES `historiaClinica`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pacienteId`) REFERENCES `pacientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userIdMedico`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_atenciones`("id", "historiaClinicaId", "pacienteId", "userIdMedico", "fecha", "motivoConsulta", "sintomas", "tratamientoId", "motivoInicial", "observaciones", "estado", "inicioAtencion", "finAtencion", "duracionAtencion", "created_at", "updated_at", "deleted_at") SELECT "id", "historiaClinicaId", "pacienteId", "userIdMedico", "fecha", "motivoConsulta", "sintomas", "tratamientoId", "motivoInicial", "observaciones", "estado", "inicioAtencion", "finAtencion", "duracionAtencion", "created_at", "updated_at", "deleted_at" FROM `atenciones`;--> statement-breakpoint
DROP TABLE `atenciones`;--> statement-breakpoint
ALTER TABLE `__new_atenciones` RENAME TO `atenciones`;--> statement-breakpoint
DROP INDEX `historiaClinica_id_unique`;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `obraSocial` text;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `nObraSocial` text;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `historialMedico` text;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `observaciones` text;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `activo` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `email` text;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `celular` text;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `direccion` text;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `ciudad` text;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `provincia` text;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `pais` text;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `estatura` text;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `grupoSanguineo` text;--> statement-breakpoint
DROP INDEX `signosVitales_id_unique`;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "updated_at" TO "updated_at" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "deleted_at" TO "deleted_at" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "temperatura" TO "temperatura" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "pulso" TO "pulso" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "respiracion" TO "respiracion" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "tensionArterial" TO "tensionArterial" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "saturacionOxigeno" TO "saturacionOxigeno" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "glucosa" TO "glucosa" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "peso" TO "peso" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "talla" TO "talla" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "imc" TO "imc" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "frecuenciaCardiaca" TO "frecuenciaCardiaca" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "frecuenciaRespiratoria" TO "frecuenciaRespiratoria" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "dolor" TO "dolor" integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ADD `presionArterial` integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ADD `fechaRegistro` integer;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "atencionId" TO "atencionId" text NOT NULL REFERENCES atenciones(id) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "pacienteId" TO "pacienteId" text NOT NULL REFERENCES pacientes(id) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "userId" TO "userId" text NOT NULL REFERENCES users(id) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE TABLE `__new_tratamiento` (
	`id` text PRIMARY KEY NOT NULL,
	`tratamiento` text NOT NULL,
	`descripcion` text,
	`atencionesId` text,
	`historiaClinicaId` text,
	`pacienteId` text,
	`fechaInicio` integer,
	`fechaFin` integer,
	`estado` text DEFAULT 'en_proceso',
	`userMedicoId` text NOT NULL,
	`duracion` text,
	`updated_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`atencionesId`) REFERENCES `atenciones`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`historiaClinicaId`) REFERENCES `historiaClinica`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pacienteId`) REFERENCES `pacientes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userMedicoId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tratamiento`("id", "tratamiento", "descripcion", "atencionesId", "historiaClinicaId", "pacienteId", "fechaInicio", "fechaFin", "estado", "userMedicoId", "duracion", "updated_at", "created_at", "deleted_at") SELECT "id", "tratamiento", "descripcion", "atencionesId", "historiaClinicaId", "pacienteId", "fechaInicio", "fechaFin", "estado", "userMedicoId", "duracion", "updated_at", "created_at", "deleted_at" FROM `tratamiento`;--> statement-breakpoint
DROP TABLE `tratamiento`;--> statement-breakpoint
ALTER TABLE `__new_tratamiento` RENAME TO `tratamiento`;--> statement-breakpoint
ALTER TABLE `archivosAdjuntos` ALTER COLUMN "updated_at" TO "updated_at" integer;--> statement-breakpoint
ALTER TABLE `archivosAdjuntos` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `archivosAdjuntos` ALTER COLUMN "deleted_at" TO "deleted_at" integer;--> statement-breakpoint
ALTER TABLE `antecedentes` ALTER COLUMN "fechaDiagnostico" TO "fechaDiagnostico" integer;--> statement-breakpoint
ALTER TABLE `antecedentes` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `antecedentes` ADD `userId` text NOT NULL REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `antecedentes` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `antecedentes` ALTER COLUMN "pacienteId" TO "pacienteId" text NOT NULL REFERENCES pacientes(id) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `fichaPaciente` ALTER COLUMN "updated_at" TO "updated_at" integer;--> statement-breakpoint
ALTER TABLE `fichaPaciente` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `fichaPaciente` ALTER COLUMN "deleted_at" TO "deleted_at" integer;--> statement-breakpoint
ALTER TABLE `listaDeEspera` ALTER COLUMN "fecha" TO "fecha" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `motivosIniciales` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `motivosIniciales` ADD `creado_por_id` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `motivosIniciales` ADD `userMedicoId` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `motivosIniciales` DROP COLUMN `atencionId`;--> statement-breakpoint
ALTER TABLE `notasMedicas` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `notasMedicas` ALTER COLUMN "updated_at" TO "updated_at" integer;--> statement-breakpoint
ALTER TABLE `notasMedicas` ALTER COLUMN "deleted_at" TO "deleted_at" integer;--> statement-breakpoint
ALTER TABLE `pacientes` ALTER COLUMN "fNacimiento" TO "fNacimiento" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `pacientes` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `pacientes` ADD `email` text;--> statement-breakpoint
ALTER TABLE `pacientes` ADD `edad` text;--> statement-breakpoint
ALTER TABLE `pacientes` ADD `celular` text;--> statement-breakpoint
ALTER TABLE `pacientes` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `pacientes` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `pacientes` ADD `activo` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `pagos` ALTER COLUMN "fechaPago" TO "fechaPago" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `pagos` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `turnos` ALTER COLUMN "fecha" TO "fecha" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `users` ADD `rol` text;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerificado` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `activo` integer DEFAULT true;