PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pacientes` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`userId` text NOT NULL,
	`apellido` text NOT NULL,
	`dni` integer,
	`email` text,
	`srcPhoto` text,
	`celular` text,
	`sexo` text,
	`direccion` text,
	`ciudad` text,
	`provincia` text,
	`pais` text,
	`updated_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_pacientes`("id", "nombre", "userId", "apellido", "dni", "email", "srcPhoto", "celular", "sexo", "direccion", "ciudad", "provincia", "pais", "updated_at", "created_at", "deleted_at") SELECT "id", "nombre", "userId", "apellido", "dni", "email", "srcPhoto", "celular", "sexo", "direccion", "ciudad", "provincia", "pais", "updated_at", "created_at", "deleted_at" FROM `pacientes`;--> statement-breakpoint
DROP TABLE `pacientes`;--> statement-breakpoint
ALTER TABLE `__new_pacientes` RENAME TO `pacientes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `pacientes_id_unique` ON `pacientes` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `pacientes_dni_unique` ON `pacientes` (`dni`);