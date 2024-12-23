CREATE TABLE `pacientes` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`nombreApellido` text NOT NULL,
	`password` text NOT NULL,
	`dni` integer,
	`srcPhoto` text,
	`celular` text,
	`direccion` text,
	`ciudad` text,
	`provincia` text,
	`pais` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pacientes_id_unique` ON `pacientes` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `pacientes_email_unique` ON `pacientes` (`email`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`nombreApellido` text NOT NULL,
	`password` text NOT NULL,
	`dni` integer,
	`srcPhoto` text,
	`celular` text,
	`direccion` text,
	`ciudad` text,
	`provincia` text,
	`pais` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);