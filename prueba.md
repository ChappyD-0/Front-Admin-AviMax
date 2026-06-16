# Especificación de Frontend — AviMax Central Multi-Galpón

## 1. Objetivo del frontend

El frontend de *AviMax Central* será una aplicación web para administrar y monitorear múltiples galpones avícolas desde un servidor central.

El sistema debe permitir:

* Visualizar el estado general de todos los galpones.
* Consultar información individual de cada galpón.
* Registrar o provisionar nuevos galpones.
* Consultar gateways, sensores, lecturas, parvadas y alertas.
* Administrar programación de actuadores.
* Preparar la configuración que usará cada backend local en Raspberry Pi.
* Verificar el estado de sincronización entre backend central y backend local.

La idea principal es que el *backend central sea la fuente de verdad* y cada *backend local de galpón* se conecte usando variables como:

env
GALPON_ID=1
GATEWAY_ID=raspi5-galpon-01
MQTT_BROKER_URL=tcp://IP_DEL_BROKER:1883


---

## 2. Concepto general del sistema

AviMax Central trabaja con una arquitectura multi-galpón:

text
Frontend Web Central
        ↓ HTTP REST
Backend Central Spring Boot
        ↓ PostgreSQL
Base de datos central
        ↓ MQTT
Broker MQTT Central
        ↓ MQTT
Backends locales por galpón


Cada galpón tendrá su propio backend local. Por ejemplo:

text
Galpón 1 → backend local con GALPON_ID=1
Galpón 2 → backend local con GALPON_ID=2
Galpón 3 → backend local con GALPON_ID=3


El frontend central no controla sensores directamente. El frontend consulta y modifica datos a través del backend central.

---

## 3. Flujo principal de usuario

### Flujo general

text
Inicio
↓
Dashboard general multi-galpón
↓
Seleccionar galpón
↓
Detalle del galpón
↓
Consultar lecturas, sensores, gateway, alertas y actuadores
↓
Modificar programación o reglas
↓
Backend central guarda cambios
↓
Backend central sincroniza con backend local vía MQTT


---

## 4. Mapa de navegación propuesto

text
/dashboard
/galpones
/galpones/nuevo
/galpones/:id
/galpones/:id/lecturas
/galpones/:id/sensores
/galpones/:id/gateways
/galpones/:id/actuadores
/galpones/:id/actuadores/programacion
/galpones/:id/alarmas
/galpones/:id/reglas
/galpones/:id/parvada
/galpones/:id/provisioning
/gateways
/sensores
/alarmas
/sincronizacion
/configuracion


---

# 5. Pantallas necesarias

## 5.1 Pantalla: Dashboard General

### Ruta sugerida

text
/dashboard


### Objetivo

Mostrar una vista resumen de todos los galpones registrados en el backend central.

### Datos principales

* Total de galpones.
* Galpones normales.
* Galpones en advertencia.
* Galpones críticos.
* Gateways offline.
* Alertas críticas.
* Última actualización.
* Tarjetas individuales por galpón.

### Endpoint principal

http
GET /api/dashboard/general


### Ejemplo de respuesta esperada

json
{
  "totalGalpones": 2,
  "galponesNormales": 0,
  "galponesAdvertencia": 2,
  "galponesCriticos": 0,
  "gatewaysOffline": 2,
  "alertasCriticas": 0,
  "ultimaActualizacion": "2026-06-14T22:09:59.971286729-06:00",
  "galpones": [
    {
      "galponId": 1,
      "codigo": "G-01",
      "nombre": "Galpón 1",
      "estado": "ACTIVO",
      "gatewayEstado": "SIN_DATOS",
      "ultimaLectura": null,
      "parvada": {
        "id": 1,
        "nombre": "Lote Demo Junio 2026",
        "dia": 0,
        "avesIniciales": 10000,
        "avesActuales": 10000,
        "mortalidadHoy": 0
      },
      "lecturaActual": null,
      "alertasActivas": 0,
      "actuadoresActivos": {
        "extractoresOn": 0,
        "criadorasOn": 0,
        "bombasOn": 0
      }
    }
  ]
}


### Elementos visuales recomendados

* Tarjetas KPI superiores:

  * Total galpones.
  * Advertencias.
  * Críticos.
  * Gateways offline.
