CREATE TABLE `salaDeEspera` (
	`id` text PRIMARY KEY NOT NULL,
	`turnoId` text NOT NULL,
	`pacienteId` text NOT NULL,
	`atencionId` text,
	`nombrePaciente` text NOT NULL,
	`apellidoPaciente` text NOT NULL,
	`dniPaciente` text NOT NULL,
	`userMedicoId` text NOT NULL,
	`fecha` integer NOT NULL,
	`horaTurno` text NOT NULL,
	`horaLlegada` integer,
	`orden` integer,
	`motivoConsulta` text,
	`estado` text DEFAULT 'pendiente',
	`isExist` integer DEFAULT false,
	`activo` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`turnoId`) REFERENCES `turnos`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`pacienteId`) REFERENCES `pacientes`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`atencionId`) REFERENCES `atenciones`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`userMedicoId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
DROP TABLE `listaDeEspera`;