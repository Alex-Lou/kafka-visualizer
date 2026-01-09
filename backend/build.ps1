# build.ps1 - Build script avec erreurs simplifiées
# Usage: .\build.ps1 ou .\build.ps1 -SkipTests

param(
    [switch]$SkipTests,
    [switch]$Clean
)

$Host.UI.RawUI.WindowTitle = "Yucast Build"

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔨 Building Yucast..." -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Construire la commande Maven
$mvnCmd = "mvn"
if ($Clean) { $mvnCmd += " clean" }
$mvnCmd += " compile"
if ($SkipTests) { $mvnCmd += " -DskipTests" }

Write-Host "  ⚡ Running: $mvnCmd" -ForegroundColor DarkGray
Write-Host ""

# Exécuter Maven et capturer la sortie
$output = Invoke-Expression "$mvnCmd 2>&1" | Out-String -Stream

# Vérifier si build OK
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  ✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    exit 0
}

# ═══════════════════════════════════════════════════════════════════════
# PARSING DES ERREURS
# ═══════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "  ❌ Compilation failed!" -ForegroundColor Red
Write-Host ""

$errorCount = 0
$currentFile = ""
$currentLine = ""

foreach ($line in $output) {

    # Pattern: [ERROR] /path/to/File.java:[line,col] message
    if ($line -match '\[ERROR\]\s+.*[/\\]([^/\\]+\.java):\[(\d+),\d+\]\s*(.*)') {
        $currentFile = $matches[1]
        $currentLine = $matches[2]
        $message = $matches[3]

        if ($message -and $message -notmatch "cannot find symbol") {
            $errorCount++
            Write-Host "   📄 " -NoNewline
            Write-Host "$currentFile" -ForegroundColor Yellow -NoNewline
            Write-Host ":" -NoNewline
            Write-Host "$currentLine" -ForegroundColor Cyan
            Write-Host "      └─ $message" -ForegroundColor White
            Write-Host ""
        }
    }
    # Pattern: symbol: class ClassName
    elseif ($line -match 'symbol:\s+class\s+(\w+)') {
        $errorCount++
        $className = $matches[1]
        Write-Host "   📄 " -NoNewline
        Write-Host "$currentFile" -ForegroundColor Yellow -NoNewline
        Write-Host ":" -NoNewline
        Write-Host "$currentLine" -ForegroundColor Cyan
        Write-Host "      └─ Missing class: " -NoNewline -ForegroundColor White
        Write-Host "$className" -ForegroundColor Red
        Write-Host "      💡 Check import statement" -ForegroundColor DarkGray
        Write-Host ""
    }
    # Pattern: symbol: method methodName
    elseif ($line -match 'symbol:\s+method\s+(\w+)') {
        $errorCount++
        $methodName = $matches[1]
        Write-Host "   📄 " -NoNewline
        Write-Host "$currentFile" -ForegroundColor Yellow -NoNewline
        Write-Host ":" -NoNewline
        Write-Host "$currentLine" -ForegroundColor Cyan
        Write-Host "      └─ Missing method: " -NoNewline -ForegroundColor White
        Write-Host "$methodName()" -ForegroundColor Red
        Write-Host "      💡 Method doesn't exist or wrong signature" -ForegroundColor DarkGray
        Write-Host ""
    }
    # Pattern: symbol: variable varName
    elseif ($line -match 'symbol:\s+variable\s+(\w+)') {
        $errorCount++
        $varName = $matches[1]
        Write-Host "   📄 " -NoNewline
        Write-Host "$currentFile" -ForegroundColor Yellow -NoNewline
        Write-Host ":" -NoNewline
        Write-Host "$currentLine" -ForegroundColor Cyan
        Write-Host "      └─ Unknown variable: " -NoNewline -ForegroundColor White
        Write-Host "$varName" -ForegroundColor Red
        Write-Host ""
    }
    # Pattern: package X does not exist
    elseif ($line -match 'package\s+([\w.]+)\s+does not exist') {
        $errorCount++
        $pkg = $matches[1]
        Write-Host "   📦 " -NoNewline
        Write-Host "Missing package: " -NoNewline -ForegroundColor White
        Write-Host "$pkg" -ForegroundColor Red
        Write-Host "      💡 Add dependency to pom.xml" -ForegroundColor DarkGray
        Write-Host ""
    }
    # Pattern: incompatible types
    elseif ($line -match 'incompatible types:\s*(.+)') {
        $errorCount++
        $types = $matches[1]
        Write-Host "   📄 " -NoNewline
        Write-Host "$currentFile" -ForegroundColor Yellow -NoNewline
        Write-Host ":" -NoNewline
        Write-Host "$currentLine" -ForegroundColor Cyan
        Write-Host "      └─ Type mismatch: " -NoNewline -ForegroundColor White
        Write-Host "$types" -ForegroundColor Red
        Write-Host ""
    }
}

# ═══════════════════════════════════════════════════════════════════════
# RÉSUMÉ
# ═══════════════════════════════════════════════════════════════════════

Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host "  ❌ Build failed with $errorCount error(s)" -ForegroundColor Red
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Red
Write-Host ""

exit 1