@echo off
setlocal EnableDelayedExpansion

echo.
echo ========================================================================
echo         KAFKA FLOW VISUALIZER - Multi-Broker Demo
echo ========================================================================
echo   Cluster 1 (9092) : E-commerce  - orders, payments, shipping
echo   Cluster 2 (9093) : Dev/Logs    - app.logs, user.events, errors
echo   Cluster 3 (9094) : Staging     - staging.orders, staging.alerts
echo ========================================================================
echo.

:: Check if Docker containers are running
echo [INFO] Verification des clusters Kafka...

docker ps --format "{{.Names}}" 2>nul | findstr /C:"kafka-cluster1-broker" >nul
if %errorlevel% neq 0 (
    echo [ERREUR] Cluster 1 9092 pas lance
    echo          Lancez: docker-compose -f docker-compose.multi-kafka.yml up -d
    pause
    exit /b 1
)

docker ps --format "{{.Names}}" 2>nul | findstr /C:"kafka-cluster2-broker" >nul
if %errorlevel% neq 0 (
    echo [ERREUR] Cluster 2 9093 pas lance
    pause
    exit /b 1
)

docker ps --format "{{.Names}}" 2>nul | findstr /C:"kafka-cluster3-broker" >nul
if %errorlevel% neq 0 (
    echo [ERREUR] Cluster 3 9094 pas lance
    pause
    exit /b 1
)

echo [OK] Tous les clusters sont en ligne!
echo.

:: Create topics on each cluster
echo [INFO] Creation des topics sur chaque cluster...

echo   - Cluster 1 E-commerce...
docker exec kafka-cluster1-broker kafka-topics --create --if-not-exists --topic orders.created --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>nul
docker exec kafka-cluster1-broker kafka-topics --create --if-not-exists --topic orders.completed --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>nul
docker exec kafka-cluster1-broker kafka-topics --create --if-not-exists --topic payments.processed --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>nul
docker exec kafka-cluster1-broker kafka-topics --create --if-not-exists --topic shipping.updates --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 2>nul

echo   - Cluster 2 Dev/Logs...
docker exec kafka-cluster2-broker kafka-topics --create --if-not-exists --topic app.logs --bootstrap-server localhost:9093 --partitions 2 --replication-factor 1 2>nul
docker exec kafka-cluster2-broker kafka-topics --create --if-not-exists --topic user.events --bootstrap-server localhost:9093 --partitions 2 --replication-factor 1 2>nul
docker exec kafka-cluster2-broker kafka-topics --create --if-not-exists --topic errors --bootstrap-server localhost:9093 --partitions 1 --replication-factor 1 2>nul

echo   - Cluster 3 Staging...
docker exec kafka-cluster3-broker kafka-topics --create --if-not-exists --topic staging.orders --bootstrap-server localhost:9094 --partitions 2 --replication-factor 1 2>nul
docker exec kafka-cluster3-broker kafka-topics --create --if-not-exists --topic staging.alerts --bootstrap-server localhost:9094 --partitions 1 --replication-factor 1 2>nul

echo [OK] Topics crees!
echo.

echo ========================================================================
echo   DEMO EN COURS - Appuyez sur Ctrl+C pour arreter
echo ========================================================================
echo.

set counter=0

:loop
set /a counter+=1

:: Generate random values
set /a order_id=%random% %% 9000 + 1000
set /a pay_id=%random% %% 9000 + 1000
set /a ship_id=%random% %% 9000 + 1000
set /a amount=%random% %% 500 + 10
set /a user_id=%random% %% 100 + 1
set /a response_time=%random% %% 2000 + 50
set /a log_id=%random% %% 9000 + 1000
set /a error_id=%random% %% 9000 + 1000
set /a alert_id=%random% %% 9000 + 1000

:: Random status
set /a status_rand=%random% %% 10
if %status_rand% lss 7 (set status=SUCCESS) else if %status_rand% lss 9 (set status=PENDING) else (set status=ERROR)

:: Random log level
set /a level_rand=%random% %% 10
if %level_rand% lss 6 (set level=INFO) else if %level_rand% lss 8 (set level=WARN) else (set level=ERROR)

:: ============================================================================
:: CLUSTER 1 - E-commerce Messages (Port 9092) - WITH KEYS
:: ============================================================================

