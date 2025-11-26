# Script de backup para proyecto-FoodManager (PowerShell)
# Uso: .\backup.ps1

# Configuración
$BackupDir = ".\backups"
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$DbContainer = "supermercado_db"

# Colores
$Green = 'Green'
$Yellow = 'Yellow'
$Red = 'Red'

Write-Host "╔═══════════════════════════════════════╗" -ForegroundColor $Green
Write-Host "║     Backup - proyecto-FoodManager     ║" -ForegroundColor $Green
Write-Host "╚═══════════════════════════════════════╝" -ForegroundColor $Green
Write-Host ""

# Verificar que Docker está corriendo
try {
    docker ps | Out-Null
} catch {
    Write-Host "❌ Docker no está corriendo" -ForegroundColor $Red
    exit 1
}

# Verificar que el contenedor de DB existe
$containerExists = docker ps -a --format '{{.Names}}' | Select-String -Pattern "^$DbContainer$"
if (-not $containerExists) {
    Write-Host "❌ Contenedor $DbContainer no encontrado" -ForegroundColor $Red
    Write-Host "Ejecuta primero: docker-compose up -d" -ForegroundColor $Yellow
    exit 1
}

# Crear directorio de backups
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Cargar variables de entorno
$DbUser = "admin"
$DbPassword = "adminpassword"
$DbName = "supermercado"

if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($key -eq 'DB_USER') { $DbUser = $value }
            if ($key -eq 'DB_PASSWORD') { $DbPassword = $value }
            if ($key -eq 'DB_NAME') { $DbName = $value }
        }
    }
} else {
    Write-Host "⚠️  Archivo .env no encontrado, usando valores por defecto" -ForegroundColor $Yellow
}

Write-Host "📦 Creando backup de base de datos..." -ForegroundColor $Yellow

# Ejecutar mysqldump
$BackupFile = "$BackupDir\db_${DbName}_${Date}.sql"

$mysqldumpCmd = "mysqldump -u $DbUser -p$DbPassword --databases $DbName --add-drop-database --routines --triggers --events"
docker exec $DbContainer sh -c $mysqldumpCmd | Out-File -FilePath $BackupFile -Encoding utf8

if ($LASTEXITCODE -eq 0) {
    # Comprimir backup (si 7-Zip está disponible)
    if (Get-Command 7z -ErrorAction SilentlyContinue) {
        Write-Host "🗜️  Comprimiendo backup..." -ForegroundColor $Yellow
        7z a -tgzip "$BackupFile.gz" $BackupFile | Out-Null
        Remove-Item $BackupFile
        $BackupFile = "$BackupFile.gz"
    }
    
    # Tamaño del archivo
    $Size = (Get-Item $BackupFile).Length / 1MB
    $SizeStr = "{0:N2} MB" -f $Size
    
    Write-Host "✓ Backup completado" -ForegroundColor $Green
    Write-Host "  Archivo: " -NoNewline
    Write-Host $BackupFile -ForegroundColor $Yellow
    Write-Host "  Tamaño:  " -NoNewline
    Write-Host $SizeStr -ForegroundColor $Yellow
    Write-Host ""
    
    # Listar backups existentes
    Write-Host "📋 Backups disponibles:" -ForegroundColor $Green
    Get-ChildItem "$BackupDir\*.sql*" | ForEach-Object {
        $fileSize = "{0:N2} MB" -f ($_.Length / 1MB)
        Write-Host "  $($_.Name) ($fileSize)"
    }
    
    # Limpiar backups antiguos (más de 30 días)
    Write-Host ""
    Write-Host "🧹 Limpiando backups antiguos (>30 días)..." -ForegroundColor $Yellow
    $OldBackups = Get-ChildItem "$BackupDir\*.sql*" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) }
    if ($OldBackups) {
        $Deleted = $OldBackups.Count
        $OldBackups | Remove-Item
        Write-Host "✓ Eliminados $Deleted backups antiguos" -ForegroundColor $Green
    } else {
        Write-Host "  No hay backups antiguos para eliminar"
    }
    
} else {
    Write-Host "❌ Error al crear backup" -ForegroundColor $Red
    exit 1
}

Write-Host ""
Write-Host "✓ Proceso completado" -ForegroundColor $Green
