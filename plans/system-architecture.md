# API Monitor - System Architecture

## High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser["Browser / User"]
    end

    subgraph "Next.js Application"
        subgraph "Frontend - Next.js 16"
            Landing["Landing Page"]
            AuthPages["Auth Pages"]
            Dashboard["Dashboard"]
            Endpoints["Endpoints Page"]
            Metrics["Metrics Page"]
            Alerts["Alerts Page"]
            SettingsPage["Settings Page"]
        end

        Middleware["Next.js Middleware"]

        subgraph "API Routes - Server Side"
            EndpointsAPI["GET, POST"]
            HealthCheckAPI["POST"]
            AlertsAPI["POST, PATCH"]
            MetricsAPI["GET"]
        end

        subgraph "Supabase Client Layer"
            ServerClient["Server Supabase Client"]
            BrowserClient["Browser Supabase Client"]
            ProxyClient["Middleware Proxy"]
        end
    end

    subgraph "Vercel Infrastructure"
        Cron["Cron Jobs/Scheduled Health Checks"]
    end

    subgraph "Supabase Cloud"
        SupaAuth["User Authentication"]
        SupaDB[("PostgreSQL with RLS")]
    end

    subgraph "External"
        MonitoredAPIs["Monitored API Endpoint"]
    end


    Browser -->|HTTPS| Middleware
    Middleware -->|Session Check| ProxyClient
    ProxyClient -->|Refresh Token| SupaAuth

    Browser --> Landing
    Browser --> AuthPages
    Browser --> Dashboard
    Browser --> Endpoints
    Browser --> Metrics
    Browser --> Alerts
    Browser --> SettingsPage

    AuthPages -->|Sign Up / Login| BrowserClient
    BrowserClient -->|Auth Requests| SupaAuth

    Dashboard -->|Fetch Data| EndpointsAPI
    Endpoints -->|CRUD| EndpointsAPI
    Alerts -->|Manage| AlertsAPI
    Metrics -->|Query| MetricsAPI

    EndpointsAPI --> ServerClient
    HealthCheckAPI --> ServerClient
    AlertsAPI --> ServerClient
    MetricsAPI --> ServerClient

    ServerClient -->|Queries with RLS| SupaDB

    Cron -->|POST with Bearer Token| HealthCheckAPI
    HealthCheckAPI -->|Fetch + Measure| MonitoredAPIs
    HealthCheckAPI -->|Store Results| SupaDB
```

## Database Schema - Entity Relationship Diagram

```mermaid
erDiagram
    endpoints {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        text name
        text url
        text method
        int check_interval_seconds
        int timeout_seconds
        int expected_status_code
        boolean is_active
        text description
    }

    health_checks {
        uuid id PK
        timestamp created_at
        uuid endpoint_id FK
        int status_code
        int response_time_ms
        boolean is_healthy
        text error_message
        int response_size_bytes
    }

    alerts {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        uuid endpoint_id FK
        text alert_type
        numeric threshold_value
        boolean is_active
        int trigger_count
        int consecutive_failures
    }

    alert_history {
        uuid id PK
        timestamp created_at
        uuid alert_id FK
        timestamp triggered_at
        text message
        timestamp resolved_at
    }

    endpoints ||--o{ health_checks : has
    endpoints ||--o{ alerts : has
    alerts ||--o{ alert_history : has
```

## Request Flow - Health Check Cycle

```mermaid
sequenceDiagram
    participant Cron as Cron Job
    participant HC as /api/health-check
    participant DB as Supabase PostgreSQL
    participant API as Monitored API

    Cron->>HC: POST with Bearer token
    HC->>HC: Verify HEALTH_CHECK_SECRET
    HC->>DB: SELECT active endpoints
    DB-->>HC: List of endpoints

    loop For each endpoint
        HC->>API: HTTP GET with 10s timeout
        API-->>HC: Response or timeout
        HC->>DB: INSERT health_check result
    end

    HC-->>Cron: JSON summary of results
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User as Browser
    participant MW as Next.js Middleware
    participant Proxy as Supabase Proxy
    participant Auth as Supabase Auth
    participant Layout as Dashboard Layout

    User->>MW: Request /dashboard/*
    MW->>Proxy: updateSession
    Proxy->>Auth: getUser - validate session
    Auth-->>Proxy: User or null
    Proxy-->>MW: Response with refreshed cookies

    MW->>Layout: Render dashboard layout
    Layout->>Auth: getUser - server side
    Auth-->>Layout: User data
    alt No user
        Layout-->>User: Redirect to /auth/login
    else Authenticated
        Layout-->>User: Render dashboard with sidebar
    end
```

## Component Architecture

```mermaid
graph TD
    subgraph Pages
        DashPage[Dashboard Page]
        EndPage[Endpoints Page]
        MetPage[Metrics Page]
        AlertPage[Alerts Page]
        SetPage[Settings Page]
    end

    subgraph Shared Components
        EndList[EndpointsList]
        MetChart[MetricsChart - Recharts]
        StatusBadge[StatusBadge]
    end

    subgraph UI Library - shadcn/ui
        Card[Card]
        Button[Button]
        Badge[Badge]
        Table[Table]
        Dialog[Dialog]
        Tabs[Tabs]
        Toast[Toast/Sonner]
    end

    DashPage --> EndList
    DashPage --> StatusBadge
    EndPage --> EndList
    EndPage --> StatusBadge
    MetPage --> MetChart
    MetPage --> StatusBadge

    EndList --> Card
    EndList --> Badge
    EndList --> Button
    MetChart --> Card
    StatusBadge --> Badge
```

## Technology Stack Summary

| Layer                  | Technology                                  |
| ---------------------- | ------------------------------------------- |
| **Frontend Framework** | Next.js 16, React 19, TypeScript            |
| **UI Components**      | shadcn/ui, Tailwind CSS                     |
| **Charts**             | Recharts                                    |
| **Database**           | Supabase PostgreSQL with Row Level Security |
| **Authentication**     | Supabase Auth via `@supabase/ssr`           |
| **Hosting**            | Vercel with Cron Jobs                       |
| **Package Manager**    | pnpm                                        |

## Key Architectural Decisions

1. **Server-side Supabase clients** are created per-request in [`createClient()`](lib/supabase/server.ts:9) to support Vercel Fluid Compute — no global singletons.
2. **Middleware** at [`middleware.ts`](middleware.ts:4) refreshes auth sessions on every request via the [`updateSession()`](lib/supabase/proxy.ts:4) proxy.
3. **Health checks** are triggered externally via [`POST /api/health-check`](app/api/health-check/route.ts:40) secured by a `HEALTH_CHECK_SECRET` bearer token, designed for Vercel Cron invocation.
4. **RLS policies** in [`001_create_monitoring_schema.sql`](scripts/001_create_monitoring_schema.sql:59) are currently set to public access for all tables — intended to be tightened for production.
5. **Dashboard layout** at [`app/dashboard/layout.tsx`](app/dashboard/layout.tsx:8) performs server-side auth checks and redirects unauthenticated users.
