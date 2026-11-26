# ⏰ Algoritmo de Rotación Editorial y Vitrina Prime Time — CiPress

Este documento detalla la regla de negocio, la arquitectura técnica y el funcionamiento del algoritmo de rotación y vitrina **Prime Time** implementado en la plataforma **CiPress**.

---

## 1. 📌 Propósito y Modelo de Negocio

CiPress es una plataforma de apoyo y monetización para periodistas independientes y emprendedores de las comunicaciones en Chile. Dentro del modelo de negocio, existen dos perfiles de colaboradores periodísticos:

1. **Colaborador Premium:** Usuarios suscritos con membresía de pago que tienen derecho preferencial a las franjas horarias de mayor audiencia e impacto digital (*Prime Time*).
2. **Colaborador Gratis:** Usuarios con suscripción sin costo que pueden publicar notas y comunicados en la sala de prensa, garantizándoles una vitrina nocturna rotativa durante las franjas de menor tráfico (*Horarios Menos Vistos / Horario Valle*), así como presencia compartida en horarios intermedios.

---

## 2. 🕒 Regla de Negocio y Franjas Horarias

El sistema evalúa de manera automática y en tiempo real la hora local de cada solicitud para determinar qué tipo de contenido y qué rol de autor debe priorizarse en la portada principal (sección *"Periodistas en Acción"*):

| Franja Horaria | Clasificación Oficial | Prioridad de Visualización | Objetivo del Negocio |
| :--- | :--- | :--- | :--- |
| **08:00 a 12:00 hrs** | **Prime Time Mañana** (Alta Audiencia) | **100% Prioridad a Colaboradores Premium** (4 de 4 artículos) | Maximizar el retorno de inversión y la visibilidad de los suscriptores de pago durante el pico informativo matutino. |
| **18:00 a 22:00 hrs** | **Prime Time Tarde / Noche** (Alta Audiencia) | **100% Prioridad a Colaboradores Premium** (4 de 4 artículos) | Capturar la audiencia del cierre de jornada laboral y noticieros centrales. |
| **00:00 a 08:00 hrs** | **Horario Valle / Noche** (Menos Visto) | **100% Prioridad a Colaboradores Gratuitos** (4 de 4 artículos) | Vitrina rotativa nocturna para comunicadores gratuitos sin competir con las franjas comerciales. |
| **22:00 a 24:00 hrs** | **Horario Nocturno Tardío** (Menos Visto) | **100% Prioridad a Colaboradores Gratuitos** (4 de 4 artículos) | Espacio de exhibición para notas comunitarias y de corresponsalía local. |
| **12:00 a 18:00 hrs** | **Horario Regular / Intermedio** | **Rotación Equitativa (50% / 50%)**: 2 Premium y 2 Gratuitos | Vitrina mixta y equilibrada durante el horario diurno estándar. |

> **Nota de Resiliencia (*Fallback*):** Si en alguna franja no existe suficiente cantidad de artículos de un rol específico para completar los 4 espacios de portada, el backend complementa automáticamente con los artículos más recientes disponibles, asegurando que la grilla nunca quede vacía.

---

## 3. 🏗️ Arquitectura e Implementación Técnica

### A. Backend (`backend/app/routes/home_routes.py`)

El backend expone dos endpoints dedicados para la gestión del Prime Time:

1. **`GET /api/featured-content` (y alias `/featured-content`):**
   - Realiza un `outerjoin` entre la entidad `PressRelease` y `User`.
   - Evalúa `current_hour` (hora del servidor) o el parámetro de simulación `sim_hour`.
   - Aplica los filtros de rol (`User.role.ilike('%premium%')` vs `User.role.ilike('%gratis%')`).
   - Ordena cronológicamente en sentido descendente (`PressRelease.created_at.desc()`).
   - Devuelve exactamente 4 artículos serializados.

2. **`GET /api/featured-content/status` (y alias `/featured-content/status`):**
   - Entrega los metadatos operativos en formato JSON para que el frontend o herramientas de monitoreo conozcan el modo activo:
   ```json
   {
     "current_hour": 9,
     "is_prime_time": true,
     "is_off_peak": false,
     "mode": "prime_time",
     "label": "Prime Time Activo (08:00 - 12:00 / 18:00 - 22:00) · Prioridad Colaboradores Premium",
     "simulated": false
   }
   ```

