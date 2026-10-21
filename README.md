<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">

<img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />

<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />

<img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />

<img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" />

<img src="https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge" />

<img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" />

<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />

</p>

# Insurance API

API para gestión de pólizas de seguros desarrollada bajo Arquitectura Hexagonal, aplicando principios SOLID, Código Limpio y los patrones de diseño Factory Method, Strategy, Builder, State, Observer y Singleton.

---

# Tecnologías utilizadas

* NestJS
* TypeORM
* PostgreSQL
* RabbitMQ
* Swagger / OpenAPI
* Docker Compose

---

# Arquitectura

El proyecto sigue Arquitectura Hexagonal (Ports & Adapters).

```text
src
├── customers
│   ├── domain
│   ├── application
│   └── infrastructure
│
├── policies
│   ├── domain
│   ├── application
│   └── infrastructure
│
├── notifications
│
├── shared
│   ├── events
│   ├── filters
│   └── singletons
│
└── app.module.ts
```

## Domain

Contiene las reglas de negocio.

* Models
* Value Objects
* Domain Exceptions
* Domain Ports
* States

El dominio no depende de NestJS, TypeORM, RabbitMQ ni ninguna tecnología de infraestructura.

## Application

Contiene:

* Use Cases
* DTOs
* Factories
* Strategies
* Builders

## Infrastructure

Contiene:

* Controllers
* TypeORM Entities
* Mappers
* Repository Implementations
* RabbitMQ Adapters

---

# Patrones de Diseño Implementados

## Factory Method

Responsable de crear la cobertura inicial según el ramo de la póliza.

Ubicación:

```text
src/policies/application/factories
```

Factories implementadas:

* AutoPolicyFactory
* LifePolicyFactory
* HomePolicyFactory
* HealthPolicyFactory

El caso de uso selecciona la factory mediante un registro basado en Map, evitando el uso de switch.

---

## Strategy

Responsable del cálculo de la prima mensual.

Ubicación:

```text
src/policies/application/strategies
```

Estrategias implementadas:

* StandardRatingStrategy
* RiskBasedRatingStrategy
* LoyaltyRatingStrategy

La estrategia se selecciona mediante Map, evitando switch o if por tipo de estrategia.

### Fórmulas

STANDARD

```text
monthlyPremium = basePremium
```

RISK_BASED

```text
monthlyPremium = basePremium × (1 + riskScore / 100)
```

LOYALTY

```text
monthlyPremium = basePremium × 0.85
```

---

## Builder

Responsable de construir el agregado Policy.

Ubicación:

```text
src/policies/application/builders
```

Valida:

* customerId
* policyNumber
* branch
* ratingStrategy
* coverage
* monthlyPremium
* riskProfile

Asigna automáticamente:

```text
QUOTED
```

como estado inicial.

---

## State

Responsable del ciclo de vida de la póliza.

Ubicación:

```text
src/policies/domain/states
```

Estados:

* QuotedState
* IssuedState
* ActiveState
* SuspendedState
* CancelledState

Transiciones permitidas:

```text
QUOTED     → ISSUED | CANCELLED

ISSUED     → ACTIVE | CANCELLED

ACTIVE     → SUSPENDED | CANCELLED

SUSPENDED  → ACTIVE | CANCELLED

CANCELLED  → terminal
```

Las transiciones son responsabilidad de cada estado y no del caso de uso.

---

## Observer

Responsable de publicar eventos de dominio.

Publisher:

```text
src/shared/events
```

Eventos publicados:

* policy.issued
* policy.activated
* policy.suspended
* policy.reactivated
* policy.cancelled

Consumers:

### NotificationsConsumer

Responsabilidad:

* Simular el envío de notificaciones al cliente.

### AuditConsumer

Responsabilidad:

* Registrar trazabilidad y auditoría de cambios de estado.

---

## Singleton

Implementación:

```text
src/shared/singletons/policy-number-sequencer.ts
```

### ¿Por qué utilizar Singleton?

El generador de números de póliza debe existir una única vez para evitar que múltiples instancias generen secuencias inconsistentes.

Ejemplo:

```text
POL-20260613-000001
POL-20260613-000002
POL-20260613-000003
```

### Riesgo mitigado

Sin Singleton podrían existir múltiples contadores en memoria produciendo números repetidos o inconsistentes.

---

# Persistencia

Base de datos:

```text
PostgreSQL
```

La persistencia utiliza:

* TypeORM
* Mapper Pattern
* Repository Pattern

Separando:

```text
PolicyModel
```

de

```text
PolicyTypeormEntity
```

Coverage y RiskProfile se almacenan como JSONB.

---

# Endpoints

## Customers

### Crear cliente

```http
POST /api/customers
```

### Obtener cliente

```http
GET /api/customers/:id
```

### Actualizar cliente

```http
PATCH /api/customers/:id
```

Body (ambos campos son opcionales):

```json
{
  "name": "Andres Espinosa",
  "email": "andres@example.com"
}
```

Devuelve `404` si el cliente no existe, `409` si el correo ya pertenece a otro cliente y `400` si el cuerpo no es válido.

---

## Policies

### Crear póliza

```http
POST /api/policies
```

### Obtener póliza

```http
GET /api/policies/:id
```

### Obtener pólizas por cliente

```http
GET /api/policies/customer/:id
```

### Cambiar estado

```http
PATCH /api/policies/:id/status
```

Body:

```json
{
  "targetStatus": "ISSUED"
}
```

---

# Swagger

Disponible en:

```text
http://localhost:3000/api/docs
```

---

# RabbitMQ Management

Disponible en:

```text
http://localhost:15672
```

Usuario:

```text
admin
```

Contraseña:

```text
admin
```

---

# Variables de entorno

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=insurance_db

RABBITMQ_URL=amqp://admin:admin@localhost:5672
```

---

# Ejecución

Instalar dependencias

```bash
npm install
```

Levantar infraestructura

```bash
docker compose up -d
```

Ejecutar aplicación

```bash
npm run start:dev
```

---

# Casos probados

## Factory + Strategy

* AUTO + STANDARD
* LIFE + RISK_BASED
* HOME + LOYALTY
* HEALTH + STANDARD

## State

```text
QUOTED
→ ISSUED
→ ACTIVE
→ SUSPENDED
→ ACTIVE
→ CANCELLED
```

## Observer

Verificado mediante:

* NotificationsConsumer
* AuditConsumer

## Validaciones

* RISK_BASED sin riskScore → 400
* LOYALTY sin antigüedad suficiente → 400
* Transiciones inválidas → 400
* Recursos inexistentes → 404
* Email duplicado → 409
* UUID inválido en la URL → 400

---

# Frontend

En la carpeta `frontend/` se encuentra la aplicación React (Vite + TypeScript + Tailwind) que consume esta API.

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Disponible en:

```text
http://localhost:5173
```

El CORS de la API está configurado para aceptar ese origen.

Funcionalidades de la interfaz:

* **Clientes**: listar, crear, ver detalle y editar nombre/correo (usa `PATCH /api/customers/:id`).
* **Pólizas**: listar, crear y cambiar estado. El cambio de estado también se puede hacer directamente desde la tabla de pólizas del detalle del cliente, mostrando solo las transiciones válidas del state machine del backend.
* **Notificaciones**: cada acción exitosa (crear cliente, crear póliza, editar cliente, cambiar estado) muestra un toast en la esquina superior derecha; los errores de la API se muestran como toast de error.

---

# Tests

Requieren la infraestructura levantada (`docker compose up -d`: PostgreSQL y RabbitMQ).

```bash
# Unitarios (no requieren Docker)
npm run test:unit

# Integración (requieren PostgreSQL; corren en serie contra la misma BD)
npm run test:integration

# Todos los de src (unitarios + integración, en serie)
npm test

# End-to-end (requieren PostgreSQL y RabbitMQ; en serie por diseño: comparten BD)
npm run test:e2e
```

Cobertura actual: 24 suites / 112 tests unitarios y de integración + 2 suites / 49 tests e2e.

Los e2e reconstruyen la aplicación por test (incluye `PolicyNumberInitializer`), por lo que además validan la continuidad del número de póliza tras un reinicio real del API.

## E2E del frontend (Playwright)

Pruebas de interfaz en `frontend/e2e/` con Playwright (Chromium). Cubren los flujos de cliente y póliza end-to-end sobre el navegador real.

Requisitos: backend corriendo en `http://localhost:3000` e infraestructura levantada (`docker compose up -d`). Playwright compila el frontend y lo sirve con `vite preview` en `:5173` automáticamente.

```bash
cd frontend
npx playwright install chromium   # una sola vez
npm run test:e2e                  # ejecuta la suite (headless)
npm run test:e2e:ui               # modo interactivo
npm run test:e2e:report           # abre el reporte HTML del último run
```

Cobertura actual: 14 tests. Incluyen navegación, creación de cliente con toast, validación de formulario (Zod), listado, edición de cliente (éxito, cancelar y conflicto 409 con toast de error), cambio de estado de póliza inline desde el detalle del cliente con toast, estado final de pólizas canceladas, estado vacío y creación/cambio de estado de póliza desde el detalle.

Cada test siembra sus datos vía API con correos únicos, por lo que la suite puede correr repetidamente sin limpiar la BD.


---

# Limitaciones conocidas

Decisiones conscientes de alcance, identificadas en la revisión de código:

* **Sin autenticación/autorización**: cualquier cliente puede consumir los endpoints. La única protección actual es el CORS restringido al origen del frontend (solo aplica a navegadores). En producción se debe añadir JWT/API keys con guards.
* **Sin patrón Outbox**: el cambio de estado persiste en BD y luego publica el evento en RabbitMQ. Si el broker falla entre ambos pasos, el evento se pierde (el estado en BD no se revierte). Los handlers de error evitan que la API crashee.
* **Secuenciador de números en memoria**: es correcto con una sola instancia del API (el `PolicyNumberInitializer` lo siembra desde BD al arrancar, y la restricción UNIQUE es la red de seguridad). Con múltiples instancias en paralelo podrían generarse números en conflicto; se recomienda mover la secuencia a una tabla en BD si se escala horizontalmente.
* **Sin paginación en listados**: `GET /api/customers` y `GET /api/policies` devuelven todos los registros.
* **Sin helmet ni rate limiting**: pendientes de agregar para un despliegue en producción.

