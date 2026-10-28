<div align="center">

  # CiPress

### Círculo de Periodistas Emprendedores e Innovadores de Chile
Plataforma Web Colaborativa para el Periodismo Independiente, Fotoperiodismo y Asistencia IA

  [![Status](https://img.shields.io/badge/Status-Fase%202%20(Semanas%209--11)-orange.svg)](#)
  [![Python](https://img.shields.io/badge/Backend-Flask%203.x-green)](https://flask.palletsprojects.com/)
  [![React](https://img.shields.io/badge/Frontend-React%2019-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-blue)](#)
  [![Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20API-8e7cc3)](https://aistudio.google.com/)
  [![Flow](https://img.shields.io/badge/Payments-Flow%20Chile-00a884)](https://www.flow.cl/)
  [![Database](https://img.shields.io/badge/Database-SQLite%20%2F%20SQLAlchemy%20(3FN)-lightgrey)](#)

</div>

---

## 📌 Descripción del Proyecto

**CiPress** es una plataforma web integral tipo ecosistema diseñada para profesionalizar, monetizar y fortalecer el periodismo independiente en Chile. La solución unifica en un único entorno digital la publicación editorial estructurada, un marketplace de fotoperiodismo con derechos protegidos, un mercado laboral con banco de talentos y herramientas de asistencia editorial impulsadas por **Inteligencia Artificial Generativa**.

El sistema está construido bajo una **arquitectura desacoplada fullstack**:
* **Frontend:** Single Page Application (SPA) desarrollada en **React 19** con **TypeScript**, empaquetada mediante **Vite** y estilizada con **Tailwind CSS**.
* **Backend:** API REST modular construida en **Python 3.12** con **Flask** mediante la arquitectura de *Blueprints*, persistencia relacional con **SQLAlchemy ORM** en Tercera Forma Normal (3FN) con 18 modelos y más de 25 tablas/formularios de gobierno administrativo.
* **Inteligencia Artificial:** Microservicio de asistencia periodística conectado a **Google Gemini API**, acelerado con una capa de **caché criptográfica SHA-256 en memoria** y respaldado por un motor heurístico local para garantizar continuidad operativa sin fallos.
* **Pasarela de Pagos:** Integración transaccional con **Flow** (Webpay Plus / Tarjetas) con firma HMAC SHA-256 y webhooks asíncronos para la gestión de suscripciones Premium.

---

## ⚙️ Alcance y Módulos del Ecosistema

1. **📰 Portal Editorial y Portada Inteligente:** Algoritmo horario de rotación *"Prime Time"* (08:00 a 12:00 hrs) que prioriza contenidos de alta relevancia e investigaciones de miembros Premium.
2. **✍️ Sala de Prensa y Editor de Bloques:** Entorno de redacción modular para periodistas con bloques de texto, citas destacadas, epígrafes y asistencia de redacción inteligente integrada.
3. **📸 Fotoperiodismo y Marketplace Visual:** Publicación y venta de fotografías con inyección automática de marcas de agua digitales (Watermarking) para proteger los derechos de autor antes del licenciamiento comercial.
4. **💼 Mercado Laboral y Banco de Talentos:** Directorio filtrable de periodistas y fotoperiodistas por especialidad, región y experiencia, con destaque visual prioritario para usuarios con membresía activa.
5. **🤖 Asistente Editorial con IA (CiPress IA):** Módulo flotante contextual que asiste en reescritura periodística, corrección de estilo, cambio de tono noticioso, traducción multilingüe y generación de pies de foto.
6. **💳 Sistema de Suscripciones y Pagos:** Planes diferenciados (Gratuito, Colaborador Premium y Empresa) gestionados a través de la pasarela bancaria chilena Flow.
7. **🔐 Control de Acceso Basado en Roles (RBAC):** Cinco roles diferenciados (*Administrador, Cliente, Colaborador Premium, Colaborador Gratis y Empresa*) con vistas, privilegios y dashboards adaptados.
8. **🏛️ Consola de Gobierno y Administración:** Panel central con acceso y auditoría a las tablas maestras de datos de todo el ecosistema.

---

## 🛠️ Guía de Instalación y Ejecución Local

### 1. Requisitos Previos

* **Python 3.10** o superior (recomendado Python 3.12).
* **Node.js 18** o superior (incluye `npm`).
* **Git**.
* *(Opcional pero recomendado)* Una API Key gratuita de **Google AI Studio** para habilitar las funciones de IA en vivo con Gemini.

---

### 2. Clonar el Repositorio

```bash
git clone https://github.com/Benjamin-Duoc/CAPSTONEV2.git
cd CAPSTONEV2
```

---

### 3. Configuración y Ejecución del Backend (Flask)

1. **Navega a la carpeta del backend:**
   ```bash
   cd backend
   ```

2. **Crea y activa un entorno virtual:**
   * **En Windows (PowerShell / CMD):**
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
   * **En Linux / macOS:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Instala las dependencias del servidor:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configura las variables de entorno:**
   Copia el archivo de ejemplo `.env.example` creando un nuevo archivo llamado `.env` dentro de la carpeta `backend/`:
   ```bash
   # En Windows PowerShell:
   Copy-Item .env.example .env

   # En Linux / Mac:
   cp .env.example .env
   ```
   Abre el archivo `.env` y define tu clave de Google Gemini (ver sección de IA más abajo):
   ```env
   GEMINI_API_KEY=tu_api_key_de_google_ai_studio_aqui
   FLASK_ENV=development
   FLASK_DEBUG=True
   SECRET_KEY=dev-key-cipress
   PORT=5000
   HOST=0.0.0.0
   FRONTEND_URL=http://127.0.0.1:3000
   BACKEND_URL=http://127.0.0.1:5000
   ```

5. **Inicializa y puebla la base de datos con datos de prueba:**
   ```bash
   python create-db.py
   ```
   *(Este comando creará la base de datos SQLite en `backend/instance/` con 18 modelos, roles y cuentas predeterminadas).*

6. **Inicia el servidor Flask:**
   ```bash
   python run.py
   ```
   El servidor quedará escuchando en `http://127.0.0.1:5000`.

---

### 4. Configuración y Ejecución del Frontend (React + Vite)

1. **Abre una nueva terminal**, entra a la carpeta del frontend:
   ```bash
   cd project
   ```

2. **Instala los paquetes de Node.js:**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador en:** [http://localhost:3000](http://localhost:3000)

---

## 👥 Cuentas de Acceso Preconfiguradas para Pruebas

El script de población (`create-db.py`) deja habilitados los siguientes usuarios de demostración (todos comparten la contraseña **`123`**):

| Rol en el Sistema | Correo Electrónico | Contraseña | Capacidades Principales |
| :--- | :--- | :---: | :--- |
| **Administrador** | `ana@administrador.cl` | `123` | Control total del sitio, moderación de usuarios y consola de gobierno de 25 tablas. |
| **Colaborador Premium** | `premium@colab.com` | `123` | Publicación en Sala de Prensa con prioridad *Prime Time*, IA ilimitada y destaque en Banco de Talentos. |
| **Colaborador Gratis** | `gratis@colab.com` | `123` | Publicación de comunicados estándar y galerías fotográficas en marketplace. |
| **Cliente Corporativo** | `vip@cliente.com` | `123` | Edición del perfil corporativo y visualización destacada en el carrusel de portada. |
| **Empresa Auspiciadora** | `ely@empresa.cl` | `123` | Búsqueda y contratación en Banco de Talentos y publicación de avisos comerciales. |

---

## 🤖 Guía de Uso del Asistente de Inteligencia Artificial (CiPress IA)

CiPress incorpora un asistente editorial impulsado por modelos avanzados de lenguaje de **Google Gemini**, diseñado específicamente para agilizar la labor de reporteros y comunicadores.

### 1. ¿Cómo se hace funcionar? (Puesta en Marcha)

1. **Obtener tu API Key gratuita:**
   * Ingresa a [Google AI Studio](https://aistudio.google.com/app/apikey) con cualquier cuenta de Google.
   * Haz clic en **"Create API key"** y copia la clave generada.
2. **Ingresar la clave en el Backend:**
   * Abre el archivo `backend/.env`.
   * Pega tu clave en la variable:
     ```env
     GEMINI_API_KEY=AIzaSy...tu_clave_real...
     ```
3. **Reiniciar el servidor Backend:**
   * Detén el backend (`Ctrl + C`) y vuelve a ejecutar `python run.py`.
4. **Verificación visual:**
   * Al abrir cualquier formulario con el asistente, verás un indicador de estado que confirma la conexión con Gemini (`✓ IA Gemini`).
   * **Continuidad asegurada (Modo Offline / Respaldo Local):** Si no ingresas una clave o trabajas sin conexión a internet, el sistema no se cae; activa automáticamente el motor heurístico local (`cipress_local_engine`), permitiendo seguir usando las opciones de reformulación de forma offline.

---

### 2. ¿Dónde se encuentra disponible en la plataforma?

El asistente aparece como un **botón flotante contextual** (ícono de destello ✨ / IA) ubicado a un costado de los campos de texto en:
* **Sala de Prensa:** Al redactar el Título, Bajada o Cuerpo principal de un comunicado de prensa.
* **Marketplace de Fotoperiodismo:** En el módulo *"Subir Fotografías"* o *"Mis Galerías"*, para redactar descripciones de colecciones y pies de foto.
* **Consola de Administración:** En los editores de contenido editorial y artículos destacados.

---

### 3. ¿Qué funciones se pueden realizar?

Al hacer clic en el botón flotante del asistente, se despliega un panel interactivo y no intrusivo con las siguientes capacidades:

#### A. Acciones Rápidas con un Clic
* **Mejorar redacción:** Eleva el estilo, fluidez y elocuencia periodística manteniendo la veracidad informativa.
* **Corregir ortografía y gramática:** Limpieza exhaustiva de puntuación, tildes y concordancia sintáctica sin alterar el mensaje.
* **Simplificar texto:** Transforma párrafos complejos o técnicos en un lenguaje directo y comprensible para todo público.
* **Alargar / Desarrollar:** Expande notas sueltas o viñetas aportando mayor contexto explicativo y riqueza periodística.
* **Acortar / Sintetizar:** Resume el contenido en un formato ágil y directo estilo pirámide invertida.
* **Continuar redacción:** Sugiere la continuación lógica del siguiente párrafo a partir de lo que ya has escrito.

#### B. Modificación de Tono Editorial
Permite reescribir instantáneamente el texto adaptándolo a la línea editorial requerida:
* **Noticioso:** Objetivo, neutral y enfocado en hechos concretos.
* **Formal:** Institucional, riguroso y corporativo.
* **Investigativo:** Crítico, analítico y sustentado en evidencia.
* **Urgente (Última hora):** Dinámico, directo y de alto impacto informativo.
* **Cercano:** Empático, narrativo y divulgativo.

#### C. Traducción Periodística Multilingüe
Traduce el texto seleccionado conservando el registro y la fluidez periodística a:
* **Inglés**, **Francés**, **Portugués**, **Alemán**, **Italiano**, entre otros idiomas.

#### D. Creación de Pies de Foto y Etiquetas (Marketplace)
* **Epígrafe / Pie de foto:** Genera automáticamente un pie de foto descriptivo y periodístico basado en el contexto de la imagen subida.
* **Etiquetas periodísticas:** Sugiere entre 5 y 7 palabras clave para categorizar noticias o fotografías.

#### E. Peticiones Personalizadas (Prompt Libre)
Si necesitas una instrucción a medida, puedes hacer clic en el campo expandible de consulta personalizada para ingresar solicitudes como:
* *"Transforma estas declaraciones en una cita destacada con estilo narrativo"*.
* *"Redacta un titular de máximo 10 palabras enfocado en la cifra de empleo"*.
* O generar un borrador completo desde cero a partir de tres puntos clave.

---

### 4. Arquitectura de Optimización: Caché SHA-256

Para optimizar el uso de cuotas gratuitas de Google Gemini (límite de peticiones por minuto) y brindar una experiencia inmediata:
* El backend calcula un hash criptográfico **SHA-256** determinista combinando `[acción + tono + idioma + texto normalizado]`.
* Si la solicitud ya fue generada previamente (dentro de un TTL de 24 horas), la respuesta se entrega en **menos de 4 milisegundos** directamente desde la memoria caché, mostrando la insignia `⚡ Caché` en la interfaz.

---

## 📂 Estructura del Proyecto

```
CAPSTONE/
├── Fase 1/                               # Entregables oficiales de Fase 1 (Definición y Arquitectura)
├── Fase 2/                               # Entregables oficiales de Fase 2 (Semanas 9 a 11)
│   ├── 2.1_APT122_DiarioReflexionFase2-Benjamin.docx         # Diario de reflexión individual
│   ├── 2.1_APT122_DiarioReflexionFase2-Sergio.docx           # Diario de reflexión individual
│   ├── 2.4_GuiaEstudiante_Fase 2_DesarrolloProyecto APT.docx  # Guía de avance y evidencias con capturas
│   ├── 2.6_GuiaEstudiante_Fase 2_Informe Final Proyecto APT.docx # Informe técnico integral de Fase 2
│   ├── Casos de uso CU/                                      # Especificación y modelado visual UML 2.5
│   │   ├── Casos de Uso Actuales CiPress.docx                # Documento formal con diagramas y matrices
│   │   ├── diagrama_general_casos_de_uso.png                 # Diagrama general UML (Límites y actores)
│   │   ├── diagrama_secuencia_cu01_ia.png                    # Diagrama de secuencia Asistente IA + Caché
│   │   └── diagrama_secuencia_cu03_flow.png                  # Diagrama de secuencia Pagos Flow Webhook
│   └── Modelo 4+1 4mas1/                                     # Modelo Arquitectónico de Vistas 4+1 (Kruchten)
│       ├── Modelo_Arquitectonico_4_Mas_1_CiPress.docx        # Documento formal de las 5 vistas
│       ├── Modelo_4+1.jpg                                    # Infografía conceptual central
│       └── diagrama_modelo_4mas1_subsistemas.png             # Diagrama de subsistemas en 3 capas
├── backend/                              # Servidor API REST (Python 3.12 + Flask 3.x)
│   ├── app/
│   │   ├── models/                       # 18 Entidades normalizadas en 3FN (SQLAlchemy)
│   │   ├── routes/                       # Blueprints modulares (Auth, Editorial, IA, Flow, Admin)
│   │   ├── services/                     # Lógica de negocio (ai_service.py, ai_cache.py, generic_service.py)
│   │   ├── config.py                     # Configuración multi-entorno
│   │   └── extensions.py                 # Instancias de SQLAlchemy, CORS, Marshmallow
│   ├── instance/                         # Base de datos relacional local SQLite (cipress.db)
│   ├── media/                            # Almacenamiento local de fotografías y marcas de agua
│   ├── .env.example                      # Plantilla de variables de entorno (Gemini, Flow, Flask)
│   ├── create-db.py                      # Script de inicialización y población de datos de prueba
│   ├── run.py                            # Punto de entrada para ejecución local
│   └── requirements.txt                  # Dependencias de Python
├── project/                              # Frontend SPA (React 19 + TypeScript + Vite)
│   ├── components/                       # Componentes modulares de interfaz
│   │   ├── ai/                           # Componente AIWritingAssistant.tsx flotante e interactivo
│   │   ├── dashboard/                    # Vistas de gestión por perfil (MisGaleriasView, SalaPrensa)
│   │   └── admin/                        # Vistas y formularios del panel de gobierno central
│   ├── utils/                            # Utilidades de consumo API (aiClient.ts, api.ts)
│   ├── App.tsx                           # Enrutamiento principal y orquestación de vistas
│   ├── vite.config.ts                    # Configuración de Vite y proxy local (puerto 3000 -> 5000)
│   └── types.ts                          # Definiciones estrictas de TypeScript
└── README.md                             # Documentación general del repositorio
```

---

## 🔧 Solución de Problemas Comunes

| Síntoma / Problema | Causa Probable | Solución Recomendada |
| :--- | :--- | :--- |
| **Error `Address already in use: 5000`** | Hay una instancia previa de Flask ejecutándose en segundo plano. | En Windows abre el Administrador de Tareas y finaliza los procesos `python.exe`, o ejecuta `netstat -ano \| findstr :5000` y termina el PID con `taskkill /PID <pid> /F`. |
| **Error `429 Too Many Requests` en IA** | Se superó el límite de la capa gratuita de Google Gemini (15 peticiones por minuto). | Espera 20 segundos para reintentar. El sistema activa automáticamente la caché SHA-256 para no consumir cuotas en consultas repetidas. |
| **El asistente muestra `Motor Local` en vez de `Gemini`** | No se ha configurado la variable `GEMINI_API_KEY` en `backend/.env`. | Abre `backend/.env`, agrega tu clave de [Google AI Studio](https://aistudio.google.com/app/apikey) y reinicia `python run.py`. |
| **El Frontend no conecta con el Backend** | El backend no está corriendo en el puerto 5000 o hay un problema de proxy. | Verifica que la terminal del backend muestre `Running on http://127.0.0.1:5000` antes de iniciar `npm run dev`. |
| **Base de datos bloqueada (`database is locked`)** | Acceso concurrente en SQLite por múltiples terminales abiertas. | Cierra instancias duplicadas del backend y vuelve a ejecutar `python run.py`. |

---

## 👥 Equipo de Trabajo

| Integrante | Rol en el Proyecto | Dedicación |
| :--- | :--- | :---: |
| **Sergio Martín** | Scrum Master / Frontend Lead & UI Developer / Testing QA | 50% |
| **Benjamín Morales Opazo** | Product Owner / Backend Architect / Modelado de Datos e IA | 50% |

---

## 📋 Metodología y Estado del Cronograma

El proyecto sigue el marco de trabajo ágil **Scrum** adaptado a un ciclo de 18 semanas académicas.
* **Fase 1 (Semanas 1 a 8):** Sprint 0 (Arquitectura base desacoplada y prototipo conceptual). *(Completada y aprobada).*
* **Fase 2 (Semanas 9 a 11):** Sprints 1 y 2 (Portal editorial, marketplace de imágenes, pasarela Flow, roles RBAC y prototipo funcional avanzado del Asistente IA). *(Hito actual en evaluación).*
* **Fase 3 (Semanas 12 a 18):** Sprint 3 (Matchmaking semántico, visión multimodal para fotoperiodismo y optimización para despliegue productivo).

---

## 📜 Licencia y Propiedad Intelectual

Este repositorio es de carácter **académico y experimental** desarrollado para la asignatura de Proyecto Capstone (APT122) de Duoc UC.
Todos los derechos sobre la marca, identidad visual y contenidos pertenecen al **Círculo de Periodistas Emprendedores e Innovadores de Chile (CiPress)**.

**© 2026 - CiPress Chile.** Todos los derechos reservados.
