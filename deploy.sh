#!/bin/bash
# Script de despliegue rápido para proyecto-FoodManager
# Uso: ./deploy.sh [start|stop|restart|logs|rebuild]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Proyecto FoodManager - Deployment   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi

# Verificar archivo .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    echo -e "${YELLOW}Creando desde .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Archivo .env creado${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita .env y cambia JWT_SECRET antes de producción${NC}"
    echo ""
fi

# Función para mostrar uso
show_usage() {
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  start    - Iniciar todos los servicios"
    echo "  stop     - Detener todos los servicios"
    echo "  restart  - Reiniciar todos los servicios"
    echo "  logs     - Ver logs en tiempo real"
    echo "  rebuild  - Reconstruir imágenes y reiniciar"
    echo "  clean    - Detener y eliminar TODO (incluye datos)"
    echo "  status   - Ver estado de servicios"
    echo ""
}

# Comando a ejecutar
COMMAND=${1:-start}

case $COMMAND in
    start)
        echo -e "${GREEN}🚀 Iniciando servicios...${NC}"
        docker-compose up -d
        echo ""
        echo -e "${GREEN}✓ Servicios iniciados${NC}"
        echo ""
        echo -e "Frontend: ${YELLOW}http://localhost:8080${NC}"
        echo -e "Backend:  ${YELLOW}http://localhost:3000${NC}"
        echo -e "MySQL:    ${YELLOW}localhost:3306${NC}"
        echo ""
        echo -e "Credenciales:"
        echo -e "  Email:    ${YELLOW}admin@supermercado.com${NC}"
        echo -e "  Password: ${YELLOW}admin123${NC}"
        echo ""
        echo -e "Ver logs: ${YELLOW}docker-compose logs -f${NC}"
        ;;

    stop)
        echo -e "${YELLOW}⏸️  Deteniendo servicios...${NC}"
        docker-compose stop
        echo -e "${GREEN}✓ Servicios detenidos${NC}"
        ;;

    restart)
        echo -e "${YELLOW}🔄 Reiniciando servicios...${NC}"
        docker-compose restart
        echo -e "${GREEN}✓ Servicios reiniciados${NC}"
        ;;

    logs)
        echo -e "${GREEN}📋 Mostrando logs (Ctrl+C para salir)...${NC}"
        docker-compose logs -f
        ;;

    rebuild)
        echo -e "${YELLOW}🔨 Reconstruyendo imágenes...${NC}"
        docker-compose build --no-cache
        echo -e "${GREEN}🚀 Reiniciando con nuevas imágenes...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✓ Reconstrucción completa${NC}"
        ;;

    clean)
        echo -e "${RED}⚠️  ADVERTENCIA: Esto eliminará TODOS los datos${NC}"
        read -p "¿Estás seguro? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo -e "${RED}🗑️  Eliminando servicios y volúmenes...${NC}"
            docker-compose down -v
            echo -e "${GREEN}✓ Limpieza completa${NC}"
        else
            echo -e "${YELLOW}Operación cancelada${NC}"
        fi
        ;;

    status)
        echo -e "${GREEN}📊 Estado de servicios:${NC}"
        echo ""
        docker-compose ps
        ;;

    *)
        echo -e "${RED}❌ Comando desconocido: $COMMAND${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac
