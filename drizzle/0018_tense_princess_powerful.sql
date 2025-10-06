PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_portal_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`token` text NOT NULL,
	`turno_id` text NOT NULL,
	`expired_at` integer NOT NULL,
	FOREIGN KEY (`turno_id`) REFERENCES `turnos`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_portal_sessions`("id", "token", "turno_id", "expired_at") SELECT "id", "token", "turno_id", "expired_at" FROM `portal_sessions`;--> statement-breakpoint
DROP TABLE `portal_sessions`;--> statement-breakpoint
ALTER TABLE `__new_portal_sessions` RENAME TO `portal_sessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `portal_sessions_token_unique` ON `portal_sessions` (`token`);--> statement-breakpoint
ALTER TABLE `atenciones` ADD `turnoId` text REFERENCES turnos(id);--> statement-breakpoint
ALTER TABLE `atenciones` ADD `centroMedicoId` integer NOT NULL REFERENCES centrosMedicos(id);