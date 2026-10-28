import React, { useState } from 'react';
import type { User } from '../../types';
import { CameraIcon } from '@heroicons/react/24/solid';

interface MyProfileViewProps {
    currentUser: User;
    onSaveProfile: (updates: Partial<User>) => void;
}

const DEFAULT_AVATAR = "https://picsum.photos/seed/user/200/200";

const MyProfileView: React.FC<MyProfileViewProps> = ({ currentUser, onSaveProfile }) => {
    const [formData, setFormData] = useState({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
        linkedinUrl: currentUser.linkedinUrl || '',
        twitterUrl: currentUser.twitterUrl || '',
        avatarUrl: currentUser.avatarUrl || '',
        newPassword: ''
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    const base64String = readerEvent.target?.result as string;
                    setFormData(prev => ({ ...prev, avatarUrl: base64String }));
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const updates: any = {
            id: currentUser.id,
            ...formData,
        };

        if (updates.newPassword) {
            updates.password = updates.newPassword;
        }
        delete updates.newPassword;

        try {
            await onSaveProfile(updates);
            // Mostraríamos un msj de éxito, asumiendo que onSaveProfile lo hace o actualiza el local state
            setFormData(prev => ({ ...prev, newPassword: ''})); // clear password field
        } finally {
            setIsSaving(false);
        }
    };

    // Obtenemos la fecha de creación para la vista (simulada o real)
    const memberSince = "Marzo 2024";

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-fade-in relative bg-white md:rounded-2xl mt-8 shadow-sm border border-gray-100">
            {/* Header Banner Background */}
            <div className="w-full h-24 bg-primary md:rounded-t-2xl"></div>

            <div className="px-8 md:px-12">
                {/* Profile Avatar Section */}
                <div className="relative flex flex-col md:flex-row items-center mb-10 -mt-12 gap-6">
                    <div className="relative flex-shrink-0">
                        <img 
                            src={formData.avatarUrl || DEFAULT_AVATAR} 
                            alt="Avatar" 
                            className="w-32 h-32 rounded-2xl object-cover shadow-sm border-4 border-white bg-white"
                            onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                        />
                    <button 
                        type="button"
                        onClick={handleImageUpload}
                        className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-full shadow-md hover:bg-orange-600 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        title="Cambiar foto de perfil"
                    >
                        <CameraIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-grow text-center md:text-left mb-2 md:pl-2 pt-16">
                    <h2 className="text-3xl font-extrabold font-serif text-gray-900 leading-none">
                        {formData.firstName} {formData.lastName}
                    </h2>
                    <p className="text-sm font-medium text-gray-500 mt-2">
                        Miembro desde {memberSince} • <span className="text-primary font-bold">{currentUser.role}</span>
                    </p>
                </div>

                <div className="mb-2 md:self-center pt-16">
                    <button 
                        onClick={handleSubmit} 
                        disabled={isSaving}
                        className="flex items-center px-6 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-lg shadow-sm hover:bg-blue-100 hover:text-blue-800 transition-all border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isSaving ? 'Guardando...' : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                                Guardar cambios
                            </>
                        )}
                    </button>
                </div>
            </div>

            <hr className="mb-8 border-gray-100" />

            {/* The Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Datos Básicos */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Datos Básicos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Nombre</label>
                            <input 
                                type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                                className="block w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg py-3 px-4 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Apellido</label>
                            <input 
                                type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
                                className="block w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg py-3 px-4 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Correo Electrónico (Solo Lectura)</label>
                            <input 
                                type="email" value={formData.email} readOnly disabled
                                className="block w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-lg py-3 px-4 cursor-not-allowed font-medium" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Teléfono</label>
                            <input 
                                type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+56 9 1234 5678"
                                className="block w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg py-3 px-4 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium" 
                            />
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Perfil Profesional */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Perfil Profesional</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Biografía Corta</label>
                                <span className="text-xs font-medium text-gray-400">{formData.bio.length}/150</span>
                            </div>
                            <textarea 
                                name="bio" value={formData.bio} onChange={handleChange} maxLength={150} rows={3} placeholder="Cuéntanos un poco sobre ti..."
                                className="block w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg py-3 px-4 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none font-medium" 
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">URL de LinkedIn</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 text-gray-500 sm:text-sm">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                    </span>
                                    <input 
                                        type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/usuario"
                                        className="flex-1 block w-full rounded-none rounded-r-lg bg-gray-50 border border-gray-200 text-gray-900 py-3 px-4 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all sm:text-sm font-medium" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Portfolio / Web Personal</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 text-gray-500 sm:text-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                    </span>
                                    <input 
                                        type="url" name="twitterUrl" value={formData.twitterUrl} onChange={handleChange} placeholder="https://mi-portafolio.com"
                                        className="flex-1 block w-full rounded-none rounded-r-lg bg-gray-50 border border-gray-200 text-gray-900 py-3 px-4 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all sm:text-sm font-medium" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Seguridad */}
                <div>
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Seguridad</h3>
                     <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Actualizar Contraseña</label>
                        <input 
                            type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Ingresa una nueva contraseña para cambiarla"
                            className="block w-full md:w-1/2 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg py-3 px-4 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium" 
                        />
                        <p className="mt-2 text-xs text-gray-500 font-medium">Déjalo en blanco si no deseas cambiarla.</p>
                     </div>
                </div>

            </form>
            </div>
        </div>
    );
};

export default MyProfileView;
