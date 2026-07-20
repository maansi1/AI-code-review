#!/bin/bash

# Function to handle cleanup on exit
cleanup() {
    echo "Shutting down backend and frontend..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup EXIT

echo "Starting Backend (Spring Boot)..."
MVN_BIN="/Applications/IntelliJ IDEA.app/Contents/plugins/maven/lib/maven3/bin/mvn"
(cd backend && "$MVN_BIN" spring-boot:run -Dspring-boot.run.jvmArguments="-Xmx512m -XX:TieredStopAtLevel=1") &

echo "Starting Frontend (Vite) on port 5173..."
(cd frontend && npm run dev -- --port 5173 --strictPort) &

echo "Both services are starting. Press Ctrl+C to stop both."
wait
