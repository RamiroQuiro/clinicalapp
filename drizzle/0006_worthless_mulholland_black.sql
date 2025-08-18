ALTER TABLE `turnos` RENAME COLUMN "usuarioId" TO "userId";--> statement-breakpoint
CREATE TABLE `doctoresPacientes` (
	`userId` text NOT NULL,
	`pacienteId` text NOT NULL,
	PRIMARY KEY(`userId`, `pacienteId`),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pacienteId`) REFERENCES `pacientes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fichaPaciente` (
	`id` text PRIMARY KEY NOT NULL,
	`pacienteId` text NOT NULL,
	`userId` text NOT NULL,
	`obraSocial` text,
	`nObraSocial` text,
	`historialMedico` text,
	`observaciones` text,
	`email` text,
	`srcPhoto` text,
	`celular` text,
	`estatura` text,
	`direccion` text,
	`ciudad` text,
	`grupoSanguinieo` text,
	`provincia` text,
	`pais` text,
	`updated_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`pacienteId`) REFERENCES `pacientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `listaDeEspera` (
	`id` text PRIMARY KEY NOT NULL,
	`pacienteId` text,
	`nombre` text NOT NULL,
	`apellido` text NOT NULL,
	`isExist` integer DEFAULT false,
	`dni` text NOT NULL,
	`userId` text NOT NULL,
	`fecha` text NOT NULL,
	`orden` integer,
	`hora` text NOT NULL,
	`motivoConsulta` text NOT NULL,
	`estado` text DEFAULT 'pendiente',
	`activo` text DEFAULT 'true'
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expiresAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `motivosIniciales` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`atencionId` text,
	`categoria` text,
	`descripcion` text,
	`created_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `motivosIniciales_id_unique` ON `motivosIniciales` (`id`);--> statement-breakpoint
CREATE TABLE `notasMedicas` (
	`id` text PRIMARY KEY NOT NULL,
	`pacienteId` text NOT NULL,
	`userId` text NOT NULL,
	`observaciones` text,
	`descripcion` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notasMedicas_id_unique` ON `notasMedicas` (`id`);--> statement-breakpoint
DROP INDEX `antecedente_id_unique`;--> statement-breakpoint
DROP INDEX "archivosAdjuntos_id_unique";--> statement-breakpoint
DROP INDEX "atenciones_id_unique";--> statement-breakpoint
DROP INDEX "diagnostico_id_unique";--> statement-breakpoint
DROP INDEX "historiaClinica_id_unique";--> statement-breakpoint
DROP INDEX "medicamentos_id_unique";--> statement-breakpoint
DROP INDEX "pacientes_dni_unique";--> statement-breakpoint
DROP INDEX "recetaMedica_id_unique";--> statement-breakpoint
DROP INDEX "signosVitales_id_unique";--> statement-breakpoint
DROP INDEX "tratamiento_id_unique";--> statement-breakpoint
DROP INDEX "turnos_id_unique";--> statement-breakpoint
DROP INDEX "users_id_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "motivosIniciales_id_unique";--> statement-breakpoint
DROP INDEX "notasMedicas_id_unique";--> statement-breakpoint
ALTER TABLE `antecedente` ALTER COLUMN "descripcion" TO "descripcion" text;--> statement-breakpoint
CREATE UNIQUE INDEX `archivosAdjuntos_id_unique` ON `archivosAdjuntos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `atenciones_id_unique` ON `atenciones` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `diagnostico_id_unique` ON `diagnostico` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `historiaClinica_id_unique` ON `historiaClinica` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `medicamentos_id_unique` ON `medicamentos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `pacientes_dni_unique` ON `pacientes` (`dni`);--> statement-breakpoint
CREATE UNIQUE INDEX `recetaMedica_id_unique` ON `recetaMedica` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `signosVitales_id_unique` ON `signosVitales` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tratamiento_id_unique` ON `tratamiento` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `turnos_id_unique` ON `turnos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `antecedente` ADD `antecedente` text NOT NULL;--> statement-breakpoint
ALTER TABLE `antecedente` ADD `condicion` text;--> statement-breakpoint
ALTER TABLE `antecedente` ADD `estado` text;--> statement-breakpoint
ALTER TABLE `antecedente` ADD `fechaDiagnostico` text DEFAULT (current_timestamp);--> statement-breakpoint
DROP INDEX `pacientes_id_unique`;--> statement-breakpoint
ALTER TABLE `pacientes` ADD `domicilio` text;--> statement-breakpoint
ALTER TABLE `pacientes` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `pacientes` DROP COLUMN `email`;--> statement-breakpoint
ALTER TABLE `pacientes` DROP COLUMN `srcPhoto`;--> statement-breakpoint
ALTER TABLE `pacientes` DROP COLUMN `celular`;--> statement-breakpoint
ALTER TABLE `pacientes` DROP COLUMN `direccion`;--> statement-breakpoint
ALTER TABLE `pacientes` DROP COLUMN `ciudad`;--> statement-breakpoint
ALTER TABLE `pacientes` DROP COLUMN `grupoSanguinieo`;--> statement-breakpoint
ALTER TABLE `pacientes` DROP COLUMN `provincia`;--> statement-breakpoint
ALTER TABLE `pacientes` DROP COLUMN `pais`;--> statement-breakpoint
ALTER TABLE `pacientes` DROP COLUMN `updated_at`;--> statement-breakpoint
ALTER TABLE `pacientes` DROP COLUMN `deleted_at`;--> statement-breakpoint
ALTER TABLE `diagnostico` ALTER COLUMN "historiaClinicaId" TO "historiaClinicaId" text;--> statement-breakpoint
ALTER TABLE `diagnostico` ADD `atencionId` text NOT NULL;--> statement-breakpoint
ALTER TABLE `diagnostico` ADD `codigoCIE` text NOT NULL;--> statement-breakpoint
ALTER TABLE `medicamentos` ALTER COLUMN "historiaClinicaId" TO "historiaClinicaId" text;--> statement-breakpoint
ALTER TABLE `medicamentos` ADD `atencionId` text NOT NULL;--> statement-breakpoint
ALTER TABLE `signosVitales` ALTER COLUMN "historiaClinicaId" TO "historiaClinicaId" text;--> statement-breakpoint
ALTER TABLE `signosVitales` ADD `atencionId` text NOT NULL;--> statement-breakpoint
ALTER TABLE `archivosAdjuntos` ADD `pacienteId` text NOT NULL;--> statement-breakpoint
ALTER TABLE `archivosAdjuntos` ADD `estado` text;--> statement-breakpoint
ALTER TABLE `archivosAdjuntos` ADD `tipo` text;--> statement-breakpoint
ALTER TABLE `atenciones` ADD `motivoInicial` text NOT NULL;--> statement-breakpoint
ALTER TABLE `atenciones` ADD `tratamiento` text;--> statement-breakpoint
ALTER TABLE `atenciones` ADD `inicioAtencion` text;--> statement-breakpoint
ALTER TABLE `atenciones` ADD `finAtencion` text;--> statement-breakpoint
ALTER TABLE `atenciones` ADD `duracionAtencion` text;--> statement-breakpoint
ALTER TABLE `atenciones` ALTER COLUMN "pacienteId" TO "pacienteId" text NOT NULL REFERENCES pacientes(id) ON DELETE no action ON UPDATE no action;