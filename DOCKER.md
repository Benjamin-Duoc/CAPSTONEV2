# 🐳 Guía de Despliegue con Docker y Docker Compose — CiPress

Esta guía documenta la contenedorización del proyecto **CiPress** para desarrollo y despliegue rápido en cualquier equipo (por ejemplo, en el computador del trabajo o en una presentación) sin necesidad de instalar Python, Node.js ni configurar entornos virtuales locales manualmente.

---

## 📋 Requisitos Previos

En la máquina donde se va a ejecutar solo se necesita tener instalado:
* **Docker Desktop** (en Windows o macOS) con WSL2 activo, o **Docker Engine + Docker Compose** (en Linux).
* **Git** (para clonar el repositorio).

> [!NOTE]
> No necesitas tener Python ni Node.js instalados en el sistema operativo anfitrión; todo se ejecuta de manera aislada dentro de los contenedores Docker.

---

## 🚀 Despliegue Rápido en Otra Computadora (3 Pasos)

### Paso 1: Clonar el repositorio
Abre una terminal (PowerShell, CMD o Bash) y clona el proyecto:
```bash
git clone https://github.com/Benjamin-Duoc/CAPSTONEV2.git
cd CAPSTONEV2
```

### Paso 2: (Opcional) Configurar clave de Gemini
Si deseas que la Inteligencia Artificial responda en vivo a través de la API de Google Gemini en lugar del motor local de respaldo:
```bash
# En Windows PowerShell:
Copy-Item .env.example .env

# En Linux / macOS:
cp .env.example .env
```
Abre el archivo `.env` y coloca tu clave:
```env
GEMINI_API_KEY=AIzaSy...tu_clave_aqui...
```
*(Si no configuras ninguna clave, el sistema funcionará automáticamente con el motor heurístico local offline sin romperse).*

### Paso 3: Construir e iniciar los contenedores
Ejecuta el siguiente comando en la raíz del proyecto:
```bash
docker compose up --build
```

Docker descargará las imágenes base, compilará los contenedores del backend y frontend, inicializará la base de datos automáticamente y levantará los servicios.

---

## 🌐 URLs de Acceso

Una vez levantado:
* **Frontend (React 19 + Vite):** [http://localhost:3000](http://localhost:3000)
* **Backend API (Flask):** [http://localhost:5000](http://localhost:5000)
* **Estado de la IA:** [http://localhost:5000/api/ai/status](http://localhost:5000/api/ai/status)

---

## 👥 Cuentas de Acceso Preconfiguradas para Pruebas

La base de datos se inicializa automáticamente con los siguientes usuarios de prueba (todos comparten la contraseña **`123`**):

| Rol | Correo Electrónico | Contraseña | Capacidades |
| :--- | :--- | :---: | :--- |
| **Administrador** | `ana@administrador.cl` | `123` | Control total, consola de 25 tablas y gobierno del sitio |
| **Colaborador Premium** | `premium@colab.com` | `123` | Publicación Prime Time, suite de IA completa y marketplace |
| **Colaborador Gratis** | `gratis@colab.com` | `123` | Publicación de comunicados y galerías con cuota estándar |
| **Cliente Corporativo** | `vip@cliente.com` | `123` | Perfil corporativo y visualización en portada |
| **Empresa Auspiciadora** | `ely@empresa.cl` | `123` | Búsqueda en Banco de Talentos y avisos clasificados |

---

## 🛠️ Comandos Frecuentes

### 1. Iniciar en segundo plano (modo daemon)
```bash
docker compose up -d
```

### 2. Ver los logs en tiempo real
```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs solo del backend
docker compose logs -f backend

# Ver logs solo del frontend
docker compose logs -f frontend
```

### 3. Detener los contenedores
```bash
docker compose down
```

### 4. Reiniciar o repoblar la base de datos
Si necesitas reiniciar la base de datos a sus valores de fábrica:
```bash
docker compose exec backend python create-db.py
```

### 5. Acceder a la terminal dentro de un contenedor
```bash
# Entrar al backend
docker compose exec backend bash

# Entrar al frontend
docker compose exec frontend sh
```

### 6. Detener y borrar volúmenes (limpieza total)
```bash
docker compose down -v
```

---

## 🧱 Arquitectura de Contenedores y Volúmenes

```
[ Red interna: cipress-network ]
├── Contenedor: cipress-backend (Python 3.12-slim)
│   ├── Puerto: 5000:5000
│   ├── Código montado: ./backend -> /app (Hot-Reload)
│   ├── Volumen persistente: cipress_backend_db -> /app/instance
│   └── Volumen persistente: cipress_backend_media -> /app/media
│
└── Contenedor: cipress-frontend (Node 20-alpine)
    ├── Puerto: 3000:3000
    ├── Proxy interno: /api -> http://backend:5000
    └── Código montado: ./project -> /app (Hot-Reload)
```

* **Hot-Reload en Desarrollo:** Cualquier cambio que guardes en los archivos de tu editor en la máquina host se sincroniza de inmediato dentro del contenedor sin reiniciar.
* **Persistencia de Datos:** La base de datos SQLite y las imágenes subidas a la galería se almacenan en volúmenes nombrados de Docker (`cipress_backend_db` y `cipress_backend_media`), por lo que no se pierden al apagar los contenedores.