* Grid de tarjetas por galpón.
* Indicadores por color:

  * Verde: normal.
  * Amarillo: advertencia.
  * Rojo: crítico.
  * Gris: sin datos / offline.
* Botón: Nuevo galpón.
* Botón en cada tarjeta: Ver detalle.

### Acciones

* Entrar al detalle de un galpón.
* Crear nuevo galpón.
* Actualizar dashboard.
* Filtrar por estado: activo, advertencia, crítico, sin datos.

---

## 5.2 Pantalla: Listado de Galpones

### Ruta sugerida

text
/galpones


### Objetivo

Mostrar todos los galpones registrados en el sistema central.

### Endpoint sugerido

http
GET /api/provisioning/galpones


### Ejemplo de respuesta

json
[
  {
    "galponId": 1,
    "galponCode": "G-01",
    "galponName": "Galpón 1",
    "gatewayCode": "raspi5-galpon-01"
  }
]


### Columnas sugeridas

* ID.
* Código.
* Nombre.
* Gateway asignado.
* Estado.
* Acciones.

### Acciones

* Ver detalle.
* Ver provisioning.
* Editar configuración.
* Ir a dashboard filtrado por ese galpón.

---

## 5.3 Pantalla: Crear Nuevo Galpón

### Ruta sugerida

text
/galpones/nuevo


### Objetivo

Crear un nuevo galpón en el backend central y generar la información necesaria para conectar su backend local.

### Endpoint a validar en backend

http
POST /api/provisioning/galpones


### Formulario sugerido

#### Datos del galpón

* Código del galpón.
* Nombre del galpón.
* Ubicación.
* Estado inicial: activo/inactivo.

#### Gateway local

* Código del gateway.
* Nombre del gateway.
* URL del broker MQTT.
* Descripción opcional.

#### Sensores iniciales

Permitir agregar sensores como:

* Temperatura.
* Humedad.
* Amoniaco.
* Otros sensores futuros.

Campos por sensor:

text
Código
Nombre
Tipo
Unidad


#### Actuadores iniciales

Cantidad de:

* Extractores.
* Criadoras.
* Bombas.

#### Reglas iniciales

Checkbox:

text
Crear reglas predeterminadas


### Flujo de creación

text
Usuario llena formulario
↓
Frontend envía POST al backend central
↓
Backend central crea galpón, gateway, sensores, actuadores y reglas iniciales
↓
Backend responde con detalle de provisioning
↓
Frontend muestra variables para configurar el backend local


### Resultado esperado

Después de crear un galpón, el sistema debe mostrar una pantalla de configuración local con:

env
GALPON_ID=2
GATEWAY_ID=raspi5-galpon-02
MQTT_BROKER_URL=tcp://IP_DEL_BROKER:1883


Y un comando sugerido como:

bash
SERVER_PORT=8082 GALPON_ID=2 GATEWAY_ID=raspi5-galpon-02 MQTT_BROKER_URL=tcp://IP_DEL_BROKER:1883 mvn spring-boot:run


---

## 5.4 Pantalla: Provisioning de Galpón

### Ruta sugerida

text
/galpones/:id/provisioning


### Objetivo

Mostrar la información necesaria para levantar el backend local de un galpón.

### Endpoint

http
GET /api/provisioning/galpones/{id}


### Ejemplo de respuesta

json
{
  "galponId": 2,
  "galponCode": "G-02",
  "galponName": "Galpón 2",
  "gatewayId": 2,
  "gatewayCode": "raspi5-galpon-02",
  "mqttBrokerUrl": "tcp://localhost:1883",
  "localEnvironment": {
    "GALPON_ID": "2",
    "GATEWAY_ID": "raspi5-galpon-02",
    "MQTT_BROKER_URL": "tcp://localhost:1883"
  },
  "localRunCommand": "SERVER_PORT=8081 GALPON_ID=2 GATEWAY_ID=raspi5-galpon-02 MQTT_BROKER_URL=tcp://localhost:1883 mvn spring-boot:run",
  "mqttTopics": {
    "readings": "avicola/galpon/2/lecturas",
    "commands": "avicola/galpon/2/actuadores/cmd",
    "responses": "avicola/galpon/2/actuadores/respuestas",
    "sync": "avicola/galpon/2/sync/#",
    "programming": "avicola/galpon/2/config/programming",
    "programmingAck": "avicola/galpon/2/config/programming/ack"
  },
  "createdResources": {
    "sensors": 3,
    "extractors": 1,
    "criadoras": 1,
    "bombas": 1,
    "defaultRules": 4
  }
}


