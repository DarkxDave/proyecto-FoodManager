#!/bin/bash
# Script de backup para proyecto-FoodManager
# Uso: ./backup.sh

set -e

# Configuración
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="supermercado_db"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Backup - proyecto-FoodManager     ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""

# Verificar que Docker está corriendo
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    exit 1
fi

# Verificar que el contenedor de DB existe
if ! docker ps -a --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    echo -e "${RED}❌ Contenedor ${DB_CONTAINER} no encontrado${NC}"
    echo -e "${YELLOW}Ejecuta primero: docker-compose up -d${NC}"
    exit 1
fi

# Crear directorio de backups
mkdir -p "$BACKUP_DIR"

# Cargar variables de entorno
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado, usando valores por defecto${NC}"
    DB_USER="admin"
    DB_PASSWORD="adminpassword"
    DB_NAME="supermercado"
fi

echo -e "${YELLOW}📦 Creando backup de base de datos...${NC}"

# Ejecutar mysqldump
BACKUP_FILE="${BACKUP_DIR}/db_${DB_NAME}_${DATE}.sql"

docker exec $DB_CONTAINER mysqldump \
    -u $DB_USER \
    -p$DB_PASSWORD \
    --databases $DB_NAME \
    --add-drop-database \
    --routines \
    --triggers \
    --events \
    > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    # Comprimir backup
    echo -e "${YELLOW}🗜️  Comprimiendo backup...${NC}"
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    # Tamaño del archivo
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    echo -e "${GREEN}✓ Backup completado${NC}"
    echo -e "  Archivo: ${YELLOW}$BACKUP_FILE${NC}"
    echo -e "  Tamaño:  ${YELLOW}$SIZE${NC}"
    echo ""
    
    # Listar backups existentes
    echo -e "${GREEN}📋 Backups disponibles:${NC}"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    
    # Limpiar backups antiguos (más de 30 días)
    echo ""
    echo -e "${YELLOW}🧹 Limpiando backups antiguos (>30 días)...${NC}"
    DELETED=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete -print | wc -l)
    if [ $DELETED -gt 0 ]; then
        echo -e "${GREEN}✓ Eliminados $DELETED backups antiguos${NC}"
    else
        echo -e "  No hay backups antiguos para eliminar"
    fi
    
else
    echo -e "${RED}❌ Error al crear backup${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Proceso completado${NC}"
