import React, { useState, useEffect } from 'react';
import type { Event } from '../../types';

interface EventFormProps {
    event: Event | null;
    onSave: (event: Event | Omit<Event, 'id'>) => void;
    onClose: () => void;
}

const initialEventState: Omit<Event, 'id'> = {
    title: '',
    date: '',
    fullDate: '',
    location: '',
    type: 'Webinar',
    link: '#',
};

const EventForm: React.FC<EventFormProps> = ({ event, onSave, onClose }) => {
    const [formData, setFormData] = useState(initialEventState);
    const [helperDate, setHelperDate] = useState('');

    useEffect(() => {
        if (event) {
            setFormData(event);
        } else {
            setFormData(initialEventState);
        }
    }, [event]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateHelperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        setHelperDate(dateValue);

        if (!dateValue) return;

        const dateObj = new Date(dateValue);

        // 1. Format Short Date: "DD MMM" (e.g., "05 AGO")
        const day = dateObj.getDate().toString().padStart(2, '0');
        const monthShort = dateObj.toLocaleDateString('es-CL', { month: 'short' }).toUpperCase().replace('.', '');
        const shortDate = `${day} ${monthShort}`;

        // 2. Format Full Date: "Weekday DD de Month, HH:mm hrs."
        // e.g., "Lunes 05 de Agosto, 19:00 hrs."
        const weekday = dateObj.toLocaleDateString('es-CL', { weekday: 'long' });
        // Capitalize first letter of weekday
        const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);

        const monthLong = dateObj.toLocaleDateString('es-CL', { month: 'long' });
        const monthLongCap = monthLong.charAt(0).toUpperCase() + monthLong.slice(1);

        const time = dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });

        const fullDate = `${weekdayCap} ${day} de ${monthLongCap}, ${time} hrs.`;

        setFormData(prev => ({
            ...prev,
            date: shortDate,
            fullDate: fullDate
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{event ? 'Editar Evento' : 'Añadir Nuevo Evento'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título del Evento</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-sm font-medium text-blue-800 mb-1">Seleccionar Fecha y Hora (Automático)</label>
                        <p className="text-xs text-blue-600 mb-2">Selecciona la fecha aquí para rellenar automáticamente los campos de abajo.</p>
                        <input
                            type="datetime-local"
                            value={helperDate}
                            onChange={handleDateHelperChange}
                            className="block w-full border border-blue-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha Corta</label>
                            <input type="text" name="date" placeholder="Ej: 05 AGO" value={formData.date} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha Completa</label>
                            <input type="text" name="fullDate" placeholder="Ej: Lunes 05 de Agosto, 19:00 hrs." value={formData.fullDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                            <input type="text" name="location" placeholder="Ej: Online o Santiago, Chile" value={formData.location} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                <option>Webinar</option>
                                <option>Taller</option>
                                <option>Conferencia</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Enlace de Inscripción (URL)</label>
                        <input type="url" name="link" value={formData.link} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
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

export default EventForm;