### Elementos visuales

* Tarjeta de datos del galpón.
* Tarjeta de gateway.
* Bloque .env copiable.
* Comando de arranque copiable.
* Tabla de topics MQTT.
* Resumen de recursos creados.
* Estado de conexión del gateway.
* Botón: Copiar variables.
* Botón: Copiar comando.
* Botón: Ir al detalle del galpón.

---

## 5.5 Pantalla: Detalle de Galpón

### Ruta sugerida

text
/galpones/:id


### Objetivo

Vista concentrada de un galpón específico.

### Información a mostrar

* Código.
* Nombre.
* Estado.
* Gateway asociado.
* Estado del gateway.
* Última lectura recibida.
* Parvada activa.
* Sensores.
* Alertas activas.
* Actuadores activos.
* Botones de navegación a secciones específicas.

### Endpoints relacionados

http
GET /api/dashboard/general
GET /api/galpones/{id}/lecturas/latest
GET /api/galpones/{id}/sensores
GET /api/galpones/{id}/gateways
GET /api/provisioning/galpones/{id}


### Componentes sugeridos

* GalponHeader.
* GatewayStatusCard.
* CurrentReadingCard.
* ActiveFlockCard.
* ActuatorStatusCard.
* ActiveAlertsCard.
* GalponNavigationTabs.

---

## 5.6 Pantalla: Lecturas del Galpón

### Ruta sugerida

text
/galpones/:id/lecturas


### Objetivo

Mostrar las lecturas ambientales del galpón seleccionado.

### Endpoint principal

http
GET /api/galpones/{id}/lecturas/latest


### Datos esperados

* Temperatura.
* Humedad.
* Amoniaco.
* Fecha/hora de última lectura.
* Sensor que reportó.
* Gateway origen.

### Visualización sugerida

* Tarjetas por variable:

  * Temperatura actual.
  * Humedad actual.
  * NH3 actual.
* Indicadores de rango:

  * Normal.
  * Advertencia.
  * Crítico.
* Gráficas históricas si existen endpoints históricos.
* Mensaje cuando no existan lecturas:

text
Aún no se han recibido lecturas para este galpón.


---

## 5.7 Pantalla: Sensores por Galpón

### Ruta sugerida

text
/galpones/:id/sensores


### Objetivo

Consultar sensores registrados para cada galpón.

### Endpoint

http
GET /api/galpones/{id}/sensores


### Tabla sugerida

* ID.
* Código.
* Nombre.
* Tipo.
* Unidad.
* Estado.
* Última lectura.
* Acciones.

### Acciones futuras

* Registrar nuevo sensor.
* Editar sensor.
* Desactivar sensor.
* Asociar sensor a gateway.

---

## 5.8 Pantalla: Gateways por Galpón

### Ruta sugerida

text
/galpones/:id/gateways


### Objetivo

Mostrar el gateway o gateways asociados al galpón.

### Endpoint

http
GET /api/galpones/{id}/gateways


### Datos sugeridos

* Código del gateway.
* Nombre.
* Estado.
* Última conexión.
* IP o identificador.
* Broker MQTT configurado.
* Galpón asignado.

### Estados visuales

text
CONECTADO
DESCONECTADO
SIN_DATOS
ERROR


---

## 5.9 Pantalla: Alarmas Activas

### Ruta sugerida

text
/alarmas


o por galpón:

text
/galpones/:id/alarmas


### Objetivo

Mostrar alertas generadas por variables fuera de rango.

### Endpoint general

http
GET /api/alarms/active


### Datos sugeridos

* Galpón.
* Sensor.
* Variable.
* Valor detectado.
* Regla que se activó.
* Severidad.
* Fecha/hora.
* Estado.

### Filtros

* Por galpón.
* Por severidad.
* Por variable.
* Por estado.
* Por rango de fechas.

### Acciones futuras

* Reconocer alarma.
* Cerrar alarma.
* Ver historial de eventos.

---

## 5.10 Pantalla: Reglas de Alarma

