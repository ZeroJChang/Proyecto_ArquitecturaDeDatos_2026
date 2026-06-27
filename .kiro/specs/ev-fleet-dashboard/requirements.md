# Documento de Requerimientos

## Introducción

La plataforma ACME EV Data Platform requiere una aplicación web full-stack que permita a sucursales, propietarios y administradores consultar datos de vehículos eléctricos. El backend consulta datos ya procesados por los pipelines Spark existentes (GPS en PostgreSQL/Supabase, estado operacional en MongoDB Atlas). La aplicación implementa control de acceso por roles (ADMIN, BRANCH_USER, OWNER) y ofrece dashboards diferenciados, consulta de vehículos, eventos GPS, estados operacionales y descarga CSV de datos GPS para propietarios.

## Glosario

- **Sistema**: La aplicación web full-stack compuesta por el backend NestJS y el frontend React
- **Backend**: API REST construida con NestJS 11, TypeORM y conexión a PostgreSQL/Supabase y MongoDB Atlas
- **Frontend**: Aplicación SPA construida con React 19, MUI v9 y React Router 7
- **Auth_Module**: Módulo de autenticación del backend que gestiona login y emisión de tokens JWT
- **GPS_Module**: Módulo del backend que consulta eventos GPS almacenados en PostgreSQL
- **Status_Module**: Módulo del backend que consulta eventos de estado operacional almacenados en MongoDB Atlas
- **Vehicle_Module**: Módulo del backend que gestiona consultas de vehículos y sus relaciones
- **Branch_Module**: Módulo del backend que gestiona consultas relacionadas con sucursales
- **User**: Entidad que representa a un usuario registrado en el sistema con un rol asignado
- **Branch**: Entidad que representa una sucursal de ACME EV asociada a una región o país
- **Vehicle**: Entidad que representa un vehículo eléctrico identificado por su VIN
- **VIN**: Vehicle Identification Number, identificador único de 17 caracteres de un vehículo
- **GPS_Event**: Registro almacenado en PostgreSQL con VIN, fecha/hora, latitud y longitud de un vehículo
- **Status_Event**: Documento almacenado en MongoDB Atlas con información de estado operacional de un vehículo (códigos de falla, nivel de batería, estado del motor)
- **Vehicle_Owner**: Relación entre un User con rol OWNER y uno o más vehículos de su propiedad
- **ADMIN**: Rol con acceso global a toda la información de la plataforma
- **BRANCH_USER**: Rol con acceso limitado a vehículos y estados de la sucursal asignada
- **OWNER**: Rol con acceso limitado a datos GPS de sus propios vehículos, con capacidad de descarga CSV
- **JWT**: JSON Web Token utilizado para autenticación y transporte de claims de rol y usuario
- **CSV**: Formato de archivo Comma-Separated Values utilizado para exportar datos GPS
- **Guard**: Componente de NestJS que intercepta solicitudes para verificar autenticación y autorización

## Requerimientos

### Requerimiento 1: Autenticación de Usuarios

**User Story:** Como usuario del sistema, quiero autenticarme con mis credenciales, para acceder a las funcionalidades correspondientes a mi rol.

#### Criterios de Aceptación

1. WHEN un User envía credenciales válidas (email y contraseña) al endpoint de login, THE Auth_Module SHALL retornar un JWT que contenga el identificador del User, su rol y el identificador de Branch asociado (si aplica)
2. WHEN un User envía credenciales inválidas al endpoint de login, THE Auth_Module SHALL retornar un código HTTP 401 con un mensaje descriptivo de error
3. THE Auth_Module SHALL validar que el email tenga formato válido y que la contraseña no esté vacía antes de procesar la solicitud de login
4. WHEN un request llega a un endpoint protegido sin un JWT válido en el header Authorization, THE Backend SHALL retornar un código HTTP 401
5. WHEN un JWT ha expirado, THE Auth_Module SHALL retornar un código HTTP 401 con un mensaje indicando que el token ha expirado

### Requerimiento 2: Control de Acceso por Rol

**User Story:** Como administrador del sistema, quiero que cada usuario solo acceda a la información permitida por su rol, para garantizar la seguridad de los datos.

#### Criterios de Aceptación

