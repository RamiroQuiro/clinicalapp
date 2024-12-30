CREATE TABLE `medicamentos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`historiaClinicaId` text NOT NULL,
	`pacienteId` text NOT NULL,
	`userId` text NOT NULL,
	`dosis` text,
	`frecuencia` text,
	`duracion` text,
	`precio` text,
	`stock` text,
	`updated_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `medicamentos_id_unique` ON `medicamentos` (`id`);