### Ruta sugerida

text
/galpones/:id/reglas


### Objetivo

Permitir configurar reglas de alarma para cada galpón.

### Datos que debería mostrar

* Nombre de regla.
* Tipo de variable.
* Umbral mínimo.
* Umbral máximo.
* Severidad.
* Estado activa/inactiva.
* Galpón asociado.

### Flujo

text
Usuario edita regla
↓
Frontend envía cambio al backend central
↓
Backend central guarda regla
↓
Backend central usa reglas para evaluar nuevas lecturas


### Nota

Es necesario validar en el backend los endpoints exactos para crear, editar y listar reglas.

---

## 5.11 Pantalla: Actuadores

### Ruta sugerida

text
/galpones/:id/actuadores


### Objetivo

Mostrar los actuadores asociados al galpón:

* Extractores.
* Criadoras.
* Bombas.

### Información sugerida

* ID.
* Nombre.
* Tipo.
* Estado actual.
* Modo:

  * Automático.
  * Manual.
* Última activación.
* Duración de trabajo.
* Estado de sincronización.

### Acciones

* Encender manualmente.
* Apagar manualmente.
* Cambiar a modo automático.
* Cambiar programación.
* Consultar comandos pendientes.

### Endpoint disponible para comandos pendientes

http
GET /api/galpones/{id}/control/commands/pending


---

## 5.12 Pantalla: Programación de Actuadores

### Ruta sugerida

text
/galpones/:id/actuadores/programacion


### Objetivo

Configurar reglas automáticas de funcionamiento para extractores, criadoras y bombas.

### Ejemplo de programación de extractor

http
PUT /api/galpones/{galponId}/extractors/{extractorId}/programming


### Ejemplo de body

json
{
  "temperatureOn": 30.0,
  "temperatureOff": 27.5
}


### Flujo importante

text
Usuario actualiza programación en frontend
↓
Backend central guarda programación
↓
Backend central publica programación vía MQTT
↓
Backend local la recibe
↓
Backend local la guarda/aplica
↓
Backend local envía ACK
↓
Backend central marca como sincronizado


### Mensajes visuales necesarios

* Guardando programación.
* Programación guardada en central.
* Esperando sincronización con backend local.
* Sincronizado correctamente.
* Local offline, se sincronizará cuando vuelva a conectarse.

---

## 5.13 Pantalla: Parvada Activa

### Ruta sugerida

text
/galpones/:id/parvada


### Objetivo

Mostrar la parvada activa del galpón.

### Datos sugeridos

* Nombre de parvada.
* Fecha de inicio.
* Día actual.
* Aves iniciales.
* Aves actuales.
* Mortalidad acumulada.
* Mortalidad de hoy.
* Estado.

### Caso especial

Si el galpón no tiene parvada activa:

text
Este galpón no tiene parvada activa.


Debe mostrar botón:

text
Crear parvada


---

## 5.14 Pantalla: Registros Productivos

### Ruta sugerida

text
/galpones/:id/productividad


### Objetivo

Consultar registros de operación productiva:

* Mortalidad.
* Peso.
* Consumo.
* Conversión.
* Históricos.

### Secciones

text
Mortalidad
Peso
Consumo
Resumen productivo


### Nota

Validar endpoints exactos en el backend central.

---

## 5.15 Pantalla: Sincronización

### Ruta sugerida

text
/sincronizacion


o por galpón:

text
/galpones/:id/sincronizacion


### Objetivo

Mostrar el estado de comunicación central ↔️ local.

### Información sugerida

* Galpón.
* Gateway.
* Estado del gateway.
* Última conexión.
* Último evento sync.
* Programaciones pendientes.
* Programaciones sincronizadas.
* Errores.
* Número de reintentos.

### Topics MQTT relevantes

text
avicola/galpon/{id}/sync/#
avicola/galpon/{id}/config/programming
avicola/galpon/{id}/config/programming/ack
avicola/galpon/{id}/actuadores/cmd
avicola/galpon/{id}/actuadores/respuestas


### Estados sugeridos

text
SINCRONIZADO
PENDIENTE
ERROR
REINTENTANDO
LOCAL_OFFLINE


---

## 5.16 Pantalla: Configuración General

### Ruta sugerida

text
/configuracion


