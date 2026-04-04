# API Performance and Reliability Monitoring Dashboard

A real-time API monitoring and alerting system built with Next.js 16, Supabase, and React. Monitor your API endpoints, track performance metrics intelligently, and visualize historical uptime and latency on a dynamic dashboard. Originally designed for research on API performance tracking.

## Features

- **Real-time Health Checks**: Monitor API endpoints with strict network evaluations mapping 2xx, 4xx, 5xx, and fatal network timeouts (Level 0).
- **Smart Throttling (Custom Intervals)**: Endpoint checks completely adhere to customizable check intervals (30 seconds to 1 hour). The backend evaluates the delta of the last recorded timestamp before pinging heavily.
- **Dynamic Deletions**: Securely delete your monitored endpoints directly from the interface.
- **Performance Metrics**: Track response times, uptime, and historical trends visualized vividly through Recharts.
- **Status Dashboard**: Intuitive overview of all monitored endpoints dynamically computing healthy, degraded (very slow), and down API instances.
- **User Authentication**: Secure Supabase authentication and Row Level Security (RLS) guaranteeing endpoint isolation per user.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **UI Components**: shadcn/ui, Lucide Icons
- **Database**: Supabase PostgreSQL with fully isolated RLS policies
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Styling**: Tailwind CSS, PostCSS
- **Package Manager**: pnpm

## Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd api-monitor
pnpm install
```

### 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Create a `.env` file locally based on your credentials:

```env
# Exposed to the Client (Safe)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend Security (MUST remain secret/Server-only)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
HEALTH_CHECK_SECRET=your_secret_key_for_cron_jobs
```

> **Security Note:** The `SUPABASE_SERVICE_ROLE_KEY` gives administrative bypass level access to the background Cron processor. Never expose it with a `NEXT_PUBLIC_` prefix.

### 3. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema Highlights

### `endpoints` table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users - enforcing ownership)
- `name`: TEXT
- `url`: TEXT
- `check_interval_seconds`: INTEGER (Throttling frequency parameter)
- `created_at`: TIMESTAMP

### `health_checks` table
- `id`: UUID (primary key)
- `endpoint_id`: UUID (foreign key linked to `endpoints` table)
- `is_healthy`: BOOLEAN (True if response was exactly OK)
- `response_time_ms`: INTEGER (milliseconds latency)
- `status_code`: INTEGER (HTTP code. `0` indicates network failure/timeout)
- `created_at`: TIMESTAMP (Used effectively for time-range throttling calculation)

## Background API Ping Architecture (Cron Jobs)

Because Vercel's Cron feature limits frequency on the free tier, our backend is entirely decoupled from the hosting schedule. You can use any external automated ping framework (like **cron-job.org**).

1. The external cron pings exactly your custom monitoring route: `POST https://<your-domain>/api/health-check`
2. It sends an Authorization Token inside of the POST Headers matching your `.env` string: `Bearer <HEALTH_CHECK_SECRET>`.
3. The server natively hooks into Supabase using the Service Role Admin Client. This bypasses RLS safely and looks through all your users' `endpoints`.
4. It iterates internally and checks whether the time passed since `last_checked_at` strictly exceeds the specified `check_interval_seconds` prior to dispatching network `fetch()` commands.

### Using cron-job.org
1. Create a completely free scheduled execution every 1 minute.
2. Select HTTP method `POST`.
3. Fill headers with `Authorization: Bearer <your_secret_key>`.

## Troubleshooting

### Dashboard Charts Appear Empty
Ensure that the automated cron job has run at least once. If you only just created the endpoint, it will wait for the exact moment the automated background processor runs before displaying any dots.

### "No Data Found" Check Count equals 0
Verify you have actually created an endpoint inside your dashboard successfully. Also, carefully confirm your Vercel `SUPABASE_SERVICE_ROLE_KEY` equals the one under "API Keys" -> `service_role` -> `secret` inside the Supabase settings. If absent, Supabase hides tables due to zero RLS authentication on the background task.

### Errors (5xx & Network) Aren't Updating
Our graphs explicitly merge HTTP Server `500+` crashes along with status code `0`, representing full network dropouts (like DNS resolutions failing, timeouts over 10s, and TLS crashes). If the value is stuck, verify that the ping isn't simply resolving as a client-based warning (`400`).

## License

MIT License - see LICENSE file for details.
