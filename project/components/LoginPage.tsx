
import React, { useState } from 'react';
import type { Page } from '../types';
import { loginUser } from '../utils/db';
import Logo from './Logo';

interface LoginPageProps {
    onNavigate: (page: Page) => void;
    onLoginSuccess?: (user: any) => void;
    returnTo?: Page;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess, returnTo }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear error on typing
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await loginUser(formData.email, formData.password);

        if (result.success && result.user) {
            if (onLoginSuccess) {
                onLoginSuccess(result.user);
            }
        } else {
            setError(result.message);
        }
    };



    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="mb-8">
                <Logo onNavigate={onNavigate} />
            </div>

            <div className="max-w-md w-full space-y-4 bg-surface p-8 rounded-lg shadow-xl border border-gray-200">
                {/* Quick Login Buttons for Testing */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => { setFormData({ email: 'ana@administrador.cl', password: '123' }); setTimeout(() => document.getElementById('login-btn')?.click(), 100); }}
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-xs font-bold py-2 rounded transition-colors text-center"
                    >
                        Admin
                    </button>
                    <button
                        type="button"
                        onClick={() => { setFormData({ email: 'gaby@gratis.cl', password: '123' }); setTimeout(() => document.getElementById('login-btn')?.click(), 100); }}
                        className="bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold py-2 rounded transition-colors text-center"
                    >
                        Colab
                    </button>
                    <button
                        type="button"
                        onClick={() => { setFormData({ email: 'pia@premium.cl', password: '123' }); setTimeout(() => document.getElementById('login-btn')?.click(), 100); }}
                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-bold py-2 rounded transition-colors text-center"
                    >
                        Cliente
                    </button>
                    <button
                        type="button"
                        onClick={() => { setFormData({ email: 'ely@empresa.cl', password: '123' }); setTimeout(() => document.getElementById('login-btn')?.click(), 100); }}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold py-2 rounded transition-colors text-center"
                    >
                        Empresa
                    </button>
                </div>
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-text-primary font-serif">Inicia sesión</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                        Accede a tu cuenta de CiPress
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded" role="alert">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="rounded-md shadow-sm space-y-4">
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
                                autoComplete="current-password"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Ingresa tu contraseña"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary hover:text-orange-600">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            id="login-btn"
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg transition-colors duration-200"
                        >
                            Ingresar ahora
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-text-secondary">
                            ¿No tienes una cuenta?{' '}
                            <button
                                type="button"
                                onClick={() => onNavigate('register')}
                                className="font-medium text-primary hover:text-orange-600"
                            >
                                Regístrate aquí
                            </button>
                        </p>
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

export default LoginPage;
