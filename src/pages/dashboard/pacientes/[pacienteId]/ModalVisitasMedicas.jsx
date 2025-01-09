import React from 'react'

export default function ModalVisitasMedicas({data}) {
  return (
    <div className="space-y-6 py-4">
          {/* Información del Paciente */}
          <section className="space-y-2">
            <h3 className="text-lg font-medium">Información del Paciente</h3>
            <div className="bg-secondary p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{"data.patient.name"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Edad</p>
                  <p className="font-medium">{"data.patient.age"} años</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Género</p>
                  <p className="font-medium">{"data.patient.gender"}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Signos Vitales */}
          <section className="space-y-2">
            <h3 className="text-lg font-medium">Signos Vitales</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-primary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Temperatura</p>
                <p className="font-medium">{"data.vitalSigns.temperature"}</p>
              </div>
              <div className="bg-primary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Presión Arterial</p>
                <p className="font-medium">{"data.vitalSigns.bloodPressure"}</p>
              </div>
              <div className="bg-primary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Frecuencia Cardíaca</p>
                <p className="font-medium">{"data.vitalSigns.heartRate"}</p>
              </div>
              <div className="bg-primary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Saturación O2</p>
                <p className="font-medium">{"data.vitalSigns.oxygenSaturation"}</p>
              </div>
            </div>
          </section>

          {/* Diagnóstico */}
          <section className="space-y-2">
            <h3 className="text-lg font-medium">Diagnóstico</h3>
            <div className="bg-secondary p-4 rounded-lg">
              <p>{"data.diagnosis"}</p>
            </div>
          </section>

          {/* Medicamentos */}
          <section className="space-y-2">
            <h3 className="text-lg font-medium">Medicamentos Recetados</h3>
            <div className="bg-secondary rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium">Medicamento</th>
                    <th className="text-left p-4 text-sm font-medium">Dosis</th>
                    <th className="text-left p-4 text-sm font-medium">Frecuencia</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.medications.map((med, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="p-4">{med.name}</td>
                      <td className="p-4">{med.dosage}</td>
                      <td className="p-4">{med.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Notas del Médico */}
          <section className="space-y-2">
            <h3 className="text-lg font-medium">Notas del Médico</h3>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="whitespace-pre-line">{"data.doctorNotes"}</p>
              <p className="text-sm text-muted-foreground mt-4">
                Dr. {"data.doctorName"}
              </p>
            </div>
          </section>
        </div>
  )
}
