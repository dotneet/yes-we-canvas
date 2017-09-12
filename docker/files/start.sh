#!/bin/bash

nohup /usr/bin/google-chrome-unstable --remote-debugging-port=9222 --headless --disable-background-networking, --disable-background-timer-throttling, --disable-client-side-phishing-detection, --disable-default-apps, --disable-hang-monitor, --disable-popup-blocking, --disable-prompt-on-repost, --disable-sync, --enable-automation, --enable-devtools-experiments, --metrics-recording-only, --no-first-run, --password-store=basic, --safebrowsing-disable-auto-update, --use-mock-keychaini &

cd yes-we-canvas
node src/server

