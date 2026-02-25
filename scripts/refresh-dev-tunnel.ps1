param(
  [string]$ProjectDir = "C:\Users\saasv\.openclaw\workspace-cmo-content\nexius-labs-pro-6a633",
  [string]$SupabaseApiOrigin = "http://127.0.0.1:54321",
  [string]$NetlifyCmd = "C:\Users\saasv\.openclaw\workspace\npm-global\netlify.cmd",
  [string]$CloudflaredCmd = "cloudflared",
  [int]$TunnelWaitSeconds = 45,
  [switch]$SkipDeploy
)

$ErrorActionPreference = "Stop"

function Require-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $name"
  }
}

Write-Host "[1/3] Starting/refreshing Cloudflare quick tunnel for $SupabaseApiOrigin ..." -ForegroundColor Cyan

Require-Command $CloudflaredCmd
if (-not (Test-Path $NetlifyCmd)) {
  throw "Netlify CLI not found at: $NetlifyCmd"
}

Set-Location $ProjectDir

# Stop existing cloudflared processes to avoid stale tunnel URLs.
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

$logDir = Join-Path $ProjectDir ".tmp\tunnel"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir "cloudflared-quick.log"
$pidFile = Join-Path $logDir "cloudflared-quick.pid"
Remove-Item $logFile -ErrorAction SilentlyContinue
Remove-Item $pidFile -ErrorAction SilentlyContinue

$proc = Start-Process -FilePath $CloudflaredCmd `
  -ArgumentList @("tunnel", "--url", $SupabaseApiOrigin, "--loglevel", "info", "--logfile", $logFile) `
  -PassThru

$proc.Id | Out-File -FilePath $pidFile -Encoding ascii -Force

$deadline = (Get-Date).AddSeconds($TunnelWaitSeconds)
$tunnelUrl = $null
$pattern = 'https://[a-z0-9-]+\.trycloudflare\.com'

while ((Get-Date) -lt $deadline) {
  Start-Sleep -Milliseconds 700

  if (Test-Path $logFile) {
    $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
    $m = [regex]::Match($content, $pattern)
    if ($m.Success) {
      $tunnelUrl = $m.Value
      break
    }
  }

  if ($proc.HasExited) {
    throw "cloudflared exited before yielding a tunnel URL. Check: $logFile"
  }
}

if (-not $tunnelUrl) {
  throw "Timed out waiting for tunnel URL. Check log: $logFile"
}

Write-Host "Tunnel URL: $tunnelUrl" -ForegroundColor Green

Write-Host "[2/3] Updating Netlify env vars ..." -ForegroundColor Cyan
& $NetlifyCmd env:set NEXT_PUBLIC_SUPABASE_URL $tunnelUrl
& $NetlifyCmd env:set SUPABASE_URL $tunnelUrl

if ($SkipDeploy) {
  Write-Host "[3/3] Skipped deploy (SkipDeploy switch used)." -ForegroundColor Yellow
  Write-Host "Done. Tunnel refreshed + Netlify env updated." -ForegroundColor Green
  exit 0
}

Write-Host "[3/3] Triggering production deploy ..." -ForegroundColor Cyan
& $NetlifyCmd deploy --prod

Write-Host "Done. Dev tunnel refreshed, Netlify env updated, production redeployed." -ForegroundColor Green
Write-Host "Quick references:" -ForegroundColor DarkGray
Write-Host "  Tunnel URL: $tunnelUrl"
Write-Host "  PID file:   $pidFile"
Write-Host "  Log file:   $logFile"