echo ORD-%order_id%:{"orderId":"ORD-%order_id%","customerId":"CUST-%user_id%","amount":%amount%.99,"currency":"EUR","status":"CREATED"}| docker exec -i kafka-cluster1-broker kafka-console-producer --broker-list localhost:9092 --topic orders.created --property parse.key=true --property key.separator=: 2>nul
echo   [9092] orders.created     : ORD-%order_id% - EUR %amount%.99

set /a mod2=%counter% %% 2
if %mod2%==0 (
    echo PAY-%pay_id%:{"paymentId":"PAY-%pay_id%","orderId":"ORD-%order_id%","amount":%amount%.99,"method":"CARD","status":"%status%"}| docker exec -i kafka-cluster1-broker kafka-console-producer --broker-list localhost:9092 --topic payments.processed --property parse.key=true --property key.separator=: 2>nul
    echo   [9092] payments.processed : PAY-%pay_id% - [%status%]
)

set /a mod3=%counter% %% 3
if %mod3%==0 (
    echo SHIP-%ship_id%:{"shipmentId":"SHIP-%ship_id%","orderId":"ORD-%order_id%","carrier":"DHL","status":"IN_TRANSIT"}| docker exec -i kafka-cluster1-broker kafka-console-producer --broker-list localhost:9092 --topic shipping.updates --property parse.key=true --property key.separator=: 2>nul
    echo   [9092] shipping.updates  : SHIP-%ship_id% - [IN_TRANSIT]
)

:: ============================================================================
:: CLUSTER 2 - Dev/Logs Messages (Port 9093) - WITH KEYS
:: ============================================================================

echo LOG-%log_id%:{"level":"%level%","service":"api-gateway","message":"Request processed","responseTime":%response_time%}| docker exec -i kafka-cluster2-broker kafka-console-producer --broker-list localhost:9093 --topic app.logs --property parse.key=true --property key.separator=: 2>nul
echo   [9093] app.logs          : LOG-%log_id% - [%level%] %response_time%ms

if %mod2%==0 (
    set /a event_rand=%random% %% 4
    if !event_rand!==0 (set event=LOGIN)
    if !event_rand!==1 (set event=LOGOUT)
    if !event_rand!==2 (set event=PAGE_VIEW)
    if !event_rand!==3 (set event=CLICK)
    echo USER-%user_id%:{"userId":"USER-%user_id%","event":"!event!","page":"/dashboard"}| docker exec -i kafka-cluster2-broker kafka-console-producer --broker-list localhost:9093 --topic user.events --property parse.key=true --property key.separator=: 2>nul
    echo   [9093] user.events       : USER-%user_id% - [!event!]
)

if "%level%"=="ERROR" (
    echo ERR-%error_id%:{"errorCode":"ERR-%error_id%","service":"payment-service","message":"Connection timeout"}| docker exec -i kafka-cluster2-broker kafka-console-producer --broker-list localhost:9093 --topic errors --property parse.key=true --property key.separator=: 2>nul
    echo   [9093] errors            : ERR-%error_id% - [TIMEOUT]
)

:: ============================================================================
:: CLUSTER 3 - Staging Messages (Port 9094) - WITH KEYS
:: ============================================================================

if %mod3%==0 (
    echo STG-%order_id%:{"orderId":"STG-ORD-%order_id%","environment":"staging","customerId":"TEST-%user_id%","amount":%amount%.00}| docker exec -i kafka-cluster3-broker kafka-console-producer --broker-list localhost:9094 --topic staging.orders --property parse.key=true --property key.separator=: 2>nul
    echo   [9094] staging.orders    : STG-%order_id% - [TEST]
)

set /a alert_rand=%random% %% 5
if %alert_rand%==0 (
    set /a alert_type=%random% %% 3
    if !alert_type!==0 (set alert=HIGH_CPU)
    if !alert_type!==1 (set alert=MEMORY_WARNING)
    if !alert_type!==2 (set alert=SLOW_RESPONSE)
    echo ALERT-%alert_id%:{"alertId":"ALERT-%alert_id%","type":"!alert!","severity":"WARNING","service":"staging-api"}| docker exec -i kafka-cluster3-broker kafka-console-producer --broker-list localhost:9094 --topic staging.alerts --property parse.key=true --property key.separator=: 2>nul
    echo   [9094] staging.alerts    : ALERT-%alert_id% - [!alert!]
)

echo   ------------------------------------------------------------------------

:: Wait 2-4 seconds
set /a wait_time=%random% %% 3 + 2
timeout /t %wait_time% /nobreak >nul

goto :loop