import React, { useState } from 'react';

interface SettingsFormProps {
    initialInterval: number;
    onSave: (interval: number) => void;
    onClose: () => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ initialInterval, onSave, onClose }) => {
    const [interval, setInterval] = useState(initialInterval);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(interval);
    };

    return (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Configuración General</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="rotationInterval" className="block text-sm font-medium text-gray-700">Intervalo de Rotación de Talentos (en horas)</label>
                        <input
                            type="number"
                            id="rotationInterval"
                            name="rotationInterval"
                            value={interval}
                            onChange={(e) => setInterval(parseInt(e.target.value, 10) || 1)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                            min="1"
                            required
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Define cada cuántas horas se debe mezclar aleatoriamente el orden de los perfiles en la Base de Talentos.
                        </p>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsForm;
