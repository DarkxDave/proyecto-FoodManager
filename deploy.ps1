# Script de despliegue rápido para proyecto-FoodManager (PowerShell)
# Uso: .\deploy.ps1 [start|stop|restart|logs|rebuild|clean|status]

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'logs', 'rebuild', 'clean', 'status')]
    [string]$Command = 'start'
)

# Colores
$Green = 'Green'
$Yellow = 'Yellow'
$Red = 'Red'

Write-Host "╔═══════════════════════════════════════╗" -ForegroundColor $Green
Write-Host "║  Proyecto FoodManager - Deployment   ║" -ForegroundColor $Green
Write-Host "╚═══════════════════════════════════════╝" -ForegroundColor $Green
Write-Host ""

# Verificar que Docker está instalado
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker no está instalado" -ForegroundColor $Red
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose no está instalado" -ForegroundColor $Red
    exit 1
}

# Verificar archivo .env
if (-not (Test-Path .env)) {
    Write-Host "⚠️  Archivo .env no encontrado" -ForegroundColor $Yellow
    Write-Host "Creando desde .env.example..." -ForegroundColor $Yellow
    Copy-Item .env.example .env
    Write-Host "✓ Archivo .env creado" -ForegroundColor $Green
    Write-Host "⚠️  IMPORTANTE: Edita .env y cambia JWT_SECRET antes de producción" -ForegroundColor $Yellow
    Write-Host ""
}

switch ($Command) {
    'start' {
        Write-Host "🚀 Iniciando servicios..." -ForegroundColor $Green
        docker-compose up -d
        Write-Host ""
        Write-Host "✓ Servicios iniciados" -ForegroundColor $Green
        Write-Host ""
        Write-Host "Frontend: " -NoNewline
        Write-Host "http://localhost:8080" -ForegroundColor $Yellow
        Write-Host "Backend:  " -NoNewline
        Write-Host "http://localhost:3000" -ForegroundColor $Yellow
        Write-Host "MySQL:    " -NoNewline
        Write-Host "localhost:3306" -ForegroundColor $Yellow
        Write-Host ""
        Write-Host "Credenciales:"
        Write-Host "  Email:    " -NoNewline
        Write-Host "admin@supermercado.com" -ForegroundColor $Yellow
        Write-Host "  Password: " -NoNewline
        Write-Host "admin123" -ForegroundColor $Yellow
        Write-Host ""
        Write-Host "Ver logs: " -NoNewline
        Write-Host "docker-compose logs -f" -ForegroundColor $Yellow
    }

    'stop' {
        Write-Host "⏸️  Deteniendo servicios..." -ForegroundColor $Yellow
        docker-compose stop
        Write-Host "✓ Servicios detenidos" -ForegroundColor $Green
    }

    'restart' {
        Write-Host "🔄 Reiniciando servicios..." -ForegroundColor $Yellow
        docker-compose restart
        Write-Host "✓ Servicios reiniciados" -ForegroundColor $Green
    }

    'logs' {
        Write-Host "📋 Mostrando logs (Ctrl+C para salir)..." -ForegroundColor $Green
        docker-compose logs -f
    }

    'rebuild' {
        Write-Host "🔨 Reconstruyendo imágenes..." -ForegroundColor $Yellow
        docker-compose build --no-cache
        Write-Host "🚀 Reiniciando con nuevas imágenes..." -ForegroundColor $Green
        docker-compose up -d
        Write-Host "✓ Reconstrucción completa" -ForegroundColor $Green
    }

    'clean' {
        Write-Host "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos" -ForegroundColor $Red
        $confirm = Read-Host "¿Estás seguro? (yes/no)"
        if ($confirm -eq 'yes') {
            Write-Host "🗑️  Eliminando servicios y volúmenes..." -ForegroundColor $Red
            docker-compose down -v
            Write-Host "✓ Limpieza completa" -ForegroundColor $Green
        } else {
            Write-Host "Operación cancelada" -ForegroundColor $Yellow
        }
    }

    'status' {
        Write-Host "📊 Estado de servicios:" -ForegroundColor $Green
        Write-Host ""
        docker-compose ps
    }
}
