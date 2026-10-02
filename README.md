<div align="center">

  # CiPress

### Círculo de Periodistas Emprendedores e Innovadores de Chile

  [![Status](https://img.shields.io/badge/Status-En_Desarrollo-orange.svg)](#)
  [![Python](https://img.shields.io/badge/Backend-Flask-green)](https://flask.palletsprojects.com/)
  [![React](https://img.shields.io/badge/Frontend-React_19-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](#)
  [![SQLite](https://img.shields.io/badge/Database-SQLite-lightgrey)](#)

</div>

---

## 📌 Descripción

**CiPress** es una plataforma web colaborativa tipo ecosistema diseñada para fortalecer el periodismo independiente en Chile. Integra publicaciones editoriales, fotoperiodismo, mercado laboral y asistencia de inteligencia artificial generativa en un único entorno digital.

El proyecto se construye sobre una arquitectura fullstack desacoplada: **React 19 con TypeScript y Vite** en el frontend, y **Flask con SQLAlchemy y SQLite** en el backend, siguiendo el patrón MVC con un modelo relacional de más de 25 entidades.

---

## ⚙️ Alcance y Módulos

CiPress funciona como un hub integral que incluye los siguientes componentes:

* **📰 Portal Editorial:** Portada inteligente con algoritmo de rotación horaria de contenidos y publicaciones de análisis periodístico.
* **📸 Fotoperiodismo:** Marketplace fotográfico con marcas de agua dinámicas, galerías profesionales y licencias de uso.
* **💼 Mercado Laboral:** Bolsa de trabajo especializada, banco de talentos con perfiles profesionales y matchmaking semántico.
* **🤖 Asistente IA:** Microservicios de inteligencia artificial generativa (API Gemini) para redacción asistida, revisión de perfiles y matchmaking laboral.
* **💳 Suscripciones:** Sistema de membresías (Free, Premium, Corporativo) con pasarela de pagos Flow integrada.
* **👥 Comunidad:** Foros de actividad, colaboraciones urgentes, directorio de fuentes especializadas y avisos clasificados.
* **🔐 Control de Acceso:** Sistema RBAC (Role-Based Access Control) con paneles diferenciados por rol de usuario.

---

## 🛠️ Guía de Instalación y Ejecución Local

### 1. Requisitos Previos

* **Python 3.8** o superior.
* **Node.js 18** o superior (incluye npm).
* **Git**.

### 2. Clonar el Repositorio

```bash
git clone https://github.com/Benjamin-Duoc/CAPSTONEV2.git
cd CAPSTONEV2
```

### 3. Configuración del Backend (Flask)

1.  Navega a la carpeta del backend:
    ```bash
    cd backend
    ```

2.  Crea un entorno virtual:
    ```bash
    python -m venv .venv
    ```

3.  Activa el entorno virtual:
    *   **Linux/Mac:** `source .venv/bin/activate`
    *   **Windows:** `.venv\\Scripts\\activate`

4.  Instala las dependencias:
    ```bash
    pip install -r requirements.txt
    ```

5.  Crea un archivo `.env.development` con las variables necesarias:
    ```
    FLASK_ENV=development
    FLASK_DEBUG=True
    SECRET_KEY=dev-key-cipress
    HOST=0.0.0.0
    PORT=5000
    CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
    MEDIA_FOLDER=media
    UPLOAD_FOLDER=media/uploads
    ```

6.  Inicializa la base de datos:
    ```bash
    python create-db.py
    ```

7.  Ejecuta el servidor:
    ```bash
    python run.py
    ```
    El servidor iniciará en `http://localhost:5000`.

### 4. Configuración del Frontend (React)

1.  Abre una **nueva** terminal. Navega a la carpeta del frontend:
    ```bash
    cd project
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Inicia la aplicación:
    ```bash
    npm run dev
    ```

4.  Abre tu navegador en: [http://localhost:3000](http://localhost:3000)

---

## 🔧 Solución de Problemas Comunes

| Problema | Solución |
| :--- | :--- |
| **Backend no inicia** | Verifica que tengas Python instalado y el entorno virtual activado. Instala dependencias con `pip install -r requirements.txt`. |
| **Error de conexión Frontend** | Asegúrate de que el backend esté corriendo en el puerto 5000 y que el proxy esté configurado en `vite.config.ts`. |
| **Base de datos bloqueada** | Si usas SQLite, asegúrate de no tener múltiples instancias del backend corriendo. |
| **Error al crear la BD** | Ejecuta `python create-db.py` desde la carpeta `backend/` con el entorno virtual activado. |

---

## 📂 Estructura del Proyecto

```
CAPSTONEV2/
├── Fase 1/                    # Documentación evaluada (Definición de Proyecto APT)
├── backend/                   # Servidor Flask (API REST)
│   ├── app/
│   │   ├── models/            # Modelos SQLAlchemy (25+ entidades)
│   │   ├── routes/            # Endpoints API (Blueprints)
│   │   ├── schemas/           # Esquemas Marshmallow
│   │   ├── services/          # Lógica de negocio (CRUD genérico)
│   │   ├── config.py          # Configuración multi-entorno
│   │   └── extensions.py      # Instancias de extensiones
│   ├── create-db.py           # Script de inicialización de BD
│   ├── run.py                 # Punto de entrada del servidor
│   └── requirements.txt       # Dependencias Python
├── project/                   # Frontend React + TypeScript + Vite
│   ├── components/            # Componentes React
│   ├── utils/                 # Utilidades (API client, media helpers)
│   ├── data/                  # Datos mock para desarrollo
│   ├── assets/                # Imágenes y recursos estáticos
│   ├── App.tsx                # Componente raíz
│   ├── index.tsx              # Punto de entrada React
│   └── types.ts               # Definiciones TypeScript
└── .gitignore
```

---

## 👥 Equipo de Desarrollo

| Nombre | Rol en el Proyecto |
| :--- | :--- |
| **Benjamín Morales Opazo** | Product Owner / Developer (Backend, Modelos, IA) |
| **Sergio Martín** | Scrum Master / Developer (Frontend, UI, Testing) |

---

## 📋 Metodología

El proyecto se desarrolla utilizando la metodología ágil **Scrum**, estructurada en un Sprint 0 de configuración seguido de 3 Sprints de desarrollo, dentro de un plazo de 18 semanas académicas.

---

## 📜 Licencia

Este repositorio es de carácter **académico y experimental**.
Los contenidos, marca y lineamientos editoriales pertenecen exclusivamente a **CiPress**.

**© 2026 - Círculo de Periodistas Emprendedores e Innovadores de Chile.** Todos los derechos reservados.
