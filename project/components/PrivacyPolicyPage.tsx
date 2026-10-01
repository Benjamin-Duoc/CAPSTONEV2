import React from 'react';
import type { Page } from '../types';

interface PrivacyPolicyPageProps {
    onNavigate: (page: Page) => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
    return (
        <div className="bg-background animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={() => onNavigate('home')}
                    className="mb-8 inline-flex items-center text-primary font-semibold hover:underline"
                    aria-label="Volver a la página de inicio"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Volver
                </button>
                <div className="prose prose-lg max-w-4xl mx-auto text-text-secondary">
                    <h1 className="text-4xl font-bold font-serif text-text-primary">Política de Privacidad</h1>
                    <p className="lead">Última actualización: 26 de Julio, 2024</p>
                    
                    <h2>1. Introducción</h2>
                    <p>Bienvenido al Círculo de Periodistas Emprendedores e Innovadores de Chile ("CiPress", "nosotros", "nuestro"). Respetamos tu privacidad y nos comprometemos a proteger tus datos personales. Esta política de privacidad te informará sobre cómo cuidamos tus datos personales cuando visitas nuestro sitio web y te informará sobre tus derechos de privacidad y cómo la ley te protege.</p>
                    
                    <h2>2. Información que Recopilamos</h2>
                    <p>Podemos recopilar, usar, almacenar y transferir diferentes tipos de datos personales sobre ti, que hemos agrupado de la siguiente manera:</p>
                    <ul>
                        <li><strong>Datos de Identidad:</strong> incluye nombre, apellido, nombre de usuario o identificador similar.</li>
                        <li><strong>Datos de Contacto:</strong> incluye dirección de correo electrónico y números de teléfono.</li>
                        <li><strong>Datos Técnicos:</strong> incluye la dirección del protocolo de Internet (IP), tus datos de inicio de sesión, tipo y versión del navegador, configuración de zona horaria y ubicación, etc.</li>
                        <li><strong>Datos de Uso:</strong> incluye información sobre cómo utilizas nuestro sitio web, productos y servicios.</li>
                    </ul>

                    <h2>3. Cómo Usamos tu Información</h2>
                    <p>Usaremos tus datos personales solo cuando la ley nos lo permita. Generalmente, usaremos tus datos personales en las siguientes circunstancias:</p>
                    <ul>
                        <li>Para registrarte como nuevo usuario.</li>
                        <li>Para gestionar nuestra relación contigo, lo que incluirá notificarte sobre cambios en nuestros términos o política de privacidad.</li>
                        <li>Para administrar y proteger nuestro negocio y este sitio web (incluida la resolución de problemas, el análisis de datos, las pruebas, el mantenimiento del sistema, el soporte, la generación de informes y el alojamiento de datos).</li>
                    </ul>

                    <h2>4. Divulgación de tu Información</h2>
                    <p>No compartiremos tus datos personales con ninguna compañía fuera del grupo CiPress para fines de marketing. Es posible que tengamos que compartir tus datos personales con terceros de confianza para fines específicos, como proveedores de servicios que nos asisten en la operación de nuestro sitio web.</p>

                    <h2>5. Seguridad de los Datos</h2>
                    <p>Hemos implementado medidas de seguridad apropiadas para evitar que tus datos personales se pierdan accidentalmente, se usen o se acceda a ellos de forma no autorizada, se alteren o se divulguen. Además, limitamos el acceso a tus datos personales a aquellos empleados, agentes, contratistas y otros terceros que tienen una necesidad comercial de conocerlos.</p>

                    <h2>6. Tus Derechos Legales</h2>
                    <p>Bajo ciertas circunstancias, tienes derechos bajo las leyes de protección de datos en relación con tus datos personales, incluido el derecho a solicitar acceso, corrección, eliminación, restricción, transferencia, u oponerte al procesamiento.</p>

                    <h2>7. Contacto</h2>
                    <p>Si tienes alguna pregunta sobre esta política de privacidad, por favor contáctanos en <a href="mailto:contacto@cipress.cl" className="text-primary hover:underline">contacto@cipress.cl</a>.</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;