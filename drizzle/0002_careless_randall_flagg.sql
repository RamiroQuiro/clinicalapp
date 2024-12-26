PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_signosVitales` (
	`id` text PRIMARY KEY NOT NULL,
	`historiaClinicaId` text NOT NULL,
	`pacienteId` text NOT NULL,
	`userId` text NOT NULL,
	`updated_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`deleted_at` text,
	`temperatura` text,
	`pulso` text,
	`respiracion` text,
	`tensionArterial` text,
	`saturacionOxigeno` text,
	`glucosa` text,
	`peso` text,
	`talla` text,
	`imc` text,
	`frecuenciaCardiaca` text,
	`frecuenciaRespiratoria` text,
	`dolor` text
);
--> statement-breakpoint
INSERT INTO `__new_signosVitales`("id", "historiaClinicaId", "pacienteId", "userId", "updated_at", "created_at", "deleted_at", "temperatura", "pulso", "respiracion", "tensionArterial", "saturacionOxigeno", "glucosa", "peso", "talla", "imc", "frecuenciaCardiaca", "frecuenciaRespiratoria", "dolor") SELECT "id", "historiaClinicaId", "pacienteId", "userId", "updated_at", "created_at", "deleted_at", "temperatura", "pulso", "respiracion", "tensionArterial", "saturacionOxigeno", "glucosa", "peso", "talla", "imc", "frecuenciaCardiaca", "frecuenciaRespiratoria", "dolor" FROM `signosVitales`;--> statement-breakpoint
DROP TABLE `signosVitales`;--> statement-breakpoint
ALTER TABLE `__new_signosVitales` RENAME TO `signosVitales`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `signosVitales_id_unique` ON `signosVitales` (`id`);