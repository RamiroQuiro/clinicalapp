ALTER TABLE `pacientes` ADD `text` text;--> statement-breakpoint
CREATE UNIQUE INDEX `pacientes_dni_unique` ON `pacientes` (`dni`);