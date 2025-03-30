const { exec } = require('child_process')
const util = require('util')
const execPromise = util.promisify(exec)
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.development' })

const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  section: (msg) => console.log(`\n\x1b[1m\x1b[34m==== ${msg} ====\x1b[0m\n`),
}

async function runCommand(command, description) {
  log.info(`Running: ${command} (${description})`)
  try {
    const { stdout, stderr } = await execPromise(command)
    if (stderr && !stderr.includes('warning')) {
      log.warning(`Command produced warnings: ${stderr}`)
    }
    log.success(`${description} completed successfully`)
    return stdout
  } catch (error) {
    log.error(`${description} failed: ${error.message}`)
    if (error.stdout) console.log(error.stdout)
    if (error.stderr) console.log(error.stderr)
    throw error
  }
}

async function checkDockerRunning() {
  log.section('Checking Docker Status')
  try {
    await execPromise('docker info')
    log.success('Docker is running')
    return true
  } catch (error) {
    log.error('Docker is not running. Please start Docker first.')
    return false
  }
}

async function checkDatabaseConnection() {
  log.section('Checking Database Connection')

  const { Client } = require('pg')

  // Get credentials from environment variables
  const dbHost = process.env.DB_HOST || 'localhost'
  const dbPort = parseInt(process.env.DB_PORT || '5432')
  const dbUser = process.env.DB_USER || 'postgres'
  const dbPassword = process.env.DB_PASSWORD

  if (!dbPassword) {
    log.error('DB_PASSWORD environment variable is not set')
    return false
  }

  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres',
  })

  try {
    await client.connect()
    log.success('Connected to PostgreSQL successfully')

    // Check if our app database exists
    const targetDb = process.env.TARGET_DB_NAME || 'b2b_network'
    const checkResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${targetDb}'`
    )

    if (checkResult.rowCount === 0) {
      log.warning(
        `Database '${targetDb}' does not exist. You may need to run create-db.js`
      )
    } else {
      log.success(`Database '${targetDb}' exists`)
    }

    await client.end()
    return true
  } catch (error) {
    log.error(`Database connection failed: ${error.message}`)
    return false
  }
}

async function checkSupabaseConnection() {
  log.section('Checking Supabase Connection')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    log.warning(
      'NEXT_PUBLIC_SUPABASE_URL environment variable is not set. Skipping Supabase check.'
    )
    return true // Returning true since this might be optional
  }

  try {
    // Use simple HTTP request to check if Supabase is up
    const http = require('http')
    const url = new URL(supabaseUrl)

    return new Promise((resolve) => {
      const req = http.get(
        {
          hostname: url.hostname,
          port: url.port,
          path: '/health',
          timeout: 5000,
        },
        (res) => {
          if (res.statusCode === 200) {
            log.success('Supabase is running and accessible')
            resolve(true)
          } else {
            log.warning(`Supabase responded with status code ${res.statusCode}`)
            resolve(false)
          }
        }
      )

      req.on('error', (err) => {
        log.error(`Supabase connection failed: ${err.message}`)
        log.warning(
          'If you are using a remote Supabase instance, this is normal when testing locally.'
        )
        resolve(false)
      })

      req.on('timeout', () => {
        log.error('Supabase connection timed out')
        req.destroy()
        resolve(false)
      })
    })
  } catch (error) {
    log.error(`Supabase check failed: ${error.message}`)
    return false
  }
}

async function checkDependencies() {
  log.section('Checking Dependencies')

  // Check if node_modules exists
  if (!fs.existsSync(path.join(__dirname, '../node_modules'))) {
    log.error(
      'node_modules directory not found. Run npm install or pnpm install first.'
    )
    return false
  }

  try {
    // Check for drizzle
    await execPromise('npx drizzle-kit --version')
    log.success('Drizzle is installed')

    // Check for Next.js
    const packageJson = require('../package.json')
    if (packageJson.dependencies.next) {
      log.success(`Next.js is installed (${packageJson.dependencies.next})`)
    } else {
      log.error('Next.js is not installed according to package.json')
      return false
    }

    return true
  } catch (error) {
    log.error(`Dependency check failed: ${error.message}`)
    return false
  }
}

async function checkEnvironmentVariables() {
  log.section('Checking Environment Variables')

  const requiredVars = [
    'DATABASE_URL',
    'DB_PASSWORD',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ]

  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    log.error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    )
    log.warning('Make sure your .env.development file is properly set up')
    return false
  } else {
    log.success('All required environment variables are set')
    return true
  }
}

async function checkNextJsBuild() {
  log.section('Checking Next.js Build')

  try {
    // Check if we can build the Next.js app
    await runCommand('npx next build --no-lint', 'Next.js build')
    return true
  } catch (error) {
    log.error(`Next.js build check failed: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('\n🚀 Starting system check...\n')

  let success = true

  try {
    // Run all checks
    const dockerRunning = await checkDockerRunning()
    const depsOk = await checkDependencies()
    const envVarsOk = await checkEnvironmentVariables()
    const dbOk = await checkDatabaseConnection()
    const supabaseOk = await checkSupabaseConnection()
    const nextJsOk = await checkNextJsBuild()

    // Calculate overall status
    success = dockerRunning && depsOk && envVarsOk && dbOk && nextJsOk // Supabase is optional

    // Display summary
    log.section('SUMMARY')
    console.log(`Docker:     ${dockerRunning ? '✅' : '❌'}`)
    console.log(`Dependencies: ${depsOk ? '✅' : '❌'}`)
    console.log(`Environment: ${envVarsOk ? '✅' : '❌'}`)
    console.log(`Database:   ${dbOk ? '✅' : '❌'}`)
    console.log(`Supabase:   ${supabaseOk ? '✅' : '⚠️'}`)
    console.log(`Next.js:    ${nextJsOk ? '✅' : '❌'}`)

    if (success) {
      console.log(
        '\n✅ All system checks passed! Your application should work correctly.\n'
      )
      console.log('To run the application, use:')
      console.log('  npm run dev   # or pnpm dev')
    } else {
      console.log(
        '\n❌ Some system checks failed. Please fix the issues above.\n'
      )
    }
  } catch (error) {
    log.error(`System check failed with an unexpected error: ${error.message}`)
    success = false
  }

  process.exit(success ? 0 : 1)
}

main()