3. **Soporte para Demostraciones y Auditoría (`?sim_hour=0..23`):**
   - Ambos endpoints aceptan el parámetro opcional `?sim_hour` para simular cualquier momento del día en vivo sin necesidad de cambiar la hora del sistema operativo.
   - Ejemplo: `GET /api/featured-content?sim_hour=9` (Fuerza Prime Time matutino).
   - Ejemplo: `GET /api/featured-content?sim_hour=2` (Fuerza Horario Valle nocturno).

---

### B. Serialización y Permisos (`backend/app/schemas/all_schemas.py`)

- **`PressReleaseSchema`:**
  - `author_role`: Resuelve e inyecta dinámicamente el rol del redactor (`Colaborador Premium`, `Colaborador Gratis`, etc.).
  - `is_public_visible`: Calcula el permiso de visibilidad pública del artículo según el rol del usuario y la ventana horaria nocturna autorizada.

---

### C. Base de Datos Relacional (`backend/create-db.py`)

La base de datos relacional SQLite (`instance/cipress.db`) cuenta con integridad referencial entre comunicados y usuarios:

* **Usuarios Premium Sembrados:**
  - `premium@colab.com` (Juan Premium - ID: 4)
  - `pia@premium.cl` (Pía Premium - ID: 5)
* **Usuarios Gratuitos Sembrados:**
  - `gratis@colab.com` (Pedro Gratis - ID: 6)
  - `gaby@gratis.cl` (Gaby Gratis - ID: 7)
* **Comunicados Iniciales:** 4 artículos de investigación redactados por los usuarios Premium y 4 artículos comunitarios/locales redactados por los usuarios Gratuitos.

---

### D. Frontend (`project/components/HomePage.tsx` & `types.ts`)

1. **Insignia de Modo Activo:**
   - En el encabezado de la sección *"Periodistas en Acción"*, un chip dinámico informa al lector el estado actual del algoritmo:
     - `★ Prime Time (08:00-12:00 / 18:00-22:00) · Colaboradores Premium` (Dorado brillante).
     - `🌙 Horario Valle · Vitrina Colaboradores Gratuitos` (Azul nocturno/Índigo).
     - `☀️ Horario Regular · Rotación Mixta` (Celeste claro).
2. **Identificación Visual por Tarjeta (`NewsCard`):**
   - Artículos Premium portan la etiqueta superior derecha `★ Prime Time`.
   - Artículos Gratuitos portan la etiqueta superior derecha `🌙 Colaborador`.
3. **Publicación Vinculada:**
   - Al redactar un nuevo comunicado a través del formulario de sala de prensa, se vincula automáticamente el `authorUserId` de la sesión activa (`currentUser.id`).
4. **Refresco Periódico Asíncrono:**
   - El frontend refresca automáticamente el contenido cada 60 segundos, permitiendo una transición suave entre franjas horarias sin requerir recargar la página manualmente.

---

## 4. 🧪 Guía de Pruebas y Verificación

### A. Simular Franja Prime Time (09:00 hrs)
```bash
# Vía PowerShell / cURL:
curl http://localhost:5000/api/featured-content?sim_hour=9
```
* **Resultado:** Se retornan únicamente comunicados con `author_role: "Colaborador Premium"`.

### B. Simular Franja Horario Valle / Noche (02:00 hrs)
```bash
curl http://localhost:5000/api/featured-content?sim_hour=2
```
* **Resultado:** Se retornan únicamente comunicados con `author_role: "Colaborador Gratis"`.

### C. Simular Franja Regular Intermedia (15:00 hrs)
```bash
curl http://localhost:5000/api/featured-content?sim_hour=15
```
* **Resultado:** Se retornan 2 comunicados de `Colaborador Premium` y 2 comunicados de `Colaborador Gratis`.

### D. Ejecución de la Suite de Pruebas Automatizadas
```bash
cd backend
.\.venv\Scripts\pytest
```
* Todos los tests unitarios (`test_press_release_model_creation`, `test_ai_service`, `test_security_and_uploads`, etc.) pasan con 100% de éxito (`12 passed`).
