# API Monitor - Comprehensive Testing Guide

This guide provides step-by-step instructions for testing the entire API Monitoring application, including endpoint connectivity, health checks, alert systems, and chart visualizations.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Authentication Testing](#authentication-testing)
3. [Endpoint Management Testing](#endpoint-management-testing)
4. [Health Check Testing](#health-check-testing)
5. [Metrics & Chart Visualization Testing](#metrics--chart-visualization-testing)
6. [Alert System Testing](#alert-system-testing)
7. [Dashboard & UI Testing](#dashboard--ui-testing)
8. [Performance Testing](#performance-testing)
9. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Prerequisites

Before starting tests, ensure you have:

- Node.js 18+ installed
- Supabase project set up with email confirmation disabled
- Environment variables configured in `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
- Application running locally: `npm run dev`

### Database Setup

1. Execute all migration scripts:
   ```bash
   # Run from Supabase SQL Editor or local environment
   scripts/001_create_monitoring_schema.sql
   scripts/002_profile_trigger.sql
   ```

2. Verify tables exist in Supabase:
   - `profiles`
   - `endpoints`
   - `health_checks`
   - `alerts`
   - `alert_history`

3. Verify RLS policies are active:
   ```sql
   -- Check if RLS is enabled
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('endpoints', 'health_checks', 'alerts');
   ```

---

## Authentication Testing

### Test 1: User Signup with Instant Access

**Objective**: Verify users can sign up and immediately access the dashboard without email confirmation.

**Steps**:
1. Navigate to `http://localhost:3000`
2. Click "Get Started Free" button
3. Enter email: `testuser@example.com`
4. Enter password: `Test@123456`
5. Click "Sign Up"

**Expected Result**:
- Page should redirect to `/dashboard`
- User should be logged in immediately
- No email confirmation page should appear
- Dashboard should load with empty endpoints list

**Verification**:
```javascript
// Check browser console for user session
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
console.log(user) // Should show user object with email
```

### Test 2: User Login

**Objective**: Verify existing users can log in successfully.

**Steps**:
1. Sign out if already logged in
2. Navigate to `/auth/login`
3. Enter email: `testuser@example.com`
4. Enter password: `Test@123456`
5. Click "Sign In"

**Expected Result**:
- User redirects to `/dashboard`
- User is authenticated
- Previous endpoints are visible (if any exist)

### Test 3: Session Persistence

**Objective**: Verify user sessions persist across page refreshes.

**Steps**:
1. Log in to the application
2. Add an endpoint (see Test 4)
3. Refresh the page (F5 or Cmd+R)
4. Navigate to different sections (endpoints, alerts, settings)

**Expected Result**:
- User remains logged in after refresh
- Endpoints and data persist
- No need to re-authenticate

---

## Endpoint Management Testing

### Test 4: Add Endpoint

**Objective**: Verify endpoint can be added to the monitoring system.

**Steps**:
1. Log in and navigate to `/dashboard/endpoints`
2. Click "Add Endpoint" button
3. Fill in the form:
   - **Name**: `Production API`
   - **URL**: `https://api.example.com/health`
   - **Method**: `GET`
   - **Check Interval**: `5 minutes`
   - **Success Threshold**: `200`
4. Click "Create Endpoint"

**Expected Result**:
- Endpoint appears in the endpoints list
- Status shows as "Pending" initially
- Endpoint data is saved to database
- URL is validated before saving

**Verification in Database**:
```sql
SELECT id, name, url, method, check_interval_seconds, status 
FROM endpoints 
WHERE user_id = 'your-user-id' 
ORDER BY created_at DESC 
LIMIT 1;
```

### Test 5: Edit Endpoint

**Objective**: Verify endpoint configuration can be updated.

**Steps**:
1. In the endpoints list, click edit icon on an endpoint
2. Modify the check interval to `10 minutes`
3. Change success threshold to `201-299`
4. Click "Update Endpoint"

**Expected Result**:
- Changes are saved to database
- Endpoint list reflects updates
- Next health check uses new interval

### Test 6: Delete Endpoint

**Objective**: Verify endpoint can be safely removed.

**Steps**:
1. In the endpoints list, click delete icon
2. Confirm deletion in modal
3. Verify endpoint is gone from list

**Expected Result**:
- Endpoint is deleted from database
- Associated health checks remain for historical data
- No errors appear

### Test 7: Bulk Endpoint Import

**Objective**: Verify multiple endpoints can be added efficiently.

**Steps**:
1. Navigate to `/dashboard/endpoints`
2. Click "Bulk Import" (if implemented)
3. Paste JSON:
   ```json
   [
     {
       "name": "API 1",
       "url": "https://api1.example.com/health",
       "method": "GET"
     },
     {
       "name": "API 2",
       "url": "https://api2.example.com/status",
       "method": "GET"
     }
   ]
   ```
4. Click "Import"

**Expected Result**:
- All endpoints are created
- No duplicates are added if endpoints already exist
- Confirmation message shows count of added endpoints

---

## Health Check Testing

### Test 8: Manual Health Check Trigger

**Objective**: Verify health checks can be run on demand.

**Steps**:
1. Navigate to `/dashboard/endpoints`
2. Find an endpoint
3. Click "Check Now" or run-icon button
4. Wait for the request to complete

**Expected Result**:
- Health check executes immediately
- Status updates (healthy/unhealthy)
- Response time is recorded
- Last checked timestamp updates

### Test 9: Automatic Health Check Scheduling

**Objective**: Verify health checks run automatically on schedule.

**Steps**:
1. Add endpoint with 5-minute check interval
2. Wait for scheduled check to execute
3. Monitor the `/api/health-check` route logs
4. Check database for new health_checks entry

**Expected Result**:
- Health check runs at scheduled time
- Database records created with timestamp and response data
- No errors in server logs

**Test with Console Logs**:
```javascript
// In app/api/health-check/route.ts, add:
console.log("[v0] Health check starting for endpoint:", endpointId)
console.log("[v0] Response status:", response.status)
console.log("[v0] Response time:", responseTime)
```

### Test 10: Health Check with Various Response Codes

**Objective**: Verify the system correctly handles different HTTP status codes.

**Test Cases**:
- **200 OK**: Should mark as healthy
- **201 Created**: Should mark as healthy
- **301 Redirect**: Should follow and check final response
- **401 Unauthorized**: Should mark as unhealthy
- **500 Server Error**: Should mark as unhealthy
- **503 Service Unavailable**: Should mark as unhealthy
- **Connection Timeout**: Should record error and mark unhealthy

**Steps**:
1. Create endpoints pointing to APIs with different status codes
2. Manually trigger health checks
3. Verify status in endpoints list and database

**Verification**:
```sql
SELECT endpoint_id, status_code, is_healthy, response_time_ms, checked_at
FROM health_checks
ORDER BY checked_at DESC
LIMIT 10;
```

### Test 11: Response Time Measurement

**Objective**: Verify response times are accurately measured.

**Steps**:
1. Add endpoint pointing to a slow API (e.g., httpbin.org/delay/2)
2. Trigger health check
3. View response time in dashboard

**Expected Result**:
- Response time is accurate (should be ~2000ms)
- Time is displayed in milliseconds
- Data is stored in health_checks table

---

## Metrics & Chart Visualization Testing

### Test 12: Uptime Percentage Calculation

**Objective**: Verify uptime is correctly calculated.

**Steps**:
1. Create an endpoint
2. Generate health checks with mix of successes and failures
3. Navigate to `/dashboard/metrics/[endpointId]`
4. Check uptime percentage

**Test Scenario**:
- 9 successful checks, 1 failed check
- Expected uptime: 90%

**Verification**:
```sql
SELECT 
  endpoint_id,
  COUNT(*) as total_checks,
  SUM(CASE WHEN is_healthy THEN 1 ELSE 0 END) as healthy_checks,
  ROUND(100.0 * SUM(CASE WHEN is_healthy THEN 1 ELSE 0 END) / COUNT(*), 2) as uptime_percent
FROM health_checks
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY endpoint_id;
```

### Test 13: Response Time Chart Visualization

**Objective**: Verify response time data is visualized correctly.

**Steps**:
1. Navigate to `/dashboard/metrics/[endpointId]`
2. Look for "Response Time Trend" chart
3. Verify chart displays:
   - X-axis: Time periods (24 hours, 7 days, 30 days)
   - Y-axis: Response time in milliseconds
   - Data points for each health check

**Expected Result**:
- Chart renders without errors
- Chart is responsive (scales on different screen sizes)
- Hovering over data points shows tooltip with exact values
- Chart is interactive (can zoom, pan, or export)

**Browser Console Check**:
```javascript
// Verify chart data structure
console.log("[v0] Chart data:", chartData)
// Should show array of objects with timestamp and response_time
```

### Test 14: Status Distribution Chart

**Objective**: Verify status distribution is visualized correctly.

**Steps**:
1. Generate multiple health checks with different statuses
2. Navigate to metrics page
3. Look for "Status Distribution" or pie/donut chart

**Expected Result**:
- Chart shows percentage of healthy vs unhealthy checks
- Chart updates after new health checks
- Legend clearly identifies status types

### Test 15: Time Period Filtering

**Objective**: Verify metrics can be filtered by time periods.

**Steps**:
1. Navigate to `/dashboard/metrics/[endpointId]`
2. Look for time period selector (24h, 7d, 30d)
3. Click "24 Hours"
4. Observe chart updates
5. Click "7 Days"
6. Observe chart updates again

**Expected Result**:
- Charts update to show data for selected period
- X-axis labels adjust appropriately
- Data points update to match time range
- No data gaps or errors

### Test 16: Chart Data Accuracy

**Objective**: Verify chart data matches database records.

**Steps**:
1. Note the response times shown in chart for a specific endpoint
2. Query the database directly:
   ```sql
   SELECT response_time_ms, checked_at 
   FROM health_checks 
   WHERE endpoint_id = 'your-endpoint-id' 
   AND checked_at >= NOW() - INTERVAL '24 hours'
   ORDER BY checked_at;
   ```
3. Compare values - they should match exactly

**Expected Result**:
- Chart data matches database records
- No missing or extra data points
- Timestamps align correctly

### Test 17: Real-Time Chart Updates

**Objective**: Verify charts update when new health checks occur.

**Steps**:
1. Open metrics page in one tab
2. In another tab, trigger a manual health check
3. Watch the chart in the first tab

**Expected Result**:
- Chart updates automatically (if real-time is implemented)
- Or refresh shows new data point
- No page reload required for updates

---

## Alert System Testing

### Test 18: Create Alert Rule

**Objective**: Verify alert rules can be created for endpoints.

**Steps**:
1. Navigate to `/dashboard/settings`
2. Find alert configuration section
3. Create new alert rule:
   - **Endpoint**: Select an endpoint
   - **Condition**: Response Time > 2000ms
   - **Notification**: Email
4. Click "Save Alert"

**Expected Result**:
- Alert rule is saved to database
- Appears in alert list
- Can be enabled/disabled

### Test 19: Trigger Alert

**Objective**: Verify alerts are triggered when conditions are met.

**Steps**:
1. Set up alert for response time > 1000ms
2. Trigger health check for an endpoint with slow response
3. Check `/dashboard/alerts` page

**Expected Result**:
- Alert appears in alerts list
- Alert status shows "triggered" or "active"
- Timestamp shows when triggered
- Alert includes endpoint name and condition details

**Database Verification**:
```sql
SELECT id, endpoint_id, alert_type, severity, message, created_at
FROM alerts
ORDER BY created_at DESC
LIMIT 5;
```

### Test 20: Alert Severity Levels

**Objective**: Verify alerts have appropriate severity levels.

**Test Scenarios**:
- **Info**: Minor issues (response time slightly elevated)
- **Warning**: Moderate issues (endpoint slow but still responding)
- **Critical**: Major issues (endpoint down, frequent failures)

**Steps**:
1. Create alerts with different severity levels
2. Check that critical alerts display prominently
3. Verify color-coding matches severity

**Expected Result**:
- Critical alerts shown in red
- Warning alerts in yellow/orange
- Info alerts in blue
- Appropriate icons for each severity

### Test 21: Alert Acknowledgment

**Objective**: Verify alerts can be acknowledged/resolved.

**Steps**:
1. Navigate to `/dashboard/alerts`
2. Find a triggered alert
3. Click "Acknowledge" or checkbox
4. Verify alert moves to resolved section

**Expected Result**:
- Alert status changes to "resolved"
- Resolved alerts visible in history
- Can filter to show only active alerts

### Test 22: Alert Notifications

**Objective**: Verify alert notifications are sent.

**Steps**:
1. Configure email notifications in settings
2. Trigger an alert condition
3. Check email inbox

**Expected Result**:
- Email is received
- Email contains endpoint name, condition, and timestamp
- Email has link back to application
- Test email feature works

---

## Dashboard & UI Testing

### Test 23: Dashboard Overview

**Objective**: Verify dashboard displays key metrics and status.

**Steps**:
1. Log in and navigate to `/dashboard`
2. Observe overview section

**Expected Result**:
- Shows total endpoints count
- Shows number of healthy/unhealthy endpoints
- Shows total alerts (if any)
- Shows uptime percentage across all endpoints
- Quick access buttons to add endpoints and view alerts

### Test 24: Navigation Between Sections

**Objective**: Verify navigation works between all dashboard sections.

**Steps**:
1. Start at `/dashboard`
2. Click "Endpoints" in sidebar
3. Click "Metrics" (or select specific endpoint)
4. Click "Alerts"
5. Click "Settings"
6. Click "Dashboard" logo to return

**Expected Result**:
- All navigation works smoothly
- Page transitions are fast
- Sidebar active state updates correctly
- No 404 errors or broken links

### Test 25: Responsive Design

**Objective**: Verify UI is responsive on different screen sizes.

**Steps**:
1. Open application on desktop (1920px width)
2. Open DevTools and set to Tablet (768px width)
3. Open DevTools and set to Mobile (375px width)
4. Test on actual mobile device if possible

**Expected Result**:
- Layout adjusts properly at each breakpoint
- Navigation collapses to hamburger menu on mobile
- Charts are readable on all sizes
- Forms are usable on mobile
- No horizontal scrolling needed

### Test 26: Dark Mode (if implemented)

**Objective**: Verify dark mode toggle works.

**Steps**:
1. Find theme toggle in settings or header
2. Switch to dark mode
3. Verify all pages display correctly
4. Refresh page - dark mode persists

**Expected Result**:
- All elements are visible in dark mode
- Text contrast is sufficient
- Charts are readable
- Theme preference is saved

### Test 27: Loading States

**Objective**: Verify loading indicators display properly.

**Steps**:
1. Trigger health check and observe loading spinner
2. Add endpoint and watch form submission
3. Load metrics page with large dataset

**Expected Result**:
- Loading spinners display during operations
- Content area shows skeleton/placeholder while loading
- No blank screens or hanging states

---

## Performance Testing

### Test 28: Dashboard Load Time

**Objective**: Verify dashboard loads quickly.

**Steps**:
1. Open DevTools > Network tab
2. Navigate to `/dashboard`
3. Note total load time and individual resource times

**Expected Result**:
- Dashboard loads in under 3 seconds
- JavaScript bundle is reasonably sized
- Images are optimized
- No unused dependencies loaded

### Test 29: Metrics Page with Large Dataset

**Objective**: Verify metrics page performs well with lots of data.

**Steps**:
1. Generate 1000 health check records for an endpoint
2. Navigate to `/dashboard/metrics/[endpointId]`
3. Check load time and responsiveness
4. Interact with chart (zoom, hover, etc.)

**Expected Result**:
- Page loads in reasonable time
- Chart rendering is smooth
- No browser lag when hovering over data
- Scrolling is smooth

### Test 30: Real-Time Updates Performance

**Objective**: Verify real-time updates don't cause performance issues.

**Steps**:
1. Open dashboard with multiple endpoints
2. Trigger health checks on all endpoints
3. Monitor CPU usage and memory
4. Observe if UI remains responsive

**Expected Result**:
- Page remains responsive during updates
- No memory leaks
- CPU usage spikes briefly then normalizes
- No lag in user interactions

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: Endpoints not showing on dashboard

**Troubleshooting Steps**:
1. Verify user is authenticated:
   ```javascript
   const { data: { user } } = await supabase.auth.getUser()
   console.log(user)
   ```

2. Check RLS policies:
   ```sql
   SELECT * FROM endpoints WHERE user_id = 'your-user-id';
   ```

3. Verify API response:
   ```javascript
   // Check network tab in DevTools
   // Look at /api/endpoints request and response
   ```

#### Issue: Health checks not running

**Troubleshooting Steps**:
1. Verify endpoint URL is accessible:
   ```bash
   curl -I https://your-endpoint-url
   ```

2. Check server logs for errors in `/api/health-check`

3. Verify check interval is not too long (if testing)

4. Ensure Vercel Cron is configured properly (for production)

#### Issue: Charts not rendering

**Troubleshooting Steps**:
1. Check browser console for errors:
   ```javascript
   // Look for Recharts or chart library errors
   ```

2. Verify data structure matches chart expectations:
   ```javascript
   console.log("[v0] Chart data:", chartData)
   ```

3. Clear browser cache and reload

4. Verify Recharts library is installed:
   ```bash
   npm list recharts
   ```

#### Issue: Alerts not triggering

**Troubleshooting Steps**:
1. Verify alert rule exists in database:
   ```sql
   SELECT * FROM alerts WHERE endpoint_id = 'your-endpoint-id';
   ```

2. Manually trigger health check and check alert condition logic

3. Verify email configuration if using email alerts

4. Check alert history table for failed attempts

### Debug Mode

Enable detailed logging for troubleshooting:

```javascript
// Add to API routes and components
console.log("[v0] Function name:", value)
console.log("[v0] API response:", response)
console.log("[v0] Error details:", error)
```

### Testing Checklist

- [ ] Signup and login work without email confirmation
- [ ] Can add, edit, and delete endpoints
- [ ] Health checks execute automatically
- [ ] Metrics are calculated correctly
- [ ] Charts render and update
- [ ] Alerts trigger on conditions
- [ ] Notifications are sent
- [ ] Dashboard is responsive
- [ ] Performance is acceptable
- [ ] Database has no orphaned records

---

## Quick Test Scenarios

### End-to-End Test: Monitor a Real API

1. Sign up with email: `test@example.com`
2. Add endpoint: `https://api.example.com/health` with 5-minute intervals
3. Wait for first health check to complete
4. View metrics on dashboard
5. Create alert for response time > 1000ms
6. Navigate through all dashboard sections
7. Trigger manual health check
8. Verify alert if condition is met

### Performance Test Scenario

1. Add 10 endpoints
2. Set all to 1-minute check intervals
3. Let system run for 1 hour
4. Query database: `SELECT COUNT(*) FROM health_checks;` (expect 600+ records)
5. Load metrics page - verify performance
6. Check database size: `SELECT pg_size_pretty(pg_total_relation_size('health_checks'));`

---

## Automated Testing (Future)

For advanced testing, consider implementing:

```javascript
// Example: Jest test for endpoint creation
describe('Endpoint Management', () => {
  it('should create an endpoint', async () => {
    const response = await fetch('/api/endpoints', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test API',
        url: 'https://api.example.com/health',
        method: 'GET'
      })
    })
    expect(response.status).toBe(201)
  })
})
```

---

## Support & Reporting

If you encounter issues during testing:

1. Check the README.md and DEPLOYMENT.md for setup issues
2. Review server logs in Vercel dashboard
3. Check Supabase logs for database issues
4. Verify all environment variables are set
5. Test in incognito mode to rule out browser cache issues
6. Report issues with reproducible steps and error messages
