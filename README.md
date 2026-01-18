# Auditorías en Línea

Sistema de gestión de auditorías multi-tenant.

## Arquitectura

- **Backend**: Node.js + Express + TypeScript + TypeORM (PostgreSQL)
- **Frontend**: React + Vite + Tailwind CSS + Redux Toolkit
- **Infraestructura**: 
  - **Storage**: MinIO (S3-Compatible)
  - **Cache/Queue**: Redis
  - **CDN/DNS**: Cloudflare

## Requisitos

- Docker & Docker Compose
- Node.js 18+ (para desarrollo local sin Docker)

## Setup Local (con Docker)

1. Clonar el repositorio.
2. Copiar `backend/.env.example` (o usar el generado) a `backend/.env`.
3. Ejecutar:
   ```bash
   docker-compose up -d
   ```
4. El backend estará disponible en `http://localhost:5000` y el frontend en `http://localhost:5173`.

## Desarrollo Local

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
