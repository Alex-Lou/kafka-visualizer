@echo off
cls
color 0B

echo ==========================================================
echo            Create OWNER Account (Windows)
echo ==========================================================
echo.
echo This script will add a new Admin/Owner to the database.
echo.

:: 1. Demande des infos
set /p USERNAME="Enter Username: "
set /p EMAIL="Enter Email (optional): "
set /p PASSWORD="Enter Password: "

if "%USERNAME%"=="" goto error
if "%PASSWORD%"=="" goto error

echo.
echo ==========================================================
echo Running Spring Boot to inject user... Please wait...
echo (This might take a few seconds to initialize connection)
echo ==========================================================
echo.

:: 2. Lancement de Maven
:: On utilise call pour éviter que le script se ferme tout de suite
call mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dapp.setup.mode=true -Dapp.setup.username=%USERNAME% -Dapp.setup.password=%PASSWORD% -Dapp.setup.email=%EMAIL%" -q

echo.
echo ==========================================================
echo Done.
echo ==========================================================
pause
exit /b

:error
echo.
echo [ERROR] Username and Password are required.
pause