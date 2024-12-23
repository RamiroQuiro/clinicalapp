CREATE TABLE `archivosAdjuntos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text NOT NULL,
	`url` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `archivosAdjuntos_id_unique` ON `archivosAdjuntos` (`id`);--> statement-breakpoint
CREATE TABLE `historiaClinica` (
	`id` text PRIMARY KEY NOT NULL,
	`pacienteId` text NOT NULL,
	`fecha` text NOT NULL,
	`userId` text NOT NULL,
	`motivoConsulta` text NOT NULL,
	`diagnostico` text NOT NULL,
	`tratamiento` text NOT NULL,
	`observaciones` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `historiaClinica_id_unique` ON `historiaClinica` (`id`);--> statement-breakpoint
CREATE TABLE `medicamentos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text NOT NULL,
	`precio` text NOT NULL,
	`stock` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `medicamentos_id_unique` ON `medicamentos` (`id`);--> statement-breakpoint
CREATE TABLE `pagos` (
	`id` integer PRIMARY KEY NOT NULL,
	`monto` integer NOT NULL,
	`fechaPago` text NOT NULL,
	`pacienteId` text NOT NULL,
	`userId` text NOT NULL,
	`metodoPago` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recetaMedica` (
	`id` text PRIMARY KEY NOT NULL,
	`pacienteId` text NOT NULL,
	`medicoId` text NOT NULL,
	`medicamentos` text NOT NULL,
	`fecha` text NOT NULL,
	`observaciones` text,
	`horarios` text,
	`cantidad` text,
	`activo` integer DEFAULT true,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recetaMedica_id_unique` ON `recetaMedica` (`id`);--> statement-breakpoint
CREATE TABLE `turnos` (
	`id` text PRIMARY KEY NOT NULL,
	`pacienteId` text NOT NULL,
	`usuarioId` text NOT NULL,
	`fecha` text NOT NULL,
	`hora` text NOT NULL,
	`motivoConsulta` text NOT NULL,
	`activo` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `turnos_id_unique` ON `turnos` (`id`);--> statement-breakpoint
ALTER TABLE `pacientes` ADD `nombre` text NOT NULL;--> statement-breakpoint
ALTER TABLE `pacientes` ADD `apellido` text NOT NULL;--> statement-breakpoint
ALTER TABLE `pacientes` ADD `updated_at` text;--> statement-breakpoint
ALTER TABLE `pacientes` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `pacientes` DROP COLUMN `nombreApellido`;--> statement-breakpoint
ALTER TABLE `pacientes` DROP COLUMN `password`;--> statement-breakpoint
ALTER TABLE `users` ADD `nombre` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `apellido` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `nombreApellido`;