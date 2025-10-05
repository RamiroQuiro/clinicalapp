CREATE TABLE `portal_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`turno_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`turno_id`) REFERENCES `turnos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `portal_sessions_token_unique` ON `portal_sessions` (`token`);--> statement-breakpoint
ALTER TABLE `salaDeEspera` ADD `horaAtencion` text NOT NULL;--> statement-breakpoint
ALTER TABLE `salaDeEspera` DROP COLUMN `horaTurno`;