FROM python:3.12-alpine

WORKDIR /app

# Dependencias mínimas del sistema
RUN apk add --no-cache \
    build-base \
    curl

# Copiar requirements primero para aprovechar la caché de Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY . .

# Asegurar directorios de base de datos y archivos multimedia
RUN mkdir -p instance media/uploads

EXPOSE 5000

# En desarrollo: si no existe la base de datos la inicializa y luego arranca Flask
CMD ["sh", "-c", "if [ ! -f instance/cipress.db ]; then python create-db.py; fi && python run.py"]
