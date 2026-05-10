@echo off
setlocal

echo.
echo ========================================
echo   Alumco ONG - Entorno Local
echo ========================================
echo.

where docker >nul 2>nul
if errorlevel 1 (
	echo Docker no esta instalado o no esta en PATH.
	echo Instala Docker Desktop y vuelve a ejecutar este script.
	exit /b 1
)

docker compose version >nul 2>nul
if errorlevel 1 (
	echo Docker Compose no esta disponible.
	echo Verifica que Docker Desktop este corriendo.
	exit /b 1
)

:menu
echo.
echo Selecciona una accion:
echo 1) Iniciar (construir e iniciar contenedores)
echo 2) Reiniciar (reiniciar contenedores rapido)
echo 3) Detener (detener y limpiar contenedores)
echo 4) Salir
echo.
set /p opcion="Ingresa el numero de la opcion (1-4): "

if "%opcion%"=="1" goto iniciar
if "%opcion%"=="2" goto reiniciar
if "%opcion%"=="3" goto detener
if "%opcion%"=="4" goto salir
echo Opcion invalida. Intenta de nuevo.
goto menu

:iniciar
echo.
echo Iniciando entorno local de Alumco con Docker...
echo.
docker compose up --build
if errorlevel 1 (
	echo No se pudo iniciar el stack.
	exit /b 1
)
goto fin

:reiniciar
echo.
echo Reiniciando contenedores...
echo.
docker compose restart
echo.
echo Contenedores reiniciados correctamente.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo.
pause
goto menu

:detener
echo.
echo Deteniendo y limpiando contenedores...
echo.
docker compose down
echo.
echo Contenedores detenidos.
echo.
pause
goto menu

:salir
endlocal
exit /b 0

:fin
echo.
echo Stack detenido o parado manualmente.
echo.
echo URLs de acceso:
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo Base de datos: localhost:5432
echo.
echo Nota: Presiona Ctrl+C para detener los contenedores desde esta ventana.
echo.
pause
goto menu