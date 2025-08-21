DROP INDEX "archivosAdjuntos_id_unique";--> statement-breakpoint
DROP INDEX "atencionAntecedentes_id_unique";--> statement-breakpoint
DROP INDEX "atencionDiagnosticos_id_unique";--> statement-breakpoint
DROP INDEX "atencionTratamientos_id_unique";--> statement-breakpoint
DROP INDEX "derivaciones_id_unique";--> statement-breakpoint
DROP INDEX "diagnostico_id_unique";--> statement-breakpoint
DROP INDEX "motivosIniciales_id_unique";--> statement-breakpoint
DROP INDEX "notasMedicas_id_unique";--> statement-breakpoint
DROP INDEX "pacienteProfesional_pacienteId_userId_unique";--> statement-breakpoint
DROP INDEX "pacientes_dni_unique";--> statement-breakpoint
DROP INDEX "recetaMedica_id_unique";--> statement-breakpoint
DROP INDEX "signosVitales_atencionId_pacienteId_unique";--> statement-breakpoint
DROP INDEX "turnos_id_unique";--> statement-breakpoint
DROP INDEX "users_id_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `motivosIniciales` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT strftime('%s', 'now');--> statement-breakpoint
CREATE UNIQUE INDEX `archivosAdjuntos_id_unique` ON `archivosAdjuntos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `atencionAntecedentes_id_unique` ON `atencionAntecedentes` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `atencionDiagnosticos_id_unique` ON `atencionDiagnosticos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `atencionTratamientos_id_unique` ON `atencionTratamientos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `derivaciones_id_unique` ON `derivaciones` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `diagnostico_id_unique` ON `diagnostico` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `motivosIniciales_id_unique` ON `motivosIniciales` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `notasMedicas_id_unique` ON `notasMedicas` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `pacienteProfesional_pacienteId_userId_unique` ON `pacienteProfesional` (`pacienteId`,`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `pacientes_dni_unique` ON `pacientes` (`dni`);--> statement-breakpoint
CREATE UNIQUE INDEX `recetaMedica_id_unique` ON `recetaMedica` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `signosVitales_atencionId_pacienteId_unique` ON `signosVitales` (`atencionId`,`pacienteId`);--> statement-breakpoint
CREATE UNIQUE INDEX `turnos_id_unique` ON `turnos` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `motivosIniciales` ADD `creadoPorId` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `motivosIniciales` ADD `userMedicoId` text REFERENCES users(id);