### Objetivo

Configurar parámetros generales del frontend.

### Elementos posibles

* URL base del backend central.
* Modo oscuro/claro.
* Intervalo de refresco.
* Mostrar/ocultar paneles avanzados.
* Información del servidor.
* Estado de API.
* Estado de MQTT indirecto mediante backend.

---

# 6. Flujo completo para crear nuevo galpón

text
1. Usuario entra al Dashboard General.
2. Da clic en “Nuevo galpón”.
3. Llena formulario:
   - Código.
   - Nombre.
   - Ubicación.
   - Gateway.
   - Sensores.
   - Actuadores.
   - Reglas predeterminadas.
4. Frontend envía POST al backend central.
5. Backend central crea:
   - Galpón.
   - Gateway.
   - Sensores.
   - Actuadores.
   - Reglas.
6. Backend central responde con provisioning.
7. Frontend muestra:
   - Variables de entorno.
   - Comando de arranque local.
   - Topics MQTT.
8. Técnico configura el backend local con esas variables.
9. Backend local se conecta al broker.
10. Backend central empieza a recibir lecturas y sincronizar programación.


---

# 7. Flujo cuando el backend local todavía no existe

Caso:

text
Se crea Galpón 2 en central.
Se configuran reglas y programación.
Pero todavía no se levanta el backend local del Galpón 2.


Comportamiento esperado:

text
1. El backend central guarda reglas y programación.
2. No se reflejan todavía en el local porque no hay backend local conectado.
3. Cuando el backend local se levanta con GALPON_ID=2 y GATEWAY_ID correspondiente, debe recibir la configuración vigente.
4. El backend local debe confirmar con ACK.
5. El central debe marcar la sincronización como completada.


Mensaje recomendado en frontend:

text
Programación guardada en central. El backend local aún no está conectado; se sincronizará cuando el gateway esté disponible.


---

# 8. Flujo de monitoreo normal

text
Backend local publica lecturas MQTT
↓
Backend central recibe lecturas
↓
Backend central guarda en BD
↓
Backend central evalúa reglas
↓
Backend central actualiza alarmas y dashboard
↓
Frontend consulta dashboard y detalle del galpón


---

# 9. Flujo de programación de actuadores

text
Usuario cambia programación desde frontend
↓
Frontend envía PUT al backend central
↓
Backend central guarda programación
↓
Backend central publica mensaje MQTT al topic del galpón
↓
Backend local recibe programación
↓
Backend local aplica configuración
↓
Backend local responde ACK
↓
Backend central actualiza estado de sincronización


---

# 10. Estados visuales recomendados

## Estado de galpón

text
ACTIVO
INACTIVO
MANTENIMIENTO
SIN_DATOS


## Estado de gateway

text
CONECTADO
DESCONECTADO
SIN_DATOS
ERROR


## Estado de alerta

text
NORMAL
ADVERTENCIA
CRITICO


## Estado de sincronización

text
SINCRONIZADO
PENDIENTE
REINTENTANDO
ERROR
LOCAL_OFFLINE


---

# 11. Componentes frontend recomendados

## Componentes generales

text
MainLayout
Sidebar
Topbar
StatusBadge
LoadingState
ErrorState
EmptyState
ConfirmModal
CopyButton
RefreshButton


## Dashboard

text
DashboardKpiCard
GalponStatusCard
GalponGrid
GlobalAlertsSummary
GatewayOfflineSummary


## Galpones

text
GalponTable
GalponForm
GalponDetailHeader
GalponTabs
ProvisioningPanel
MqttTopicsTable
LocalEnvironmentBlock


## Lecturas

text
ReadingCard
ReadingGauge
LatestReadingPanel
SensorReadingTable
HistoricalChart


## Actuadores

text
ActuatorTable
ActuatorStatusCard
ProgrammingForm
ManualControlButton
SyncStatusBadge


## Alarmas

text
AlarmTable
AlarmSeverityBadge
AlarmFilters
AlarmTimeline


---

# 12. Endpoints conocidos hasta ahora

## Dashboard

http
GET /api/dashboard/general


## Provisioning

http
GET /api/provisioning/galpones
GET /api/provisioning/galpones/{id}
POST /api/provisioning/galpones


El body exacto del POST debe verificarse en el backend.

