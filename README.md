# Event-Driven Notification System

A scalable, fault-tolerant notification system built with microservices architecture using Kafka, Redis, and PostgreSQL. This system handles multi-channel notifications (Email & SMS) with features like idempotency, rate limiting, retry mechanisms, and dead-letter queues.

## 🏗️ High-Level Design

![Notification System Architecture](Images/notification_design_1.png)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Design Patterns](#design-patterns)
- [Monitoring](#monitoring)
- [Contributing](#contributing)

## 🎯 Overview

This Event-Driven Notification System is designed to handle high-volume notification processing across multiple channels. It leverages Apache Kafka for event streaming, Redis for caching and rate limiting, and PostgreSQL for persistent storage. The system ensures reliable message delivery with retry mechanisms and dead-letter queue handling.

### Key Capabilities

- **Multi-Channel Support**: Email and SMS notifications
- **Event-Driven Architecture**: Kafka-based message streaming
- **Idempotency**: Prevents duplicate notification processing
- **Rate Limiting**: Controls notification frequency per user
- **Retry Mechanism**: Automatic retry with exponential backoff
- **Dead-Letter Queue**: Handles failed messages for manual intervention
- **Database Persistence**: Tracks notification status and history
- **Monitoring**: Integrated with Kafdrop for Kafka monitoring

## ✨ Features

### Core Features

- ✅ **Event Sourcing**: All notifications are triggered by events
- ✅ **Idempotent Processing**: Duplicate events are automatically filtered
- ✅ **Rate Limiting**: Redis-based rate limiting (configurable per channel)
- ✅ **Retry Logic**: Failed notifications retry with exponential backoff
- ✅ **DLQ Handling**: Persistent failed messages for troubleshooting
- ✅ **Multi-Channel**: Email and SMS support with extensible design
- ✅ **Database Tracking**: Full audit trail of all notifications
- ✅ **Docker Support**: Fully containerized setup

### Reliability Features

- **Guaranteed Delivery**: At-least-once delivery semantics
- **Fault Tolerance**: Service continues even if individual notifications fail
- **Circuit Breaker**: Prevents cascade failures
- **Health Checks**: Service health monitoring
- **Graceful Shutdown**: Proper cleanup on service termination

## 🏛️ Architecture

### System Components

1. **Producer Service**: Generates notification events from various application triggers
2. **Notification Service**: Consumes events and processes notifications
3. **Apache Kafka**: Message broker for event streaming
4. **Redis**: Caching, idempotency checks, and rate limiting
5. **PostgreSQL**: Persistent storage for notification records
6. **Kafdrop**: Web UI for Kafka monitoring

### Data Flow

1. Application event triggers → Producer Service
2. Producer publishes event → Kafka Topic (`notifications`)
3. Notification Service consumes → Event from Kafka
4. Idempotency check → Redis (prevent duplicates)
5. Rate limit check → Redis (enforce limits)
6. Send notification → Email/SMS Service
7. Update status → PostgreSQL Database
8. On failure → Retry Handler → DLQ (if max retries exceeded)

## 🛠️ Tech Stack

### Backend

- **Node.js** (v18+)
- **TypeScript**
- **Prisma ORM** (v6.19.1)
- **KafkaJS** (v2.2.4)
- **Redis** (v5.10.0)
- **Nodemailer** (v7.0.12)

### Infrastructure

- **Apache Kafka** (v7.5.0)
- **Apache Zookeeper** (v7.5.0)
- **PostgreSQL** (via Prisma)
- **Redis** (v7)
- **Docker & Docker Compose**
- **Kafdrop** (Kafka UI)

## 📁 Project Structure

```
.
├── docker-compose.yml          # Docker services configuration
├── README.md                   # Project documentation
├── Images/                     # Architecture diagrams
│   └── notification_design_1.png
│
└── Services/
    ├── notification-service/   # Main notification processor
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── prisma/
    │   │   ├── schema.prisma   # Database schema
    │   │   └── migrations/     # Database migrations
    │   └── src/
    │       ├── index.ts        # Service entry point
    │       ├── consumer/       # Kafka consumers
    │       │   ├── email.consumer.ts
    │       │   └── sms.consumer.ts
    │       ├── db/             # Database layer
    │       │   ├── notification.repo.ts
    │       │   └── prisma.ts
    │       ├── Kafka/          # Kafka configuration
    │       │   ├── consumer.ts
    │       │   └── topic.ts
    │       ├── redis/          # Redis utilities
    │       │   ├── client.ts
    │       │   ├── Idempotency.ts
    │       │   └── ratelimiter.ts
    │       ├── retry/          # Retry mechanism
    │       │   ├── dlqhandler.ts
    │       │   └── retryhandler.ts
    │       ├── service/        # Business logic
    │       │   ├── email.service.ts
    │       │   └── sms.service.ts
    │       └── utils/
    │           └── mailer.ts
    │
    └── producer/               # Event producer service
        ├── Dockerfile
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts
            ├── events/         # Event definitions
            │   ├── signup.event.ts
            │   ├── payment.event.ts
            │   └── alert.event.ts
            └── kafka/
                └── producer.ts
```

## 📦 Prerequisites

- **Node.js** v18 or higher
- **Docker** and **Docker Compose**
- **PostgreSQL** database (or use Prisma's hosted option)
- **SMTP Server** credentials (for email notifications)
- **SMS Gateway** credentials (optional, for SMS)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "2.Event-Driven Notification System"
```

### 2. Set Up Environment Variables

#### Notification Service (.env)

Create `.env` in `Services/notification-service/`:

```env
# Database Configuration (Prisma/PostgreSQL)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# Kafka Configuration
KAFKA_BROKERS="localhost:9092"
KAFKA_GROUP_ID="notification-consumer-group"
KAFKA_TOPIC="notifications"
KAFKA_DLQ_TOPIC="notifications-dlq"

# Redis Configuration
REDIS_HOST="localhost"
REDIS_PORT=6379

# Email Configuration (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourapp.com"

# Rate Limiting Configuration
RATE_LIMIT_EMAIL=10      # Max emails per time window
RATE_LIMIT_SMS=5         # Max SMS per time window
RATE_LIMIT_WINDOW=60     # Time window in seconds

# Retry Configuration
MAX_RETRIES=3
RETRY_DELAY_MS=1000
```

#### Producer Service (.env)

Create `.env` in `Services/producer/`:

```env
# Kafka Configuration
KAFKA_BROKERS="localhost:9092"
KAFKA_TOPIC="notifications"
```

### 3. Start Infrastructure Services

```bash
# Start Kafka, Zookeeper, Redis, and Kafdrop
docker-compose up -d
```

Verify services are running:
```bash
docker-compose ps
```

### 4. Install Dependencies

```bash
# Notification Service
cd Services/notification-service
npm install

# Producer Service
cd ../producer
npm install
```

### 5. Database Setup

```bash
cd Services/notification-service

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### 6. Build TypeScript

```bash
# Notification Service
cd Services/notification-service
npm run build

# Producer Service
cd ../producer
npm run build
```

## ⚙️ Configuration

### Kafka Topics

The system uses two Kafka topics:

- **notifications**: Main topic for notification events
- **notifications-dlq**: Dead-letter queue for failed messages

Topics are auto-created by `kafka-init` service with:
- Partitions: 3 (for parallel processing)
- Replication Factor: 1

### Rate Limiting

Configure in `.env`:
```env
RATE_LIMIT_EMAIL=10      # 10 emails per window
RATE_LIMIT_SMS=5         # 5 SMS per window
RATE_LIMIT_WINDOW=60     # 60 seconds
```

### Retry Strategy

- **Max Retries**: 3 attempts
- **Backoff**: Exponential (1s, 2s, 4s)
- **DLQ**: Messages sent to DLQ after max retries

## 🎮 Usage

### Start the Services

#### Option 1: Run Locally

```bash
# Terminal 1: Start Notification Service
cd Services/notification-service
npm start

# Terminal 2: Start Producer Service
cd Services/producer
npm start
```

<!-- #### Option 2: Docker (Coming Soon)

```bash
docker-compose up --build -->
```

### Produce Notification Events

Edit `Services/producer/src/index.ts` to trigger events:

```typescript
import { signupEvent } from "./events/signup.event";
import { paymentEvent } from "./events/payment.event";
import { alertEvent } from "./events/alert.event";

// Send welcome email on signup
await signupEvent(
  "Welcome to our platform!",
  "user@example.com",
  "+1234567890"
);

// Send payment confirmation
await paymentEvent(
  "Payment of $99.99 received",
  "user@example.com",
  "+1234567890"
);

// Send alert notification
await alertEvent(
  "Critical system alert!",
  "admin@example.com"
);
```

### Monitor the System

- **Kafdrop UI**: http://localhost:9000
  - View topics, partitions, consumer groups
  - Monitor message flow and lag

- **Logs**: Check service logs for processing status
  ```bash
  # Notification service logs
  cd Services/notification-service
  npm start
  ```

## 📚 API Documentation



### Database Schema

#### Notification Model

```prisma
model Notification {
  id         String              @id @default(uuid())
  eventId    String              // Event identifier
  channel    NotificationChannel // EMAIL | SMS
  recipient  String              // Email or phone
  status     NotificationStatus  // PENDING | SENT | FAILED
  retryCount Int                 @default(0)
  lastError  String?
  message    String
  createdAt  DateTime            @default(now())
  updatedAt  DateTime            @updatedAt

  @@unique([eventId, channel])
}
```

## 🎨 Design Patterns

### 1. **Event-Driven Architecture**
- Decoupled services communicate via events
- Asynchronous processing for better scalability

### 2. **Idempotency Pattern**
- Redis-based deduplication using `eventId`
- Prevents duplicate notification sends

### 3. **Retry Pattern**
- Exponential backoff for transient failures
- Maximum retry limit to prevent infinite loops

### 4. **Dead-Letter Queue Pattern**
- Failed messages routed to DLQ for analysis
- Manual intervention for persistent failures

### 5. **Repository Pattern**
- Database access abstracted through repositories
- Clean separation of concerns

### 6. **Consumer Group Pattern**
- Multiple consumers for parallel processing
- Load balancing across partitions

## 📊 Monitoring

### Health Checks

Monitor service health:
- Redis connectivity
- Kafka broker connection
- Database connectivity

### Metrics to Track

1. **Throughput**: Messages processed per second
2. **Latency**: Time from event to notification sent
3. **Error Rate**: Failed notifications percentage
4. **Retry Rate**: Messages requiring retries
5. **DLQ Size**: Failed messages accumulation

### Kafdrop Dashboard

Access at http://localhost:9000:
- Topic message counts
- Consumer lag
- Partition distribution
- Message inspection

## 🔧 Troubleshooting

### Common Issues

**Kafka Connection Failed**
```bash
# Check Kafka is running
docker-compose ps kafka

# Verify broker accessibility
docker exec -it kafka kafka-broker-api-versions --bootstrap-server localhost:29092
```

**Redis Connection Error**
```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli ping
```

**Database Migration Issues**
```bash
# Reset database
npx prisma migrate reset

# Apply migrations
npx prisma migrate deploy
```

**Email Sending Fails**
- Verify SMTP credentials in `.env`
- Check if less secure apps enabled (for Gmail)
- Use app-specific passwords

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 👥 Authors

- Siddhant Munjamkar - Initial work


**Built with ❤️ using Event-Driven Architecture**
