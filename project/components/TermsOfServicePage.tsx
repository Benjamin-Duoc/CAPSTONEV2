import React from 'react';
import type { Page } from '../types';

interface TermsOfServicePageProps {
    onNavigate: (page: Page) => void;
}

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onNavigate }) => {
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
                    <h1 className="text-4xl font-bold font-serif text-text-primary">Términos y Condiciones de Servicio</h1>
                    <p className="lead">Última actualización: 26 de Julio, 2024</p>
                    
                    <h2>1. Aceptación de los Términos</h2>
                    <p>Al acceder y utilizar el sitio web del Círculo de Periodistas Emprendedores e Innovadores de Chile ("CiPress"), aceptas y estás de acuerdo con estar sujeto a los términos y disposiciones de este acuerdo. Si no estás de acuerdo con alguna parte de los términos, no puedes acceder al servicio.</p>
                    
                    <h2>2. Uso del Sitio Web</h2>
                    <p>Este sitio y sus componentes se ofrecen únicamente con fines informativos; este sitio no se hace responsable de la exactitud, utilidad o disponibilidad de cualquier información que se transmita o ponga a disposición a través del mismo; no será responsable por cualquier error u omisión en dicha información.</p>

                    <h2>3. Cuentas de Usuario</h2>
                    <p>Para acceder a algunas funciones del sitio, es posible que debas registrarte para obtener una cuenta. Al registrarte, aceptas proporcionar información precisa, actual y completa sobre ti. Eres responsable de salvaguardar la contraseña que utilizas para acceder al servicio y de cualquier actividad o acción bajo tu contraseña.</p>
                    
                    <h2>4. Contenido del Usuario</h2>
                    <p>Permitimos a los usuarios publicar, enlazar, almacenar, compartir y de otra manera hacer disponible cierta información, texto, gráficos u otro material ("Contenido"). Eres responsable del Contenido que publicas en el servicio, incluida su legalidad, fiabilidad y adecuación. Al publicar Contenido en el servicio, nos otorgas el derecho y la licencia para usar, modificar, ejecutar públicamente, mostrar públicamente, reproducir y distribuir dicho Contenido en y a través del servicio.</p>

                    <h2>5. Propiedad Intelectual</h2>
                    <p>El servicio y su contenido original (excluyendo el Contenido proporcionado por los usuarios), características y funcionalidad son y seguirán siendo propiedad exclusiva de CiPress y sus licenciantes. El servicio está protegido por derechos de autor, marcas registradas y otras leyes de Chile y países extranjeros.</p>

                    <h2>6. Limitación de Responsabilidad</h2>
                    <p>En ningún caso CiPress, ni sus directores, empleados, socios, agentes, proveedores o afiliados, serán responsables por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo, sin limitación, la pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes de (i) tu acceso o uso o incapacidad para acceder o usar el servicio; (ii) cualquier conducta o contenido de cualquier tercero en el servicio.</p>

                    <h2>7. Modificaciones a los Términos</h2>
                    <p>Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que los nuevos términos entren en vigor. Lo que constituye un cambio material se determinará a nuestra sola discreción.</p>

                    <h2>8. Contacto</h2>
                    <p>Si tienes alguna pregunta sobre estos Términos, por favor contáctanos en <a href="mailto:contacto@cipress.cl" className="text-primary hover:underline">contacto@cipress.cl</a>.</p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfServicePage;