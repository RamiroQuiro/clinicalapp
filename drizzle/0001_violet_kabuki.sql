CREATE TABLE `diagnostico` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`historiaClinicaId` text NOT NULL,
	`pacienteId` text NOT NULL,
	`userId` text NOT NULL,
	`observaciones` text NOT NULL,
	`tratamiento` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diagnostico_id_unique` ON `diagnostico` (`id`);--> statement-breakpoint
CREATE TABLE `signosVitales` (
	`id` text PRIMARY KEY NOT NULL,
	`historiaClinicaId` text NOT NULL,
	`pacienteId` text NOT NULL,
	`userId` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`deleted_at` text,
	`temperatura` text NOT NULL,
	`pulso` text NOT NULL,
	`respiracion` text NOT NULL,
	`tensionArterial` text NOT NULL,
	`saturacionOxigeno` text NOT NULL,
	`glucosa` text NOT NULL,
	`peso` text NOT NULL,
	`talla` text NOT NULL,
	`imc` text NOT NULL,
	`frecuenciaCardiaca` text NOT NULL,
	`frecuenciaRespiratoria` text NOT NULL,
	`dolor` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `signosVitales_id_unique` ON `signosVitales` (`id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_historiaClinica` (
	`id` text PRIMARY KEY NOT NULL,
	`pacienteId` text NOT NULL,
	`fecha` text NOT NULL,
	`userId` text NOT NULL,
	`motivoConsulta` text,
	`diagnostico` text,
	`tratamiento` text,
	`observaciones` text,
	`updated_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_historiaClinica`("id", "pacienteId", "fecha", "userId", "motivoConsulta", "diagnostico", "tratamiento", "observaciones", "updated_at", "created_at", "deleted_at") SELECT "id", "pacienteId", "fecha", "userId", "motivoConsulta", "diagnostico", "tratamiento", "observaciones", "updated_at", "created_at", "deleted_at" FROM `historiaClinica`;--> statement-breakpoint
DROP TABLE `historiaClinica`;--> statement-breakpoint
ALTER TABLE `__new_historiaClinica` RENAME TO `historiaClinica`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `historiaClinica_id_unique` ON `historiaClinica` (`id`);--> statement-breakpoint
ALTER TABLE `medicamentos` ADD `historiaClinicaId` text NOT NULL;--> statement-breakpoint
ALTER TABLE `medicamentos` ADD `pacienteId` text NOT NULL;--> statement-breakpoint
ALTER TABLE `medicamentos` ADD `userId` text NOT NULL;--> statement-breakpoint
ALTER TABLE `medicamentos` ADD `dosis` text;--> statement-breakpoint
ALTER TABLE `medicamentos` ADD `frecuencia` text;--> statement-breakpoint
ALTER TABLE `medicamentos` ADD `duracion` text;