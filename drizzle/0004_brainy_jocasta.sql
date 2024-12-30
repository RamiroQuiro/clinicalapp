CREATE TABLE `atenciones` (
	`id` text PRIMARY KEY NOT NULL,
	`pacienteId` text NOT NULL,
	`fecha` text NOT NULL,
	`userId` text NOT NULL,
	`motivoConsulta` text,
	`diagnosticoId` text,
	`antecedenteId` text,
	`tratamientoId` text,
	`estado` text DEFAULT 'pediente',
	`observaciones` text,
	`updated_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `atenciones_id_unique` ON `atenciones` (`id`);