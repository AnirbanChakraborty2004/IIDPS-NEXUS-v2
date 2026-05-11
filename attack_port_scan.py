"""
IIDPS NEXUS - Port Scan Attack Script
Run this from a separate terminal to test your IDS.
Usage: python attack_port_scan.py
"""
import socket
import threading
import time
import sys

TARGET = "127.0.0.1"
PORT_RANGE = (1, 5000)
THREADS = 200

open_ports = []
lock = threading.Lock()
scanned = [0]

def scan_port(port):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.3)
        result = s.connect_ex((TARGET, port))
        if result == 0:
            with lock:
                open_ports.append(port)
        s.close()
    except:
        pass
    finally:
        with lock:
            scanned[0] += 1

if __name__ == "__main__":
    print(f"=" * 50)
    print(f"  IIDPS Port Scan Test")
    print(f"  Target: {TARGET}")
    print(f"  Ports:  {PORT_RANGE[0]} - {PORT_RANGE[1]}")
    print(f"=" * 50)
    print(f"\nStarting scan...")

    start = time.time()
    threads = []

    for port in range(PORT_RANGE[0], PORT_RANGE[1] + 1):
        t = threading.Thread(target=scan_port, args=(port,))
        threads.append(t)
        t.start()

        # Limit active threads
        if len(threads) >= THREADS:
            for t in threads:
                t.join()
            threads = []
            total = PORT_RANGE[1] - PORT_RANGE[0] + 1
            print(f"  Scanned {scanned[0]}/{total} ports...", end="\r")

    for t in threads:
        t.join()

    elapsed = time.time() - start
    print(f"\n\nScan complete in {elapsed:.1f}s")
    print(f"Open ports found: {open_ports if open_ports else 'None'}")
    print(f"\n>> Check your IIDPS dashboard for Port Scan alerts!")
