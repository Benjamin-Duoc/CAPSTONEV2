# 🎓 Guía Maestra de Estudio Técnico: Sistema CiPress V2
**Proyecto Capstone (APT122) — Duoc UC**  
**Autores:** Benjamín Morales Opazo (Backend & IA Lead) | Sergio Martín (Frontend & UI/UX Lead)  
**Fecha:** Noviembre 2026  

---

## 1. Visión y Propósito del Sistema
CiPress resuelve la precarización, dispersión de herramientas y falta de soberanía económica del periodista y fotoperiodista independiente en Chile mediante:
1. **CMS Editorial:** Publicación estructurada con rotación horaria **Prime Time (08:00 a 12:00 hrs)** para dar visibilidad equitativa a profesionales independientes.
2. **Marketplace Fotográfico:** Catálogo protegido con **marcas de agua dinámicas** generadas en el backend y enlace de compra/WhatsApp.
3. **Monetización Local:** Pasarela chilena **Flow (Webpay Plus)** con firmas HMAC-SHA256 para venta de fotos en alta resolución y suscripciones.
4. **Inteligencia Artificial Multimodal:** Asistente de redacción y visión computacional (Google Gemini 1.5 Flash) para catalogación automática de fotos en Base64, respaldado por una **caché SHA-256 en memoria (<15ms)** y un **motor de fallback local** que garantiza resiliencia si no hay internet o cuota de API.

---

## 2. Mapa Arquitectónico de Archivos Más Relevantes

### 🔹 Capa Backend (`backend/`)

| Archivo | Rol Técnico | ¿Por qué existe y qué hace? |
| :--- | :--- | :--- |
| **`run.py`** | Punto de Entrada | Inicia el servidor Flask. Muestra el banner informativo en desarrollo y expone el objeto `app` a nivel de módulo para despliegues con Passenger/cPanel en producción. |
| **`app/__init__.py`** | Application Factory | Crea la app con `create_app(config_class)`. Inicializa SQLAlchemy y Marshmallow, configura CORS, sirve la carpeta `/media` y registra los Blueprints especializados y el generador de rutas CRUD. |
| **`app/config.py`** | Jerarquía de Configuración | Centraliza variables de entorno (`DevelopmentConfig`, `ProductionConfig`, `TestingConfig`). `TestingConfig` usa SQLite en memoria (`sqlite:///:memory:`) para pruebas rápidas y aisladas. |
| **`app/extensions.py`** | Desacoplamiento de Plugins | Instancia `db = SQLAlchemy()` y `ma = Marshmallow()` de forma aislada, evitando el error de importaciones circulares en Python. |
| **`app/models/all_models.py`** | Modelos Relacionales (3FN) | Define las 25 tablas maestras: `User`, `Role` (RBAC), `PressRelease`, `NewsArticle`, `PhotojournalismPost`, `ShareablePhoto`, `TalentProfile`, `SponsoredAd`, etc., todas normalizadas en 3FN. |
| **`app/services/ai_service.py`** | Motor de IA y Resiliencia | Conecta con Google Gemini (familia Flash) para redacción y análisis de fotos en Base64. Cuenta con **motor heurístico local de respaldo** (`cipress_local_fallback`) para evitar caídas ante fallos de red o cuota. |
| **`app/services/ai_cache.py`** | Caché Criptográfica | Calcula hashes SHA-256 de las consultas de IA y las guarda en memoria RAM para responder en menos de 15 milisegundos sin consumir cuota. |
| **`app/routes/route_factory.py`** | CRUD Factory (DRY) | Genera automáticamente los 5 endpoints REST (`GET`, `POST`, `PUT`, `DELETE`, `GET /<id>`) para más de 20 entidades maestras, ahorrando más de 1.000 líneas de código repetitivo. |
| **`app/routes/upload_routes.py`** | Subida Segura y Watermark | Valida archivos contra una lista blanca (`.png`, `.jpg`, `.jpeg`, `.webp`), sanitiza nombres con `secure_filename` (anti Path Traversal) y genera marcas de agua digitales con Pillow. |
| **`app/routes/payment_routes.py`** | Pasarela de Pagos Flow | Crea órdenes firmadas criptográficamente con HMAC-SHA256 hacia la API de Flow (Webpay) y escucha webhooks de confirmación. |
| **`backend/tests/`** | Suite de QA (Pytest) | Contiene 12 pruebas automatizadas en 3 niveles (Unitarias, Seguridad e Integración) con **100% de tasa de aprobación (12/12 passed)**. |

