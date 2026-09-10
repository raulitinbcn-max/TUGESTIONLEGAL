-- TuGestiónLegal - Database Schema
-- Created tables from Prisma schema

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  "nombreCompleto" TEXT NOT NULL,
  "fechaNacimiento" TIMESTAMP,
  nacionalidad TEXT,
  "numeroPasaporte" TEXT UNIQUE,
  direccion TEXT,
  email TEXT,
  telefono TEXT,
  "situacionActual" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trámites
CREATE TABLE IF NOT EXISTS tramites (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  "clienteId" TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  "tipoTramite" TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  honorarios DECIMAL(10, 2),
  "formaPago" TEXT,
  "driveFolderId" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- HistorialEstado
CREATE TABLE IF NOT EXISTS historial_estados (
  id TEXT PRIMARY KEY,
  "tramiteId" TEXT NOT NULL REFERENCES tramites(id) ON DELETE CASCADE,
  "estadoAnterior" TEXT,
  "estadoNuevo" TEXT NOT NULL,
  usuario TEXT NOT NULL,
  notas TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Documentos
CREATE TABLE IF NOT EXISTS documentos (
  id TEXT PRIMARY KEY,
  "tramiteId" TEXT NOT NULL REFERENCES tramites(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  "tipoDocumento" TEXT NOT NULL,
  "driveFileId" TEXT NOT NULL,
  origen TEXT NOT NULL DEFAULT 'manual',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Plantillas
CREATE TABLE IF NOT EXISTS plantillas (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL,
  "tipoTramite" TEXT NOT NULL,
  nombre TEXT NOT NULL,
  "driveFileId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- DocumentosGenerados
CREATE TABLE IF NOT EXISTS documentos_generados (
  id TEXT PRIMARY KEY,
  "tramiteId" TEXT NOT NULL REFERENCES tramites(id) ON DELETE CASCADE,
  "plantillaId" TEXT NOT NULL REFERENCES plantillas(id),
  "driveFileId" TEXT NOT NULL,
  "nombreGenerado" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS "tramites_clienteId_idx" ON tramites("clienteId");
CREATE INDEX IF NOT EXISTS "documentos_tramiteId_idx" ON documentos("tramiteId");
CREATE INDEX IF NOT EXISTS "historial_estados_tramiteId_idx" ON historial_estados("tramiteId");
CREATE INDEX IF NOT EXISTS "documentos_generados_tramiteId_idx" ON documentos_generados("tramiteId");
