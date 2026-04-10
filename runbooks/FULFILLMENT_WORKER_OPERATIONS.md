# Fulfillment Worker Operations

## Purpose

Keep payment-to-install fulfillment processing active continuously on the website VPS.

## Runtime Modes

- One-shot worker:
  - `npm run worker:fulfillment`
- One-shot stuck-job reconciliation:
  - `npm run worker:fulfillment:reconcile-stuck`
- Continuous loop worker:
  - `npm run worker:fulfillment:loop`

## Environment

- `FULFILLMENT_WORKER_INTERVAL_MS` (default `15000`)
- `FULFILLMENT_WORKER_BATCH_SIZE` (default `10`)
- `FULFILLMENT_RECONCILE_STUCK` (default `true`)
- `FULFILLMENT_STUCK_JOB_MINUTES` (default `30`)
- `FULFILLMENT_STUCK_RECONCILE_LIMIT` (default `10`)
- `NEXIUS_CONTROL_ONBOARDING_TIMEOUT_MS` (default `60000`)
- `NEXIUS_CONTROL_DISPATCH_MAX_ATTEMPTS` (default `2`)
- `NEXIUS_CONTROL_DISPATCH_BACKOFF_MS` (default `500`)
- Existing Supabase + control-plane env vars used by `src/lib/fulfillment.ts`

Required control-plane env vars:
- `NEXIUS_CONTROL_BASE_URL` (or `NEXIUS_CONTROL_ONBOARDING_URL`)
- `NEXIUS_CONTROL_ONBOARDING_TOKEN`
- `NEXIUS_CONTROL_PUBLIC_BASE_URL` (recommended for canonical tenant URL rendering)

## Recommended systemd unit

```ini
[Unit]
Description=Nexius Fulfillment Worker
After=network.target

[Service]
Type=simple
WorkingDirectory=/root/nexius-labs-pro-6a633
Environment=NODE_ENV=production
Environment=FULFILLMENT_WORKER_INTERVAL_MS=15000
Environment=FULFILLMENT_WORKER_BATCH_SIZE=10
ExecStart=/usr/bin/npm run worker:fulfillment:loop
Restart=always
RestartSec=5
User=root

[Install]
WantedBy=multi-user.target
```

## Health checks

- Validate queue:
  - `GET /api/admin/fulfillment/jobs?state=payment_confirmed`
- Validate dispatcher:
  - `POST /api/internal/fulfillment/dispatch` (admin/internal token)
- Validate replay path:
  - `POST /api/admin/fulfillment/replay`

## Alerting recommendation

- Alert if `onboarding_jobs` in `payment_confirmed|package_resolved|failed` with `next_retry_at <= now()` grows continuously for 10+ minutes.
