FROM node:20-alpine

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del frontend
COPY . .

EXPOSE 3000

# Ejecutar Vite en modo desarrollo escuchando en 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
