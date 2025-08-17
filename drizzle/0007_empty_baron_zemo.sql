ALTER TABLE `antecedente` RENAME TO `antecedentes`;--> statement-breakpoint
ALTER TABLE `atenciones` RENAME COLUMN "userId" TO "userIdMedico";--> statement-breakpoint
ALTER TABLE `historiaClinica` RENAME COLUMN "fecha" TO "fechaApertura";--> statement-breakpoint
CREATE TABLE `atencionAntecedentes` (
	`id` text PRIMARY KEY NOT NULL,
	`atencionId` text NOT NULL,
	`antecedenteId` text NOT NULL,
	FOREIGN KEY (`atencionId`) REFERENCES `atenciones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`antecedenteId`) REFERENCES `antecedentes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `atencionAntecedentes_id_unique` ON `atencionAntecedentes` (`id`);--> statement-breakpoint
CREATE TABLE `atencionDiagnosticos` (
	`id` text PRIMARY KEY NOT NULL,
	`atencionId` text NOT NULL,
	`diagnosticoId` text NOT NULL,
	FOREIGN KEY (`atencionId`) REFERENCES `atenciones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`diagnosticoId`) REFERENCES `diagnostico`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `atencionDiagnosticos_id_unique` ON `atencionDiagnosticos` (`id`);--> statement-breakpoint
CREATE TABLE `atencionTratamientos` (
	`id` text PRIMARY KEY NOT NULL,
	`atencionId` text NOT NULL,
	`tratamientoId` text NOT NULL,
	FOREIGN KEY (`atencionId`) REFERENCES `atenciones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tratamientoId`) REFERENCES `tratamiento`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `atencionTratamientos_id_unique` ON `atencionTratamientos` (`id`);--> statement-breakpoint
CREATE TABLE `derivaciones` (
	`id` text PRIMARY KEY NOT NULL,
	`atencionId` text NOT NULL,
	`userIdOrigen` text NOT NULL,
	`userIdDestino` text,
	`nombreProfesionalExterno` text,
	`especialidadDestino` text,
	`motivoDerivacion` text,
	`estado` text DEFAULT 'pendiente',
	`fecha` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`atencionId`) REFERENCES `atenciones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userIdOrigen`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userIdDestino`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `derivaciones_id_unique` ON `derivaciones` (`id`);--> statement-breakpoint
DROP INDEX "archivosAdjuntos_id_unique";--> statement-breakpoint
DROP INDEX "atencionAntecedentes_id_unique";--> statement-breakpoint
DROP INDEX "atencionDiagnosticos_id_unique";--> statement-breakpoint
DROP INDEX "atenciones_id_unique";--> statement-breakpoint
DROP INDEX "atencionTratamientos_id_unique";--> statement-breakpoint
DROP INDEX "derivaciones_id_unique";--> statement-breakpoint
DROP INDEX "diagnostico_id_unique";--> statement-breakpoint
DROP INDEX "historiaClinica_id_unique";--> statement-breakpoint
DROP INDEX "medicamentos_id_unique";--> statement-breakpoint
DROP INDEX "motivosIniciales_id_unique";--> statement-breakpoint
DROP INDEX "notasMedicas_id_unique";--> statement-breakpoint
DROP INDEX "pacientes_dni_unique";--> statement-breakpoint
DROP INDEX "recetaMedica_id_unique";--> statement-breakpoint
DROP INDEX "signosVitales_id_unique";--> statement-breakpoint
DROP INDEX "tratamiento_id_unique";--> statement-breakpoint
DROP INDEX "turnos_id_unique";--> statement-breakpoint
DROP INDEX "users_id_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `atenciones` ALTER COLUMN "fecha" TO "fecha" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
CREATE UNIQUE INDEX `archivosAdjuntos_id_unique` ON `archivosAdjuntos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `atenciones_id_unique` ON `atenciones` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `diagnostico_id_unique` ON `diagnostico` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `historiaClinica_id_unique` ON `historiaClinica` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `medicamentos_id_unique` ON `medicamentos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `motivosIniciales_id_unique` ON `motivosIniciales` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `notasMedicas_id_unique` ON `notasMedicas` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `pacientes_dni_unique` ON `pacientes` (`dni`);--> statement-breakpoint
CREATE UNIQUE INDEX `recetaMedica_id_unique` ON `recetaMedica` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `signosVitales_id_unique` ON `signosVitales` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tratamiento_id_unique` ON `tratamiento` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `turnos_id_unique` ON `turnos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `atenciones` ALTER COLUMN "motivoInicial" TO "motivoInicial" text;--> statement-breakpoint
ALTER TABLE `atenciones` ALTER COLUMN "estado" TO "estado" text DEFAULT 'pendiente';--> statement-breakpoint
ALTER TABLE `atenciones` ALTER COLUMN "updated_at" TO "updated_at" integer;--> statement-breakpoint
ALTER TABLE `atenciones` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `atenciones` ALTER COLUMN "deleted_at" TO "deleted_at" integer;--> statement-breakpoint
ALTER TABLE `atenciones` ALTER COLUMN "inicioAtencion" TO "inicioAtencion" integer;--> statement-breakpoint
ALTER TABLE `atenciones` ALTER COLUMN "finAtencion" TO "finAtencion" integer;--> statement-breakpoint
ALTER TABLE `atenciones` ALTER COLUMN "duracionAtencion" TO "duracionAtencion" integer;--> statement-breakpoint
ALTER TABLE `atenciones` ADD `historiaClinicaId` text NOT NULL REFERENCES historiaClinica(id);--> statement-breakpoint
ALTER TABLE `atenciones` ALTER COLUMN "userIdMedico" TO "userIdMedico" text NOT NULL REFERENCES users(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `atenciones` DROP COLUMN `diagnosticoId`;--> statement-breakpoint
ALTER TABLE `atenciones` DROP COLUMN `antecedenteId`;--> statement-breakpoint
ALTER TABLE `atenciones` DROP COLUMN `tratamientoId`;--> statement-breakpoint
ALTER TABLE `atenciones` DROP COLUMN `tratamiento`;--> statement-breakpoint
ALTER TABLE `historiaClinica` ALTER COLUMN "fechaApertura" TO "fechaApertura" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `historiaClinica` ALTER COLUMN "estado" TO "estado" text DEFAULT 'activa';--> statement-breakpoint
ALTER TABLE `historiaClinica` ALTER COLUMN "updated_at" TO "updated_at" integer;--> statement-breakpoint
ALTER TABLE `historiaClinica` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (strftime('%s', 'now'));--> statement-breakpoint
ALTER TABLE `historiaClinica` ALTER COLUMN "deleted_at" TO "deleted_at" integer;--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `userIdResponsable` text NOT NULL REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `historiaClinica` ADD `numeroHC` text;--> statement-breakpoint
ALTER TABLE `historiaClinica` ALTER COLUMN "pacienteId" TO "pacienteId" text NOT NULL REFERENCES pacientes(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historiaClinica` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `historiaClinica` DROP COLUMN `motivoConsulta`;--> statement-breakpoint
ALTER TABLE `historiaClinica` DROP COLUMN `diagnosticoId`;--> statement-breakpoint
ALTER TABLE `historiaClinica` DROP COLUMN `antecedenteId`;--> statement-breakpoint
ALTER TABLE `historiaClinica` DROP COLUMN `tratamientoId`;--> statement-breakpoint
ALTER TABLE `historiaClinica` DROP COLUMN `observaciones`;