1. WHILE un User tiene rol ADMIN, THE Backend SHALL permitir acceso a todos los endpoints de consulta del sistema
2. WHILE un User tiene rol BRANCH_USER, THE Backend SHALL permitir acceso únicamente a los endpoints de consulta de vehículos y estados de la Branch asignada al User
3. WHILE un User tiene rol OWNER, THE Backend SHALL permitir acceso únicamente a los endpoints de consulta y descarga de GPS_Event de los Vehicle asociados al User mediante Vehicle_Owner
4. WHEN un User intenta acceder a un recurso que no corresponde a su rol, THE Backend SHALL retornar un código HTTP 403 con un mensaje descriptivo
5. WHEN un User con rol BRANCH_USER intenta consultar vehículos de una Branch diferente a la asignada, THE Backend SHALL retornar un código HTTP 403
6. WHEN un User con rol OWNER intenta consultar GPS_Event de un Vehicle que no le pertenece, THE Backend SHALL retornar un código HTTP 403

### Requerimiento 3: Dashboard de Administrador

**User Story:** Como administrador, quiero ver métricas generales de operación de la plataforma, para monitorear el estado global de la flota.

#### Criterios de Aceptación

1. WHEN un User con rol ADMIN accede al dashboard, THE Frontend SHALL mostrar el total de vehículos registrados, el total de sucursales activas y el total de usuarios del sistema
2. WHEN un User con rol ADMIN accede al dashboard, THE Backend SHALL retornar métricas agregadas consultando PostgreSQL para conteos de entidades
3. WHEN un User con rol ADMIN accede al dashboard, THE Frontend SHALL mostrar un resumen de vehículos con códigos de falla activos obtenidos de MongoDB Atlas

### Requerimiento 4: Dashboard de Sucursal

**User Story:** Como usuario de sucursal, quiero consultar el estado de los vehículos asignados a mi sucursal, para planificar mantenimientos.

#### Criterios de Aceptación

1. WHEN un User con rol BRANCH_USER accede al dashboard, THE Frontend SHALL mostrar la lista de Vehicle asociados a la Branch del User
2. WHEN un User con rol BRANCH_USER accede al dashboard, THE Backend SHALL retornar únicamente los Vehicle cuyo campo branch_id coincida con la Branch asignada al User
3. WHEN un User con rol BRANCH_USER selecciona un Vehicle de la lista, THE Frontend SHALL mostrar el último Status_Event conocido del Vehicle incluyendo nivel de batería, estado del motor y códigos de falla
4. WHEN un User con rol BRANCH_USER aplica filtros de búsqueda, THE Backend SHALL aceptar filtros por VIN parcial, estado operacional y rango de fechas

### Requerimiento 5: Filtrado de Vehículos con Códigos de Falla

**User Story:** Como usuario de sucursal, quiero filtrar vehículos con códigos de falla activos, para priorizar la revisión técnica.

#### Criterios de Aceptación

1. WHEN un User con rol BRANCH_USER solicita vehículos con fallas, THE Status_Module SHALL consultar MongoDB Atlas y retornar únicamente los Vehicle de la Branch del User que tengan códigos de falla activos en su último Status_Event
2. WHEN el Status_Module retorna vehículos con fallas, THE Frontend SHALL mostrar una tabla con VIN, descripción de la falla y fecha del último reporte de estado
3. IF no existen vehículos con códigos de falla activos en la Branch del User, THEN THE Frontend SHALL mostrar un mensaje indicando que no hay vehículos con fallas pendientes

### Requerimiento 6: Consulta de Eventos GPS por VIN

**User Story:** Como propietario, quiero consultar el historial GPS de mi vehículo por rango de fechas, para tener trazabilidad de mis rutas.

#### Criterios de Aceptación

1. WHEN un User con rol OWNER solicita eventos GPS de un Vehicle que le pertenece con un rango de fechas válido, THE GPS_Module SHALL consultar PostgreSQL y retornar los GPS_Event que coincidan con el VIN y el rango de fechas proporcionado
2. THE GPS_Module SHALL retornar cada GPS_Event con los campos: VIN, fecha/hora (timestamp con zona horaria), latitud (decimal con 6 decimales de precisión) y longitud (decimal con 6 decimales de precisión)
3. WHEN el rango de fechas proporcionado es inválido (fecha inicio posterior a fecha fin), THE GPS_Module SHALL retornar un código HTTP 400 con un mensaje descriptivo
4. WHEN no existen GPS_Event para el VIN y rango de fechas solicitado, THE GPS_Module SHALL retornar una lista vacía con código HTTP 200
5. THE GPS_Module SHALL paginar los resultados con un máximo de 100 registros por página y aceptar parámetros de paginación (page, limit)

### Requerimiento 7: Descarga CSV de Datos GPS

**User Story:** Como propietario, quiero descargar el historial GPS de mi vehículo en formato CSV, para tener un respaldo offline de mis rutas.

#### Criterios de Aceptación

