#!/usr/bin/env pwsh
# Interactive monitor for dev workflow (PowerShell)

$ErrorActionPreference = "Continue"

function Get-RepoRoot {
    return (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

function Ensure-Dir($path) {
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
    }
}

function Write-Title($text) {
    Write-Host $text -ForegroundColor Cyan
}

function Write-Separator {
    Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
}

function Write-StatusLine($name, $state, $procId, $url) {
    $label = if ($name) { $name } else { "service" }
    Write-Host "  $label " -NoNewline -ForegroundColor Cyan
    if ($state -eq "running") {
        Write-Host "RUNNING" -NoNewline -ForegroundColor Green
    } else {
        Write-Host "STOPPED" -NoNewline -ForegroundColor Yellow
    }
    Write-Host "  PID: $procId  $url"
}

function Get-StateObject($statePath) {
    if (-not (Test-Path $statePath)) { return [pscustomobject]@{} }
    try {
        $raw = Get-Content -Raw -Path $statePath
        if (-not $raw) { return [pscustomobject]@{} }
        return $raw | ConvertFrom-Json
    } catch {
        return [pscustomobject]@{}
    }
}

function Save-StateObject($statePath, $state) {
    $state | ConvertTo-Json -Depth 6 | Set-Content -Path $statePath -Encoding utf8
}

function Get-ServiceState($state, $name) {
    if ($state.PSObject.Properties.Name -contains $name) {
        return $state.$name
    }
    return $null
}

function Set-ServiceState($state, $name, $value) {
    $state | Add-Member -NotePropertyName $name -NotePropertyValue $value -Force
}

function Clear-ServiceState($state, $name) {
    if ($state.PSObject.Properties.Name -contains $name) {
        $state.PSObject.Properties.Remove($name)
    }
}

function Is-ProcessRunning($procId) {
    if (-not $procId) { return $false }
    $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
    return $null -ne $p
}

function Start-ServiceProcess($statePath, $svc) {
    if (-not $svc) { return }
    $state = Get-StateObject $statePath
    $current = Get-ServiceState $state $svc.name
    $svcName = if ($svc.PSObject.Properties["name"]) { $svc.name } else { "service" }
    if ($current -and (Is-ProcessRunning $current.pid)) {
        Write-Host "[$svcName] already running (PID $($current.pid))"
        return
    }

    $logFile = $svc.log
    $errFile = $svc.err
    $started = (Get-Date).ToString("s")
    Write-Host "[$svcName] starting: $($svc.command)"
    try {
        $proc = Start-Process -FilePath "cmd.exe" `
            -ArgumentList "/c", $svc.command `
            -WorkingDirectory $svc.workdir `
            -RedirectStandardOutput $logFile `
            -RedirectStandardError $errFile `
            -NoNewWindow `
            -PassThru
    } catch {
        Write-Host "[$svcName] failed to start: $($_.Exception.Message)"
        return
    }

    $entry = [pscustomobject]@{
        pid = $proc.Id
        command = $svc.command
        workdir = $svc.workdir
        log = $logFile
        err = $errFile
        startedAt = $started
    }
    Set-ServiceState $state $svc.name $entry
    Save-StateObject $statePath $state
    Write-Host "[$svcName] started (PID $($proc.Id))"
}

function Stop-ServiceProcess($statePath, $svc) {
    $state = Get-StateObject $statePath
    $current = Get-ServiceState $state $svc.name
    if (-not $current) {
        Write-Host "[${($svc.name)}] not running"
        return
    }
    if (Is-ProcessRunning $current.pid) {
        Write-Host "[${($svc.name)}] stopping (PID $($current.pid))"
        Stop-Process -Id $current.pid -Force
    }
    Clear-ServiceState $state $svc.name
    Save-StateObject $statePath $state
    Write-Host "[${($svc.name)}] stopped"
}

function Show-Status($statePath, $services) {
    $state = Get-StateObject $statePath
    Write-Host ""
    Write-Title "Status"
    foreach ($svc in $services) {
        $current = Get-ServiceState $state $svc.name
        if ($current -and (Is-ProcessRunning $current.pid)) {
            Write-StatusLine $svc.name "running" $current.pid $svc.url
        } else {
            Write-StatusLine $svc.name "stopped" "-" $svc.url
        }
    }
    Write-Host ""
}

function Show-Dashboard($statePath, $services) {
    Clear-Host
    Write-Title "Mahitek Dev Monitor"
    Write-Host "Repo: $repoRoot"
    Write-Host "Time: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")"
    Write-Separator
    Show-Status $statePath $services
    Write-Separator
    Write-Host "Commands: start|stop|restart web|worker|all  status  logs web|worker  open web|worker  validate  docs  clear  help  exit"
    Write-Host ""
}

