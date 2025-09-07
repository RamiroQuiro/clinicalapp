ALTER TABLE `notasMedicas` RENAME COLUMN "userId" TO "userMedicoId";--> statement-breakpoint
CREATE TABLE `atencionAmendments` (
	`id` text PRIMARY KEY NOT NULL,
	`atencionId` text NOT NULL,
	`userId` text NOT NULL,
	`reason` text NOT NULL,
	`details` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`atencionId`) REFERENCES `atenciones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `notasMedicas` ADD `title` text NOT NULL;--> statement-breakpoint
ALTER TABLE `notasMedicas` ADD `atencionId` text REFERENCES atenciones(id);--> statement-breakpoint
ALTER TABLE `notasMedicas` ALTER COLUMN "pacienteId" TO "pacienteId" text NOT NULL REFERENCES pacientes(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notasMedicas` ALTER COLUMN "userMedicoId" TO "userMedicoId" text NOT NULL REFERENCES users(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP INDEX "archivosAdjuntos_id_unique";--> statement-breakpoint
DROP INDEX "atencionAntecedentes_id_unique";--> statement-breakpoint
DROP INDEX "atencionDiagnosticos_id_unique";--> statement-breakpoint
DROP INDEX "atencionTratamientos_id_unique";--> statement-breakpoint
DROP INDEX "userId_idx";--> statement-breakpoint
DROP INDEX "timestamp_idx";--> statement-breakpoint
DROP INDEX "actionType_idx";--> statement-breakpoint
DROP INDEX "tableName_idx";--> statement-breakpoint
DROP INDEX "derivaciones_id_unique";--> statement-breakpoint
DROP INDEX "diagnostico_id_unique";--> statement-breakpoint
DROP INDEX "notasMedicas_id_unique";--> statement-breakpoint
DROP INDEX "pacienteProfesional_pacienteId_userId_unique";--> statement-breakpoint
DROP INDEX "pacientes_dni_unique";--> statement-breakpoint
DROP INDEX "recetaMedica_id_unique";--> statement-breakpoint
DROP INDEX "signosVitales_atencionId_pacienteId_unique";--> statement-breakpoint
DROP INDEX "turnos_id_unique";--> statement-breakpoint
DROP INDEX "users_id_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `archivosAdjuntos` ALTER COLUMN "estado" TO "estado" text DEFAULT 'pendiente';--> statement-breakpoint
CREATE UNIQUE INDEX `archivosAdjuntos_id_unique` ON `archivosAdjuntos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `atencionAntecedentes_id_unique` ON `atencionAntecedentes` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `atencionDiagnosticos_id_unique` ON `atencionDiagnosticos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `atencionTratamientos_id_unique` ON `atencionTratamientos` (`id`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `auditLog` (`userId`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `auditLog` (`timestamp`);--> statement-breakpoint
CREATE INDEX `actionType_idx` ON `auditLog` (`actionType`);--> statement-breakpoint
CREATE INDEX `tableName_idx` ON `auditLog` (`tableName`);--> statement-breakpoint
CREATE UNIQUE INDEX `derivaciones_id_unique` ON `derivaciones` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `diagnostico_id_unique` ON `diagnostico` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `notasMedicas_id_unique` ON `notasMedicas` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `pacienteProfesional_pacienteId_userId_unique` ON `pacienteProfesional` (`pacienteId`,`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `pacientes_dni_unique` ON `pacientes` (`dni`);--> statement-breakpoint
CREATE UNIQUE INDEX `recetaMedica_id_unique` ON `recetaMedica` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `signosVitales_atencionId_pacienteId_unique` ON `signosVitales` (`atencionId`,`pacienteId`);--> statement-breakpoint
CREATE UNIQUE INDEX `turnos_id_unique` ON `turnos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `archivosAdjuntos` ADD `atencionId` text REFERENCES atenciones(id);--> statement-breakpoint
ALTER TABLE `archivosAdjuntos` ADD `userMedicoId` text REFERENCES users(id);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_auditLog` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text,
	`actionType` text NOT NULL,
	`tableName` text NOT NULL,
	`recordId` text,
	`oldValue` text,
	`newValue` text,
	`timestamp` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`description` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_auditLog`("id", "userId", "actionType", "tableName", "recordId", "oldValue", "newValue", "timestamp", "ipAddress", "userAgent", "description") SELECT "id", "userId", "actionType", "tableName", "recordId", "oldValue", "newValue", "timestamp", "ipAddress", "userAgent", "description" FROM `auditLog`;--> statement-breakpoint
DROP TABLE `auditLog`;--> statement-breakpoint
ALTER TABLE `__new_auditLog` RENAME TO `auditLog`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `turnos` ALTER COLUMN "motivoConsulta" TO "motivoConsulta" text;--> statement-breakpoint
ALTER TABLE `turnos` ADD `otorgaUserId` text NOT NULL REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `turnos` ADD `userMedicoId` text NOT NULL REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `turnos` ADD `fechaTurno` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `turnos` ADD `atencionId` text REFERENCES atenciones(id);--> statement-breakpoint
ALTER TABLE `turnos` ADD `tipoConsulta` text;--> statement-breakpoint
ALTER TABLE `turnos` ADD `fechaAtencion` integer;--> statement-breakpoint
ALTER TABLE `turnos` ADD `horaAtencion` text NOT NULL;--> statement-breakpoint
ALTER TABLE `turnos` ADD `motivoInicial` text;--> statement-breakpoint
ALTER TABLE `turnos` ADD `estado` text DEFAULT 'pendiente';--> statement-breakpoint
ALTER TABLE `turnos` ADD `created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL;--> statement-breakpoint
ALTER TABLE `turnos` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `turnos` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `turnos` ALTER COLUMN "pacienteId" TO "pacienteId" text NOT NULL REFERENCES pacientes(id) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `turnos` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `turnos` DROP COLUMN `fecha`;--> statement-breakpoint
ALTER TABLE `turnos` DROP COLUMN `hora`;--> statement-breakpoint
ALTER TABLE `turnos` DROP COLUMN `activo`;--> statement-breakpoint
ALTER TABLE `atenciones` ADD `tratamiento` text;--> statement-breakpoint
ALTER TABLE `atenciones` ADD `planSeguir` text;--> statement-breakpoint
ALTER TABLE `atenciones` ADD `inicioConsulta` integer;--> statement-breakpoint
ALTER TABLE `atenciones` ADD `finConsulta` integer;--> statement-breakpoint
ALTER TABLE `atenciones` ADD `duracionConsulta` integer;--> statement-breakpoint
ALTER TABLE `atenciones` DROP COLUMN `inicioAtencion`;--> statement-breakpoint
ALTER TABLE `atenciones` DROP COLUMN `finAtencion`;--> statement-breakpoint
ALTER TABLE `atenciones` DROP COLUMN `duracionAtencion`;--> statement-breakpoint
ALTER TABLE `diagnostico` ADD `estado` text DEFAULT 'activo' NOT NULL;--> statement-breakpoint
ALTER TABLE `diagnostico` ADD `ultimaModificacionPorId` text REFERENCES users(id);