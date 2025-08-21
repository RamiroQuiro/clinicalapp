PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_motivosIniciales` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`categoria` text,
	`descripcion` text,
	`atencionId` text,
	`creadoPorId` text,
	`userMedicoId` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`atencionId`) REFERENCES `atenciones`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`creadoPorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userMedicoId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_motivosIniciales`("id", "nombre", "categoria", "descripcion", "atencionId", "creadoPorId", "userMedicoId", "created_at") SELECT "id", "nombre", "categoria", "descripcion", "atencionId", "creadoPorId", "userMedicoId", "created_at" FROM `motivosIniciales`;--> statement-breakpoint
DROP TABLE `motivosIniciales`;--> statement-breakpoint
ALTER TABLE `__new_motivosIniciales` RENAME TO `motivosIniciales`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `motivosIniciales_id_unique` ON `motivosIniciales` (`id`);