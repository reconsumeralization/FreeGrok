#!/usr/bin/env node

/**
 * Test script for webhook security
 *
 * Usage:
 *   ts-node scripts/test-webhook-security.ts
 */

import {
  verifyWebhookSignature,
  generateWebhookSignature,
} from '../lib/webhook-security'

// Test webhook verification
async function testWebhookSecurity() {
  console.log('Testing Webhook Security\n------------------------')

  // Test case 1: Valid webhook
  console.log('Test Case 1: Valid webhook')
  const secret = 'test-secret-key'
  const payload = JSON.stringify({
    event: 'test.event',
    data: { message: 'Hello, webhook!' },
  })

  // Generate a signature
  const { signature, timestamp } = generateWebhookSignature(secret, payload)
  console.log(`Generated signature: ${signature}`)
  console.log(`Timestamp: ${timestamp}`)

  try {
    const isValid = verifyWebhookSignature({
      secret,
      signature,
      payload,
      timestamp,
    })
    console.log('Verification result:', isValid ? 'VALID ✓' : 'INVALID ✗')
  } catch (error) {
    console.error('Verification error:', error)
  }

  // Test case 2: Invalid signature (tampered payload)
  console.log('\nTest Case 2: Invalid signature (tampered payload)')
  const tamperedPayload = JSON.stringify({
    event: 'test.event',
    data: { message: 'Tampered message!' },
  })

  try {
    verifyWebhookSignature({
      secret,
      signature,
      payload: tamperedPayload,
      timestamp,
    })
    console.log(
      'Verification result: VALID ✓ (This is bad! Should have failed)'
    )
  } catch (error) {
    console.log('Verification error (expected):', (error as Error).message)
    console.log(
      'Verification result: INVALID ✗ (Good! Detected tampered payload)'
    )
  }

  // Test case 3: Expired timestamp
  console.log('\nTest Case 3: Expired timestamp')
  const oldTimestamp = (parseInt(timestamp) - 600).toString() // 10 minutes ago

  try {
    verifyWebhookSignature({
      secret,
      signature,
      payload,
      timestamp: oldTimestamp,
    })
    console.log(
      'Verification result: VALID ✓ (This is bad! Should have failed)'
    )
  } catch (error) {
    console.log('Verification error (expected):', (error as Error).message)
    console.log(
      'Verification result: INVALID ✗ (Good! Detected expired timestamp)'
    )
  }

  // Test case 4: Future timestamp
  console.log('\nTest Case 4: Future timestamp')
  const futureTimestamp = (parseInt(timestamp) + 600).toString() // 10 minutes in future

  try {
    verifyWebhookSignature({
      secret,
      signature,
      payload,
      timestamp: futureTimestamp,
    })
    console.log(
      'Verification result: VALID ✓ (This is bad! Should have failed)'
    )
  } catch (error) {
    console.log('Verification error (expected):', (error as Error).message)
    console.log(
      'Verification result: INVALID ✗ (Good! Detected future timestamp)'
    )
  }

  // Test case 5: Incorrect secret
  console.log('\nTest Case 5: Incorrect secret')
  const wrongSecret = 'wrong-secret-key'

  try {
    verifyWebhookSignature({
      secret: wrongSecret,
      signature,
      payload,
      timestamp,
    })
    console.log(
      'Verification result: VALID ✓ (This is bad! Should have failed)'
    )
  } catch (error) {
    console.log('Verification error (expected):', (error as Error).message)
    console.log('Verification result: INVALID ✗ (Good! Detected wrong secret)')
  }

  console.log('\n------------------------')
  console.log('Testing complete!')
}

// Run the tests
testWebhookSecurity().catch(console.error)
