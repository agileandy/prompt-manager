#!/bin/bash

# --- Configuration ---
# Command to start your development server
# Example: "npm run dev", "yarn dev", "python -m http.server 8000", etc.
SERVER_COMMAND="npm run dev"

# URL of your application
APP_URL="http://localhost:5173" # Common for Vite, adjust if needed

# File to store the server's PID
PID_FILE=".server.pid"

# Log file for server output
LOG_FILE="server_dev.log"

# Seconds to wait for the server to start before launching browser
SERVER_WAIT_SECONDS=5

# --- Functions ---
cleanup() {
  echo "" # Newline after user presses Enter or Ctrl+C
  echo "--- Cleaning up ---"
  if [ -f "$PID_FILE" ]; then
    SERVER_PID=$(cat "$PID_FILE")
    if ps -p "$SERVER_PID" > /dev/null; then
      echo "Attempting to stop server (PID: $SERVER_PID)..."
      # Try to terminate gracefully first
      kill "$SERVER_PID"
      # Wait a bit for graceful shutdown
      sleep 2
      # If still running, force kill
      if ps -p "$SERVER_PID" > /dev/null; then
        echo "Server did not stop gracefully, forcing shutdown (SIGKILL)..."
        kill -9 "$SERVER_PID"
      else
        echo "Server stopped."
      fi
    else
      echo "Server (PID: $SERVER_PID) was not running or PID file is stale."
    fi
    rm -f "$PID_FILE"
    echo "Removed PID file."
  else
    echo "No PID file found. Server might not have started correctly or was already stopped."
  fi
  echo "Cleanup complete. Exiting script."
  exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM (kill command) to run cleanup
trap cleanup SIGINT SIGTERM EXIT

# --- Main Script ---
echo "--- Starting Development Environment ---"

# Remove old PID file if it exists
if [ -f "$PID_FILE" ]; then
  rm -f "$PID_FILE"
  echo "Removed old PID file."
fi

echo "Starting server with command: $SERVER_COMMAND"
echo "Server output will be logged to: $LOG_FILE"

# Start the server in the background and save its PID
# Redirect stdout and stderr to the log file
nohup $SERVER_COMMAND > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"

echo "Server started in background (PID: $SERVER_PID)."
echo "Waiting $SERVER_WAIT_SECONDS seconds for server to initialize..."
sleep "$SERVER_WAIT_SECONDS"

# Check if server is still running
if ps -p "$SERVER_PID" > /dev/null; then
  echo "Server process (PID: $SERVER_PID) is running."
  echo "Opening browser at $APP_URL..."
  # Use 'open' for macOS, 'xdg-open' for Linux, or 'start' for Windows/Git Bash
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$APP_URL"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$APP_URL"
  elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    start "$APP_URL"
  else
    echo "Unsupported OS for automatic browser opening. Please open $APP_URL manually."
  fi
  echo ""
  echo "---------------------------------------------------------------------"
  echo "  Development server is running. Browser opened."
  echo "  View server logs in: $LOG_FILE"
  echo "  Press [Enter] in this terminal when you are done to stop the server."
  echo "---------------------------------------------------------------------"
  # Wait for user to press Enter
  read -r
else
  echo ""
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "  ERROR: Server process (PID: $SERVER_PID) does not seem to be running."
  echo "  Please check the log file for errors: $LOG_FILE"
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  # Cleanup will still run due to the trap
fi

# The 'trap' command will handle cleanup when the script exits from here
# (either by the user pressing Enter, or by other means like Ctrl+C if 'read' is interrupted)
