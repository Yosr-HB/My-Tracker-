#!/usr/bin/env node

/**
 * Development Server Startup Script
 * Starts both Flask backend and React frontend
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Task Tracker Development Environment...');
console.log('');

// Function to start a process
function startProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    process.on('error', (err) => {
      console.error(`Failed to start ${command}:`, err);
      reject(err);
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`${command} exited successfully`);
        resolve();
      } else {
        console.log(`${command} exited with code ${code}`);
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

// Start both servers
async function startDevelopment() {
  try {
    console.log('Backend: http://localhost:8000');
    console.log('Frontend: http://localhost:3000');
    console.log('API Docs: http://localhost:8000/api/docs');
    console.log('');

    // Start backend in background
    const backendPromise = startProcess('python', ['backend/run_fastapi.py'], {
      cwd: __dirname + '/../'
    });

    // Wait a moment for backend to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start frontend
    const frontendPromise = startProcess('npm', ['run', 'frontend'], {
      cwd: __dirname + '/../'
    });

    // Wait for both to complete (they run indefinitely)
    await Promise.all([backendPromise, frontendPromise]);

  } catch (error) {
    console.error('Development environment failed to start:', error);
    process.exit(1);
  }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\nShutting down development environment...');
  process.exit(0);
});

startDevelopment();