## Galpón

http
GET /api/galpones/{id}/lecturas/latest
GET /api/galpones/{id}/sensores
GET /api/galpones/{id}/gateways


## Control

http
GET /api/galpones/{id}/control/commands/pending


## Programación de extractores

http
PUT /api/galpones/{galponId}/extractors/{extractorId}/programming


Ejemplo:

json
{
  "temperatureOn": 30.0,
  "temperatureOff": 27.5
}


## Alarmas

http
GET /api/alarms/active


---

# 13. Endpoints que el frontend debe pedir validar

Antes de iniciar el frontend, se deben revisar en el backend central los controllers para confirmar:

* Endpoints exactos de creación de galpón.
* Body exacto para POST /api/provisioning/galpones.
* Endpoints para editar galpón.
* Endpoints para eliminar/desactivar galpón.
* Endpoints para crear sensores.
* Endpoints para editar sensores.
* Endpoints para actuadores manuales.
* Endpoints para programación de criadoras.
* Endpoints para programación de bombas.
* Endpoints para reglas de alarma.
* Endpoints para parvadas.
* Endpoints para mortalidad.
* Endpoints para peso.
* Endpoints para consumo.
* Endpoints para historial de lecturas.
* Endpoints para eventos de sincronización.

---

# 14. Prioridad de desarrollo del frontend

## Fase 1 — Base visual

* Layout.
* Sidebar.
* Topbar.
* Dashboard general.
* Tarjetas de galpones.
* Consumo de GET /api/dashboard/general.

## Fase 2 — Galpones

* Listado de galpones.
* Detalle de galpón.
* Provisioning de galpón.
* Variables de entorno copiables.
* Topics MQTT copiables.

## Fase 3 — Alta de galpones

* Formulario de nuevo galpón.
* Creación vía backend central.
* Vista posterior de provisioning.

## Fase 4 — Monitoreo

* Lecturas por galpón.
* Sensores por galpón.
* Gateways por galpón.
* Alarmas activas.

## Fase 5 — Control

* Actuadores.
* Programación de extractores.
* Sincronización central-local.
* Estados de ACK.

## Fase 6 — Producción

* Parvadas.
* Mortalidad.
* Peso.
* Consumo.
* Históricos.

---

# 15. Consideraciones importantes para el frontend

## Manejo de errores

El backend puede responder errores como:

json
{
  "error": "Galpón no encontrado: 2"
}


El frontend debe mostrar mensajes amigables:

text
El galpón solicitado no existe o todavía no ha sido creado.


## Galpón sin lecturas

Si ultimaLectura o lecturaActual es null, mostrar:

text
Sin lecturas registradas.


## Galpón sin parvada

Si parvada es null, mostrar:

text
Este galpón no tiene parvada activa.


## Gateway sin datos

Si gatewayEstado es SIN_DATOS, mostrar:

text
El backend local aún no ha reportado conexión.


## Programación pendiente

Si el backend local no está conectado, mostrar:

text
La configuración quedó guardada en el servidor central y se sincronizará cuando el backend local se conecte.


---

# 16. Objetivo final del frontend

El frontend debe permitir que un usuario pueda:

text
1. Entrar al dashboard central.
2. Ver todos los galpones.
3. Crear un nuevo galpón.
4. Obtener la configuración para el backend local.
5. Confirmar que el gateway local se conectó.
6. Consultar lecturas.
7. Ver alertas.
8. Programar actuadores.
9. Confirmar sincronización central-local.
10. Administrar la operación multi-galpón desde una sola plataforma.


---

# 17. Estado actual del backend central

Actualmente el backend central ya permite:

text
Dashboard general multi-galpón.
Provisioning de galpones.
Consulta de galpón individual por provisioning.
Integración con PostgreSQL.
Integración con MQTT.
Publicación de programación.
Recepción de ACK de programación.
Escucha de eventos de sincronización.
Soporte para múltiples galpones.


En la VM se verificó que:

text
GET /api/provisioning/galpones funciona.
GET /api/provisioning/galpones/{id} funciona si el galpón existe.
GET /api/dashboard/general funciona.


Si un galpón todavía no existe, el backend responde:

json
{
  "error": "Galpón no encontrado: 2"
}


Esto debe manejarse correctamente en el frontend