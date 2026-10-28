import React, { useState, useEffect } from 'react';
import type { Course } from '../../types';

interface CourseFormProps {
    course: Course | null;
    onSave: (course: Course | Omit<Course, 'id'>) => void;
    onClose: () => void;
}

const initialCourseState: Omit<Course, 'id'> = {
    title: '',
    category: 'Periodismo de Datos',
    level: 'Básico',
    format: 'Video',
    cost: '',
    rating: 0,
    reviewCount: 0,
    imageUrl: 'https://picsum.photos/seed/newcourse/1200/800',
    description: '',
    instructorName: '',
    instructorTitle: '',
    instructorAvatarUrl: 'https://i.pravatar.cc/80',
    duration: '',
    topics: [],
    enrollmentStartDate: '',
    enrollmentEndDate: '',
    courseStartDate: '',
    courseEndDate: '',
    accessLink: '#',
};

const CourseForm: React.FC<CourseFormProps> = ({ course, onSave, onClose }) => {
    const [formData, setFormData] = useState(initialCourseState);

    useEffect(() => {
        if (course) {
            setFormData(course);
        } else {
            setFormData(initialCourseState);
        }
    }, [course]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTopicsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = e.target;
        const topicsArray = value.split('\n');
        setFormData(prev => ({ ...prev, topics: topicsArray }));
    };
    
    const handleImageUpload = (field: 'imageUrl' | 'instructorAvatarUrl') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    const base64String = readerEvent.target?.result as string;
                    setFormData(prev => ({ ...prev, [field]: base64String }));
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{course ? 'Editar Curso' : 'Añadir Nuevo Curso'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Categoría</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                                <option>Periodismo de Datos</option>
                                <option>SEO</option>
                                <option>Marketing Digital</option>
                                <option>Podcast</option>
                                <option>Fact-Checking</option>
                                <option>Video Móvil</option>
                                <option>IA Generativa</option>
                                <option>Investigación</option>
                                <option>Ética Periodística</option>
                                <option>Redes Sociales</option>
                                <option>Ciberseguridad</option>
                                <option>Redacción Creativa</option>
                                <option>Periodismo de Viajes</option>
                                <option>Economía</option>
                                <option>Narrativa Transmedia</option>
                                <option>Gestión de Medios</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nivel</label>
                            <select name="level" value={formData.level} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                                <option>Básico</option>
                                <option>Intermedio</option>
                                <option>Avanzado</option>
                                <option>Experto</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Formato</label>
                             <select name="format" value={formData.format} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                                <option>Online</option>
                                <option>Presencial</option>
                                <option>Híbrido</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Costo</label>
                            <select name="cost" value={formData.cost} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary">
                                <option value="">Seleccione...</option>
                                <option value="Gratis">Gratis</option>
                                <option value="Hasta $50.000">Hasta $50.000</option>
                                <option value="$50.000 - $100.000">$50.000 - $100.000</option>
                                <option value="Más de $100.000">Más de $100.000</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                        <label className="block text-sm font-medium text-gray-700">Imagen Principal del Curso</label>
                        {formData.imageUrl && <img src={formData.imageUrl} alt="Previsualización de imagen" className="my-2 rounded max-h-40 object-contain bg-gray-100 border" />}
                        <div>
                            <label className="block text-xs font-medium text-gray-600">URL de la Imagen</label>
                            <input 
                                type="text" 
                                name="imageUrl"
                                placeholder="Pegar URL de la imagen" 
                                value={formData.imageUrl} 
                                onChange={handleChange} 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm" 
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <hr className="flex-grow border-gray-300" />
                            <span className="text-sm text-gray-500">o</span>
                            <hr className="flex-grow border-gray-300" />
                        </div>
                        <button 
                            type="button" 
                            onClick={() => handleImageUpload('imageUrl')} 
                            className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Buscar archivo en el equipo...
                        </button>
                    </div>

                    <div className="p-4 border rounded-lg mt-4">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Información del Instructor</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre del Instructor</label>
                                <input type="text" name="instructorName" value={formData.instructorName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cargo del Instructor</label>
                                <input type="text" name="instructorTitle" value={formData.instructorTitle} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                            </div>
                        </div>
                         <div className="mt-4 space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Avatar del Instructor</label>
                            {formData.instructorAvatarUrl && <img src={formData.instructorAvatarUrl} alt="Previsualización de avatar" className="my-2 rounded-full h-24 w-24 object-cover bg-gray-100 border" />}
                            <div>
                                <label className="block text-xs font-medium text-gray-600">URL del Avatar</label>
                                <input 
                                    type="text" 
                                    name="instructorAvatarUrl"
                                    placeholder="Pegar URL de la imagen" 
                                    value={formData.instructorAvatarUrl} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm" 
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <hr className="flex-grow border-gray-300" />
                                <span className="text-sm text-gray-500">o</span>
                                <hr className="flex-grow border-gray-300" />
                            </div>
                            <button 
                                type="button" 
                                onClick={() => handleImageUpload('instructorAvatarUrl')}
                                className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Buscar archivo en el equipo...
                            </button>
                        </div>
                    </div>

                    <div className="p-4 border rounded-lg mt-4">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Detalles del Curso</h3>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Duración</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="Ej: 6 Semanas" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Temas (uno por línea)</label>
                            <textarea name="topics" value={formData.topics.join('\n')} onChange={handleTopicsChange} rows={5} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Inicio Inscripciones</label>
                                <input type="date" name="enrollmentStartDate" value={formData.enrollmentStartDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Fin Inscripciones</label>
                                <input type="date" name="enrollmentEndDate" value={formData.enrollmentEndDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Inicio del Curso</label>
                                <input type="date" name="courseStartDate" value={formData.courseStartDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Fin del Curso</label>
                                <input type="date" name="courseEndDate" value={formData.courseEndDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                            </div>
                        </div>
                         <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Enlace de Acceso</label>
                            <input type="text" name="accessLink" value={formData.accessLink} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                        </div>
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

export default CourseForm;