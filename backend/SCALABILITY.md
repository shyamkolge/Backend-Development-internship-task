# Scalability Plan

This document explains the current scalability posture of the project and a practical roadmap to scale it safely.

## Current Architecture

Frontend:
- React + Vite application
- Role-aware routing (`/auth`, `/tasks`, `/admin`)

Backend:
- Node.js + Express REST API
- Modular routing (`auth`, `tasks`, `admin`)
- JWT auth + refresh flow with httpOnly cookies
- Validation via Joi
- Request logging via Morgan + Winston

Database:
- PostgreSQL
- Connection pooling via `pg`
- Indexed tables for core access patterns

Containerization:
- Dockerfiles for backend and frontend
- Docker Compose for local multi-service orchestration
- Health checks and restart policies in compose

## Current Bottlenecks

At moderate traffic, likely bottlenecks are:
1. Single backend process (CPU and event loop contention)
2. Database read pressure on task lists and dashboard analytics
3. No cache layer for repeated read-heavy endpoints
4. Single PostgreSQL instance without read replicas

## Scaling Strategy

### Phase 1: Vertical + Query Optimization

Goal: support stable traffic growth with minimal architecture changes.

Actions:
1. Increase backend CPU/RAM limits and tune Node runtime in production.
2. Tune PostgreSQL settings for connection limits and shared buffers.
3. Add targeted composite indexes (for example user_id + status on tasks).
4. Use pagination for task list and admin dashboard recent records.
5. Add query timing metrics to identify slow endpoints.

Expected result:
- Better throughput and lower latency without major refactor.

### Phase 2: Horizontal API Scaling

Goal: handle more concurrent users.

Actions:
1. Run multiple backend replicas behind a load balancer.
2. Keep backend stateless (already compatible with JWT cookie strategy).
3. Use sticky sessions only if future features require server-side session state.
4. Add centralized logging aggregation (ELK/OpenSearch/Datadog).

Expected result:
- Linear-ish scaling on API tier for CPU-bound and IO-bound workloads.

### Phase 3: Caching Layer

Goal: reduce database load and improve response times.

Actions:
1. Introduce Redis cache for read-heavy endpoints:
   - task list by user + filter
   - admin dashboard summary counts
2. Use short TTL (30-120 seconds) and explicit invalidation on mutations.
3. Add cache hit/miss metrics.

Expected result:
- Faster p95 latency and lower PostgreSQL QPS during peak reads.

### Phase 4: Database Evolution

Goal: scale persistence safely.

Actions:
1. Introduce read replicas for dashboard/reporting workloads.
2. Add migration tooling for schema evolution (e.g., Prisma Migrate, Knex, or Flyway).
3. Implement backup/restore drills and PITR (point-in-time recovery).
4. Consider table partitioning for very large audit/event tables.

Expected result:
- Better reliability and read scalability at higher data volume.

## Security and Scalability Together

1. Keep short-lived access tokens and secure refresh rotation.
2. Add rate limiting for auth and sensitive routes.
3. Add abuse detection and lockout policies for repeated failed logins.
4. Rotate secrets and enforce environment-specific secure cookie settings.

## Deployment Readiness Checklist

1. Environment-specific config (dev/stage/prod)
2. Health checks and restart policies enabled
3. Structured logs with retention policy
4. Monitoring dashboards (error rate, latency, saturation)
5. Alerts for high error rate and DB connection exhaustion
6. Automated backups and restore verification
7. Blue/green or rolling deployment strategy

## Recommended Metrics

Application metrics:
- Request rate (RPS)
- p50/p95/p99 latency
- Error rate by route
- Auth failure rate

System metrics:
- CPU and memory utilization
- Event loop lag
- Container restarts

Database metrics:
- Active connections
- Slow query count
- Lock wait time
- Replica lag (when replicas are added)

## Suggested Next Steps (Near-Term)

1. Add pagination to `GET /api/v1/tasks` and admin recent lists.
2. Add route-level rate limiting for `/api/v1/auth/login` and `/api/v1/auth/register`.
3. Add Redis for admin dashboard and task list caching.
4. Add CI checks for lint + build + smoke API tests.