1. WHEN un User con rol OWNER solicita la descarga CSV de GPS_Event de un Vehicle que le pertenece, THE GPS_Module SHALL generar un archivo CSV con las columnas: VIN, datetime, latitude, longitude
2. WHEN el GPS_Module genera el archivo CSV, THE Backend SHALL retornar el archivo con Content-Type "text/csv" y header Content-Disposition con nombre de archivo en formato "{VIN}_{fecha_inicio}_{fecha_fin}.csv"
3. THE GPS_Module SHALL aplicar el mismo filtro de rango de fechas utilizado en la consulta de GPS_Event para la generación del CSV
4. IF el resultado de la consulta para el CSV no contiene registros, THEN THE GPS_Module SHALL retornar un código HTTP 404 con un mensaje indicando que no hay datos para el rango solicitado
5. WHEN un User con rol OWNER solicita descarga CSV de un Vehicle que no le pertenece, THE Backend SHALL retornar un código HTTP 403

### Requerimiento 8: Consulta de Estado Operacional por VIN

**User Story:** Como usuario de sucursal, quiero consultar el historial de estado operacional de un vehículo, para analizar patrones de fallas.

#### Criterios de Aceptación

1. WHEN un User autorizado solicita el estado operacional de un Vehicle por VIN con un rango de fechas, THE Status_Module SHALL consultar MongoDB Atlas y retornar los Status_Event que coincidan con el VIN y el rango proporcionado
2. THE Status_Module SHALL retornar cada Status_Event con los campos: VIN, timestamp, battery_level, engine_status, fault_codes y odometer
3. WHEN el rango de fechas proporcionado es inválido, THE Status_Module SHALL retornar un código HTTP 400 con un mensaje descriptivo
4. THE Status_Module SHALL paginar los resultados con un máximo de 50 registros por página y aceptar parámetros de paginación (page, limit)
5. WHILE un User tiene rol BRANCH_USER, THE Status_Module SHALL validar que el Vehicle consultado pertenezca a la Branch del User antes de retornar resultados

### Requerimiento 9: Dashboard de Propietario

**User Story:** Como propietario, quiero ver la lista de mis vehículos y acceder rápidamente a la consulta GPS, para gestionar la información de mi flota personal.

#### Criterios de Aceptación

1. WHEN un User con rol OWNER accede al dashboard, THE Frontend SHALL mostrar la lista de Vehicle asociados al User mediante la relación Vehicle_Owner
2. WHEN un User con rol OWNER selecciona un Vehicle de su lista, THE Frontend SHALL mostrar opciones para consultar GPS_Event por rango de fechas y descargar CSV
3. THE Backend SHALL retornar únicamente los Vehicle donde exista un registro en Vehicle_Owner que vincule al User autenticado con el Vehicle

### Requerimiento 10: Documentación de API

**User Story:** Como desarrollador, quiero que todos los endpoints estén documentados con Swagger/OpenAPI, para facilitar la integración y la defensa del proyecto universitario.

#### Criterios de Aceptación

1. THE Backend SHALL exponer la documentación Swagger en la ruta /docs
2. THE Backend SHALL documentar cada endpoint con descripción, parámetros de entrada, respuestas posibles (incluyendo códigos de error) y ejemplos de respuesta
3. THE Backend SHALL agrupar los endpoints por módulo (auth, vehicles, gps, status, branches) en la documentación Swagger

### Requerimiento 11: Interfaz de Usuario Responsiva

**User Story:** Como usuario del sistema, quiero acceder a la plataforma desde dispositivos de diferentes tamaños, para consultar información desde cualquier lugar.

#### Criterios de Aceptación

1. THE Frontend SHALL renderizar correctamente en resoluciones de escritorio (1280px o superior) y tablet (768px o superior)
2. THE Frontend SHALL utilizar componentes MUI v9 con el sistema de grid responsivo para adaptar el layout según el tamaño de pantalla
3. THE Frontend SHALL mostrar mensajes de carga mientras se obtienen datos del Backend y mensajes de error descriptivos cuando una solicitud falla

### Requerimiento 12: Validación de Entradas

**User Story:** Como desarrollador del sistema, quiero que todas las entradas de usuario sean validadas, para prevenir datos malformados y errores inesperados.

#### Criterios de Aceptación

1. THE Backend SHALL validar todos los parámetros de entrada utilizando class-validator y retornar código HTTP 400 con detalles de los campos inválidos cuando la validación falle
2. WHEN un VIN es proporcionado como parámetro, THE Backend SHALL validar que tenga exactamente 17 caracteres alfanuméricos
3. WHEN un rango de fechas es proporcionado, THE Backend SHALL validar que ambas fechas tengan formato ISO 8601 válido y que la fecha de inicio sea anterior o igual a la fecha de fin
4. THE Frontend SHALL validar los campos del formulario de login (formato de email y contraseña no vacía) antes de enviar la solicitud al Backend
