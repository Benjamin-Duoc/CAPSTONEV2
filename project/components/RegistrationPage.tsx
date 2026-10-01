import React, { useState } from 'react';
import type { Page, User } from '../types';
import { registerUser } from '../utils/db';
import { chileanRegions } from '../data/mockData';
import Logo from './Logo';

interface RegistrationPageProps {
    onNavigate: (page: Page) => void;
    onLogin?: (user: User) => void; // Usamos el tipo User del Main
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ onNavigate, onLogin }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        region: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'bg-gray-200' });

    const calculatePasswordStrength = (password: string) => {
        let score = 0;
        if (password.length > 5) score += 1;
        if (password.length > 7) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        if (password.length === 0) setPasswordStrength({ score: 0, label: '', color: 'bg-gray-200' });
        else if (score <= 2) setPasswordStrength({ score, label: 'Débil', color: 'bg-red-500' });
        else if (score <= 4) setPasswordStrength({ score, label: 'Media', color: 'bg-yellow-500' });
        else setPasswordStrength({ score, label: 'Fuerte', color: 'bg-green-500' });
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (passwordStrength.score <= 2) {
            setError('La contraseña es demasiado débil. Usa al menos 6 caracteres, combinando letras, números o mayúsculas.');
            return;
        }

        // Lógica asíncrona de HEAD para conectar con la API real
        try {
            const result = await registerUser({
                firstName: formData.firstName,
                lastName: formData.lastName,
                region: formData.region,
                email: formData.email,
                password: formData.password
            });

            if (result.success) {
                setError(''); // Limpiamos errores previos
                setSuccess(true);
                // Esperamos 2 segundos para que el usuario vea el mensaje de éxito
                setTimeout(() => {
                    if (onLogin) {
                        // Logueamos automáticamente al usuario (Usa el ID real del backend)
                        onLogin({
                            id: result.userId, 
                            firstName: formData.firstName,
                            lastName: formData.lastName,
                            email: formData.email,
                            region: formData.region,
                            role: 'Colaborador Gratis', 
                            password: formData.password, // Added password to match the type formally though it shouldn't be here in plain text.
                            createdAt: new Date().toISOString()
                        });
                    }
                    onNavigate('home');
                }, 2000);
            } else {
                setError(result.message || 'Error al registrar usuario.');
            }
        } catch (err) {
            setError('Ocurrió un error inesperado al conectar con el servidor.');
            console.error(err);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background animate-fade-in p-4">
                <div className="bg-surface p-8 rounded-lg shadow-xl text-center max-w-md w-full border border-gray-200">
                    <div className="text-green-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold font-serif text-text-primary mb-2">¡Registro Exitoso!</h2>
                    <p className="text-text-secondary">Bienvenido a CiPress. Serás redirigido al inicio en breve.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="mb-8">
                <Logo onNavigate={onNavigate} />
            </div>

            <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-lg shadow-xl border border-gray-200">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-text-primary font-serif">Crea tu cuenta</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        Únete a la comunidad de periodistas innovadores
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200" role="alert">
                            <p className="text-sm text-red-600 font-medium text-center">
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nombre(s)</label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Ingresa tu o tus nombre"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Ingresa tu o tus apellidos"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                            <select
                                id="region"
                                name="region"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white"
                                value={formData.region}
                                onChange={handleSelectChange}
                            >
                                <option value="" disabled>Selecciona tu región</option>
                                {chileanRegions.map((region) => (
                                    <option key={region} value={region}>
                                        {region}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Ingresa tu correo"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Ingresa tu contraseña"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {formData.password.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-500 font-medium">Seguridad de la contraseña:</span>
                                        <span className={`text-xs font-bold ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</span>
                                    </div>
                                    <div className="flex gap-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full ${passwordStrength.color} transition-all duration-300`} style={{ width: passwordStrength.score >= 1 ? '20%' : '0%' }}></div>
                                        <div className={`h-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'} transition-all duration-300`} style={{ width: passwordStrength.score >= 2 ? '20%' : '0%' }}></div>
                                        <div className={`h-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'} transition-all duration-300`} style={{ width: passwordStrength.score >= 3 ? '20%' : '0%' }}></div>
                                        <div className={`h-full ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'} transition-all duration-300`} style={{ width: passwordStrength.score >= 4 ? '20%' : '0%' }}></div>
                                        <div className={`h-full ${passwordStrength.score >= 5 ? passwordStrength.color : 'bg-transparent'} transition-all duration-300`} style={{ width: passwordStrength.score >= 5 ? '20%' : '0%' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Repetir Contraseña</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Repite la contraseña anterior"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg transition-colors duration-200"
                        >
                            Registrarme ahora
                        </button>
                    </div>
                    <div className="text-center">
                        <button type="button" onClick={() => onNavigate('home')} className="text-sm font-medium text-primary hover:text-orange-600">
                            Volver al inicio
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;