---

### 🔹 Capa Frontend (`project/`)

| Archivo | Rol Técnico | ¿Por qué existe y qué hace? |
| :--- | :--- | :--- |
| **`src/main.tsx` & `App.tsx`** | Raíz SPA y Enrutamiento | Monta React 19 en el DOM, maneja el estado de autenticación, el Navbar receptivo, el Footer y las rutas dinámicas. |
| **`src/components/common/CiPressModal.tsx`** | Sistema de Alertas UI | Reemplaza las alertas nativas del navegador (`alert()`) por modales accesibles y animados con tipografía y estilo corporativo. |
| **`src/views/HomeView.tsx`** | Portada y Prime Time | Vitrina pública. Implementa el algoritmo de rotación de 08:00 a 12:00 hrs para destacar contenidos independientes y muestra estadísticas del sitio. |
| **`src/views/MisGaleriasView.tsx`** | Workspace Fotoperiodístico | Permite a reporteros subir fotos, recortarlas, activar marcas de agua automáticas y ejecutar el escaneo visual de IA en un solo clic. |
| **`src/components/ai/JobMatchmakingModal.tsx`** | Matchmaking Laboral | Cruza ofertas de empleo con los perfiles profesionales de periodistas mediante similitud semántica. |
| **`src/views/AdminPanel.tsx`** | Consola de Administración | Permite a los administradores gestionar las 25 tablas maestras del sistema mediante interfaces tabulares dinámicas. |
| **`vite.config.ts`** | Empaquetador Vite 6 | Configuración de compilación ultra-rápida en módulos ES, proxy de comunicación hacia el backend y soporte Tailwind CSS. |

---

### 🔹 Capa de Infraestructura y Despliegue (`/`)

| Archivo | Rol Técnico | ¿Por qué existe y qué hace? |
| :--- | :--- | :--- |
| **`docker-compose.yml`** | Orquestador de Servicios | Levanta el backend (puerto 5000) y frontend (puerto 3000) en una red virtual aislada (`cipress-network`) con volúmenes persistentes para la BD y fotos. |
| **`backend/Dockerfile`** | Contenedor Backend | Imagen `python:3.12-slim` que instala dependencias y ejecuta automáticamente `create-db.py` si la base de datos no existe. |
| **`project/Dockerfile`** | Contenedor Frontend | Imagen `node:20-alpine` que compila e inicia Vite con `--host 0.0.0.0`. |
| **`run_tests.bat`** | Ejecutor de Pruebas en 1 Clic | Script por lotes que activa el entorno virtual y ejecuta los 12 casos de prueba de Pytest en menos de 10 segundos. |

---

## 3. Respuestas Rápidas para Preguntas Difíciles de los Profesores

1. **¿Por qué Flask y no Django o Express?**  
   *Flask es un microframework liviano que no impone dependencias innecesarias, permitiendo integrar fluidamente librerías de Inteligencia Artificial (Google GenAI, Pillow) y diseñar una arquitectura modular limpia por Blueprints.*

2. **¿Qué pasa si la IA de Google se cae durante la presentación?**  
   *El sistema cuenta con un motor heurístico local de resiliencia (`cipress_local_fallback`) y una caché en memoria SHA-256. La aplicación nunca se cae ni arroja error 500.*

3. **¿Cómo garantizan la seguridad frente a Inyección SQL y Uploads?**  
   *SQLAlchemy ORM usa consultas parametrizadas obligatorias (0% inyección SQL). Los uploads usan lista blanca estricta de extensiones (`png`, `jpg`, `jpeg`, `webp`), `secure_filename` contra Path Traversal y procesamiento con Pillow.*

4. **¿Por qué SQLite y cómo escala a producción?**  
   *SQLite ofrece portabilidad absoluta y cero configuración en Docker para el MVP. Como usamos SQLAlchemy ORM normalizado en 3FN, migrar a PostgreSQL en producción sólo requiere cambiar la URL de conexión en el archivo `.env`.*
