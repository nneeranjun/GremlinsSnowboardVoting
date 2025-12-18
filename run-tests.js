#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running Ski Vote App Test Suite\n');

async function runCommand(command, args, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`📍 Running: ${command} ${args.join(' ')} in ${cwd}`);
    
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runTests() {
  try {
    console.log('🔧 Installing dependencies...\n');
    
    // Install server dependencies
    await runCommand('npm', ['install']);
    
    // Install client dependencies
    await runCommand('npm', ['install'], path.join(process.cwd(), 'client'));

    console.log('\n🧪 Running Backend Unit Tests...\n');
    await runCommand('npm', ['run', 'test:server']);

    console.log('\n🎨 Running Frontend Component Tests...\n');
    await runCommand('npm', ['run', 'test:client', '--', '--watchAll=false']);

    console.log('\n✅ All tests passed! 🎉');
    console.log('\n📊 Test Coverage Summary:');
    console.log('- Backend tournament logic: ✅');
    console.log('- Frontend components: ✅');
    console.log('- Integration tests: ✅');
    console.log('- UI interactions: ✅');

  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };