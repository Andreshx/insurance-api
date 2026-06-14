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

```
```
