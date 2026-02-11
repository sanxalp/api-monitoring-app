# API Monitor

A real-time API monitoring and alerting system built with Next.js 16, Supabase, and React. Monitor your API endpoints, track performance metrics, and receive instant alerts when issues occur.

## Features

- **Real-time Health Checks**: Monitor API endpoints with configurable check intervals (30 seconds to 1 hour)
- **Performance Metrics**: Track response times, uptime, and historical trends
- **Smart Alerts**: Get notified via email or Slack when endpoints are down or degraded
- **Trend Analysis**: Analyze performance patterns over time with detailed charts
- **Status Dashboard**: Quick overview of all monitored endpoints
- **User Authentication**: Secure Supabase authentication
- **Role-based Access**: Manage multiple endpoints per user

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: shadcn/ui
- **Database**: Supabase PostgreSQL with RLS
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm

## Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd api-monitor
pnpm install
```

### 2. Set Up Supabase

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
HEALTH_CHECK_SECRET=your_secret_key_for_cron_jobs
```

### 3. Run Database Migrations

The database schema is automatically created when you set up the Supabase integration. Tables include:
- `endpoints`: API endpoints to monitor
- `health_checks`: Health check results with response times
- `alerts`: Alert records with severity and status
- `alert_history`: Historical alert data

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── auth/              # Authentication pages (login, sign-up)
├── dashboard/         # Protected dashboard
│   ├── page.tsx      # Main dashboard overview
│   ├── endpoints/    # Endpoint management
│   ├── alerts/       # Alert management
│   ├── metrics/      # Detailed metrics view
│   └── settings/     # User settings
├── api/
│   ├── endpoints/    # Endpoint CRUD operations
│   ├── health-check/ # Health check runner
│   ├── alerts/       # Alert management
│   └── metrics/      # Metrics retrieval
└── page.tsx          # Landing page
components/
├── ui/               # shadcn/ui components
├── endpoints-list.tsx # Endpoints display component
├── metrics-chart.tsx  # Chart visualization
└── status-badge.tsx   # Status indicator
lib/
├── supabase/
│   ├── client.ts     # Client-side Supabase
│   ├── server.ts     # Server-side Supabase
│   └── proxy.ts      # Proxy for session handling
└── utils.ts          # Utility functions
```

## API Routes

### Endpoints
- `GET /api/endpoints` - List all endpoints
- `POST /api/endpoints` - Create new endpoint

### Health Checks
- `POST /api/health-check` - Run health checks (triggered by cron)

### Alerts
- `GET /api/alerts` - List alerts with filtering
- `POST /api/alerts` - Create alert
- `PATCH /api/alerts` - Update alert status

### Metrics
- `GET /api/metrics/[endpointId]` - Get detailed metrics for an endpoint

## Database Schema

### endpoints table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to auth.users)
- name: TEXT
- url: TEXT
- check_interval: INTEGER (seconds)
- last_checked: TIMESTAMP
- created_at: TIMESTAMP
```

### health_checks table
```sql
- id: UUID (primary key)
- endpoint_id: UUID (foreign key)
- status: TEXT (healthy, degraded, down)
- response_time: INTEGER (milliseconds)
- status_code: INTEGER
- checked_at: TIMESTAMP
```

### alerts table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- endpoint_id: UUID (foreign key)
- type: TEXT
- severity: TEXT (critical, warning, info)
- message: TEXT
- is_resolved: BOOLEAN
- created_at: TIMESTAMP
```

## Configuration

### Check Intervals
Configure how often each endpoint should be checked:
- Minimum: 30 seconds
- Maximum: 1 hour
- Default: 5 minutes

### Alert Thresholds
Set custom thresholds in settings:
- Response time alerts (default: 2000ms)
- Uptime percentage alerts (default: 95%)

### Notifications
- Email alerts via SendGrid (optional)
- Slack integration via webhooks (optional)

## Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel project settings
3. Deploy automatically on push

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `HEALTH_CHECK_SECRET`

### Cron Jobs
Health checks run automatically every 5 minutes via Vercel Crons. Configure in `vercel.json`.

## Security

- **Row Level Security (RLS)**: All data is protected with RLS policies
- **Authentication**: Supabase Auth with instant access after signup
- **HTTPS**: All communications encrypted
- **Rate Limiting**: Implement rate limits on health check endpoints
- **Secrets**: Use environment variables for sensitive data

## Monitoring Your Endpoints

1. **Sign Up**: Create an account at `/auth/sign-up` - instant access, no email confirmation required
2. **Add Endpoints**: Navigate to `/dashboard/endpoints` and add API URLs to monitor
3. **View Dashboard**: See real-time status on `/dashboard`
4. **Check Metrics**: View detailed performance data in `/dashboard/metrics`
5. **Manage Alerts**: Configure alert thresholds in `/dashboard/settings`

## Development

### Run Tests
```bash
pnpm test
```

### Build for Production
```bash
pnpm build
```

### Format Code
```bash
pnpm format
```

## Troubleshooting

### Health Checks Not Running
- Verify `HEALTH_CHECK_SECRET` is set in environment variables
- Check Vercel Crons logs in project dashboard
- Ensure endpoints are created and have valid URLs

### Authentication Issues
- Confirm Supabase credentials are correct
- Check that auth users table has proper RLS policies
- Verify email confirmation is disabled in Supabase Auth settings

### Database Errors
- Run database migrations from SQL editor in Supabase
- Check RLS policies are properly enabled
- Verify user_id matches in all related tables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please open a GitHub issue or contact support at vercel.com/help.
