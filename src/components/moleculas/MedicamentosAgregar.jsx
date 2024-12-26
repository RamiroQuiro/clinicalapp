import React from 'react';

export default function MedicamentosAgregar({ label, value, name, handleChange }) {
    return (
        <div className="flex  w-full sm:w-1/3 text-primary-texto text-sm items-center gap-y-1 py-2 border-y border-gray-300 px-3">
            <label className="font-semibold mr-3">{label}:</label>
            <input
                type="text"
                name={name}
                className="bg-white outline-none p-1 rounded-lg border border-gray-300 shadow w-full"
                value={value}
                onChange={handleChange}
            />
        </div>
    );
}
