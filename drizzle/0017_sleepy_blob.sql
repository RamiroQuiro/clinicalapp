CREATE TABLE `centrosMedicos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`tipo` text NOT NULL,
	`direccion` text,
	`telefono` text,
	`activo` integer DEFAULT true,
	`deleted_at` integer,
	`updated_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `usersCentrosMedicos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`centroMedicoId` integer NOT NULL,
	`rolEnCentro` text NOT NULL,
	`deleted_at` integer,
	`updated_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`centroMedicoId`) REFERENCES `centrosMedicos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP INDEX `turnos_id_unique`;--> statement-breakpoint
ALTER TABLE `turnos` ADD `centroMedicoId` integer REFERENCES centrosMedicos(id);--> statement-breakpoint
CREATE UNIQUE INDEX `turnos_fechaTurno_userMedicoId_unique` ON `turnos` (`fechaTurno`,`userMedicoId`);--> statement-breakpoint
ALTER TABLE `users` ADD `documento` text;--> statement-breakpoint
ALTER TABLE `users` ADD `cuil` text;--> statement-breakpoint
ALTER TABLE `users` ADD `cuit` text;--> statement-breakpoint
ALTER TABLE `users` ADD `telefono` text;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `entidadId`;