function Show-Logs($svc, $lines = 200) {
    $log = $svc.log
    $err = $svc.err
    if (-not (Test-Path $log) -and -not (Test-Path $err)) {
        Write-Host "[${($svc.name)}] log not found"
        return
    }
    Write-Host ""
    if (Test-Path $log) {
        Write-Host "---- $($svc.name) log (tail $lines) ----"
        Get-Content -Path $log -Tail $lines
        Write-Host "----------------------------------------"
    }
    if (Test-Path $err) {
        Write-Host "---- $($svc.name) err (tail $lines) ----"
        Get-Content -Path $err -Tail $lines
        Write-Host "----------------------------------------"
    }
    Write-Host ""
}

function Run-Command($workdir, $command) {
    Write-Host ">> $command"
    $cwd = Get-Location
    try {
        Set-Location $workdir
        & cmd.exe /c $command
    } finally {
        Set-Location $cwd
    }
}

function Show-Help {
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start web|worker|all"
    Write-Host "  stop web|worker|all"
    Write-Host "  restart web|worker|all"
    Write-Host "  status"
    Write-Host "  dashboard"
    Write-Host "  logs web|worker"
    Write-Host "  open web|worker"
    Write-Host "  validate"
    Write-Host "  docs"
    Write-Host "  clear"
    Write-Host "  help"
    Write-Host "  exit"
    Write-Host ""
}

$repoRoot = Get-RepoRoot
$logsDir = Join-Path $repoRoot "logs"
Ensure-Dir $logsDir
$statePath = Join-Path $logsDir "dev-monitor-state.json"
if (-not (Test-Path $statePath)) {
    Set-Content -Path $statePath -Value "{}" -Encoding utf8
}

$services = @(
    [pscustomobject]@{
        name = "web"
        command = "npm run dev"
        workdir = $repoRoot
        log = (Join-Path $logsDir "web.log")
        err = (Join-Path $logsDir "web.log.err")
        url = "http://localhost:8080"
    },
    [pscustomobject]@{
        name = "worker"
        command = "wrangler dev --env dev"
        workdir = (Join-Path $repoRoot "workers\\mahiteklab-api")
        log = (Join-Path $logsDir "worker.log")
        err = (Join-Path $logsDir "worker.log.err")
        url = "http://127.0.0.1:8787"
    }
)

Show-Dashboard $statePath $services

while ($true) {
    $input = Read-Host "monitor"
    if (-not $input) { continue }
    $parts = $input.Trim().ToLower().Split(" ", 2, [System.StringSplitOptions]::RemoveEmptyEntries)
    $cmd = $parts[0]
    $arg = if ($parts.Length -gt 1) { $parts[1] } else { "" }

    switch ($cmd) {
        "start" {
            if ($arg -eq "all") { $services | ForEach-Object { Start-ServiceProcess $statePath $_ }; break }
            $svc = $services | Where-Object { $_.name -eq $arg }
            if (-not $svc) { Write-Host "Unknown service: $arg"; break }
            Start-ServiceProcess $statePath $svc
        }
        "stop" {
            if ($arg -eq "all") { $services | ForEach-Object { Stop-ServiceProcess $statePath $_ }; break }
            $svc = $services | Where-Object { $_.name -eq $arg }
            if (-not $svc) { Write-Host "Unknown service: $arg"; break }
            Stop-ServiceProcess $statePath $svc
        }
        "restart" {
            if ($arg -eq "all") {
                $services | ForEach-Object { Stop-ServiceProcess $statePath $_ }
                $services | ForEach-Object { Start-ServiceProcess $statePath $_ }
                break
            }
            $svc = $services | Where-Object { $_.name -eq $arg }
            if (-not $svc) { Write-Host "Unknown service: $arg"; break }
            Stop-ServiceProcess $statePath $svc
            Start-ServiceProcess $statePath $svc
        }
        "status" { Show-Status $statePath $services }
        "dashboard" { Show-Dashboard $statePath $services }
        "logs" {
            $svc = $services | Where-Object { $_.name -eq $arg }
            if (-not $svc) { Write-Host "Unknown service: $arg"; break }
            Show-Logs $svc
        }
        "open" {
            $svc = $services | Where-Object { $_.name -eq $arg }
            if (-not $svc) { Write-Host "Unknown service: $arg"; break }
            Start-Process $svc.url
        }
        "validate" { Run-Command $repoRoot "npm run validate" }
        "docs" { Run-Command $repoRoot "npm run docs:update" }
        "clear" { Clear-Host }
        "help" { Show-Help }
        "exit" { break }
        default { Write-Host "Unknown command. Type 'help'." }
    }
}
