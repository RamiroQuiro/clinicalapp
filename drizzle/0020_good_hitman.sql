PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_centrosMedicos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`creadoPorId` text NOT NULL,
	`modificadoUltimoPorId` text NOT NULL,
	`tipo` text NOT NULL,
	`direccion` text,
	`telefono` text,
	`activo` integer DEFAULT true,
	`deleted_at` integer,
	`updated_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
INSERT INTO `__new_centrosMedicos`("id", "nombre", "creadoPorId", "modificadoUltimoPorId", "tipo", "direccion", "telefono", "activo", "deleted_at", "updated_at", "created_at") SELECT "id", "nombre", "creadoPorId", "modificadoUltimoPorId", "tipo", "direccion", "telefono", "activo", "deleted_at", "updated_at", "created_at" FROM `centrosMedicos`;--> statement-breakpoint
DROP TABLE `centrosMedicos`;--> statement-breakpoint
ALTER TABLE `__new_centrosMedicos` RENAME TO `centrosMedicos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_usersCentrosMedicos` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`centroMedicoId` integer NOT NULL,
	`nombreCentroMedico` text NOT NULL,
	`rolEnCentro` text NOT NULL,
	`deleted_at` integer,
	`updated_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`centroMedicoId`) REFERENCES `centrosMedicos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_usersCentrosMedicos`("id", "userId", "centroMedicoId", "nombreCentroMedico", "rolEnCentro", "deleted_at", "updated_at", "created_at") SELECT "id", "userId", "centroMedicoId", "nombreCentroMedico", "rolEnCentro", "deleted_at", "updated_at", "created_at" FROM `usersCentrosMedicos`;--> statement-breakpoint
DROP TABLE `usersCentrosMedicos`;--> statement-breakpoint
ALTER TABLE `__new_usersCentrosMedicos` RENAME TO `usersCentrosMedicos`;--> statement-breakpoint
ALTER TABLE `auditLog` ADD `centroMedicoId` text;--> statement-breakpoint
CREATE INDEX `centroMedicoId_idx` ON `auditLog` (`centroMedicoId`);--> statement-breakpoint
ALTER TABLE `turnos` ADD `tipoDeTurno` text DEFAULT 'programado';