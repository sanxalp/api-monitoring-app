# Deployment Guide

This guide walks you through deploying the API Monitor application to production.

## Prerequisites

- Supabase project created and configured
- Vercel account
- GitHub repository

## Step 1: Prepare Your Supabase Project

1. Go to your Supabase project dashboard
2. Run the database migrations (already included in `scripts/001_create_monitoring_schema.sql`)
3. Copy your project URL and anon key from Settings > API

## Step 2: Prepare Environment Variables

Before deploying, you need to set up environment variables. Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
HEALTH_CHECK_SECRET=your_secure_random_string_here
```

Generate a secure random string for `HEALTH_CHECK_SECRET`:
```bash
openssl rand -hex 32
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts to link your project
```

### Option B: Using GitHub Integration

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Select your GitHub repository
5. Vercel will auto-detect Next.js configuration
6. Add environment variables in "Environment Variables" section
7. Click "Deploy"

## Step 4: Configure Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
HEALTH_CHECK_SECRET = your_secure_secret
```

4. Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set for Production, Preview, and Development environments

## Step 5: Enable Cron Jobs

The health check service runs every 5 minutes via Vercel Crons.

1. Ensure `vercel.json` is in your root directory with cron configuration
2. Cron jobs are automatically enabled for all deployments
3. Check cron execution in Vercel project dashboard under "Crons"

## Step 6: Test Your Deployment

1. Visit your deployed URL (e.g., https://your-project.vercel.app)
2. Create a test account
3. Add a test endpoint
4. Verify health checks are running
5. Check Vercel logs for any errors

## Post-Deployment

### 1. Set Up Email Notifications (Optional)

To send email alerts, integrate with SendGrid:

1. Create a SendGrid account at https://sendgrid.com
2. Generate an API key
3. Add to Vercel environment variables:
   ```
   SENDGRID_API_KEY = your_sendgrid_api_key
   SENDGRID_FROM_EMAIL = noreply@yourdomain.com
   ```

### 2. Set Up Slack Integration (Optional)

To send Slack alerts:

1. Create a Slack webhook at https://api.slack.com/apps
2. Copy the webhook URL
3. Users can add their own webhook URLs in Settings

### 3. Custom Domain

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### 4. Monitor Your Application

Use Vercel's built-in analytics and monitoring:
- Check "Deployments" tab for deployment history
- Review "Functions" for API route performance
- Monitor "Crons" for health check execution
- Check "Logs" for errors and debugging

## Troubleshooting

### Health Checks Not Running

**Problem**: Cron jobs aren't executing
**Solution**:
1. Verify `vercel.json` has correct cron configuration
2. Check Vercel project logs under "Crons"
3. Ensure environment variables are set correctly
4. Restart deployment

### Database Connection Issues

**Problem**: "Database connection error" or "Table does not exist"
**Solution**:
1. Verify Supabase URL and anon key are correct
2. Check if database migrations have been run
3. Ensure RLS policies are enabled and correct
4. Test connection in Supabase SQL editor

### Authentication Failures

**Problem**: Users can't log in or sign up
**Solution**:
1. Verify Supabase auth is enabled in project
2. Check email configuration in Supabase
3. Confirm auth.users table exists
4. Review RLS policies for auth tables

### CORS Errors

**Problem**: Frontend can't reach API
**Solution**:
1. Check that `NEXT_PUBLIC_SUPABASE_URL` matches deployment URL
2. Verify Supabase CORS settings allow your domain
3. Ensure API routes are properly exported

## Performance Optimization

### 1. Database Performance

- Indexes are created automatically on important columns
- Monitor query performance in Supabase dashboard
- Consider archiving old health check data monthly

### 2. Frontend Performance

- Images and assets are optimized by Next.js
- API routes use caching where appropriate
- Consider enabling ISR (Incremental Static Regeneration) for public pages

### 3. Cost Optimization

- Monitor Supabase usage in the dashboard
- Archive or delete old endpoint data regularly
- Use appropriate health check intervals to reduce API calls

## Scaling Considerations

### For Small Scale (< 10 endpoints)
- Current setup is sufficient
- Cost: Vercel free tier + Supabase free tier

### For Medium Scale (10-100 endpoints)
- Consider upgrading Supabase plan
- Monitor database storage and bandwidth
- Enable database indexing on frequently queried columns

### For Large Scale (100+ endpoints)
- Set up read replicas in Supabase
- Implement caching layer (Redis)
- Consider load balancing for health check requests
- Archive historical data to separate storage

## Rollback Instructions

If you need to rollback a deployment:

1. Go to Vercel project dashboard
2. Click on "Deployments"
3. Find the previous stable deployment
4. Click the "Redeploy" button
5. Vercel will redeploy that version immediately

## Security Checklist

Before going to production:

- [ ] Change default `HEALTH_CHECK_SECRET` to a secure random string
- [ ] Enable email confirmation in Supabase auth
- [ ] Review RLS policies are restrictive
- [ ] Set up HTTPS (automatic with Vercel)
- [ ] Configure rate limiting on health check endpoint
- [ ] Enable audit logging in Supabase
- [ ] Set up monitoring and alerts
- [ ] Review data privacy policies
- [ ] Test authentication thoroughly

## Monitoring and Maintenance

### Weekly
- Check deployment logs for errors
- Review alert patterns in application
- Monitor error rates in Functions

### Monthly
- Archive old health check records
- Review database performance metrics
- Update dependencies with `pnpm update`

### Quarterly
- Full security audit
- Performance optimization review
- Backup and disaster recovery testing

## Support

For deployment issues:
- Check Vercel status page: https://www.vercelstatus.com
- Review Supabase documentation: https://supabase.com/docs
- Open a support ticket: https://vercel.com/help

## Next Steps

1. Monitor your deployment for 24-48 hours
2. Test all features thoroughly
3. Gather user feedback
4. Plan improvements and new features
5. Set up regular backups
