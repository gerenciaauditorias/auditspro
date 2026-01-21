-- Add fiscal information fields to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS cuit VARCHAR(13),
ADD COLUMN IF NOT EXISTS "taxCondition" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "billingAddress" TEXT,
ADD COLUMN IF NOT EXISTS "ivaCondition" VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN tenants.cuit IS 'CUIT - Clave Única de Identificación Tributaria (Argentina)';
COMMENT ON COLUMN tenants."taxCondition" IS 'Tax condition: responsable_inscripto, monotributo, exento, consumidor_final';
COMMENT ON COLUMN tenants."ivaCondition" IS 'IVA condition: responsable_inscripto, exento, no_responsable';
