'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { checkClockSync, generateWebhookSecret } from '@/lib/webhook-security'
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Copy,
  KeyRound,
  RefreshCcw,
} from 'lucide-react'

interface WebhookVerificationProps {
  webhookUrl?: string
  endpointId?: string
  onGenerateSecret?: (secret: string) => void
}

/**
 * Component for webhook verification and testing following Webduh standards
 * Created according to David and Amber's requirements
 */
export function WebhookVerification({
  webhookUrl = '',
  endpointId = '',
  onGenerateSecret,
}: WebhookVerificationProps) {
  const [url, setUrl] = useState(webhookUrl)
  const [secret, setSecret] = useState('')
  const [clockSynced, setClockSynced] = useState<boolean | null>(null)
  const [clockDrift, setClockDrift] = useState<number | null>(null)
  const [testStatus, setTestStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [testResponse, setTestResponse] = useState<any>(null)

  // Check clock synchronization on mount
  useEffect(() => {
    const verifyClockSync = async () => {
      const { isSynced, drift } = await checkClockSync()
      setClockSynced(isSynced)
      setClockDrift(drift)
    }

    verifyClockSync()
  }, [])

  // Generate a new secret
  const handleGenerateSecret = () => {
    const newSecret = generateWebhookSecret()
    setSecret(newSecret)

    if (onGenerateSecret) {
      onGenerateSecret(newSecret)
    }
  }

  // Test webhook connection
  const testWebhook = async () => {
    if (!url || !secret) {
      return
    }

    setTestStatus('loading')

    try {
      // Send a test webhook
      const response = await fetch('/api/mcp/server?register_webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationId: endpointId || 'test-endpoint',
          callbackUrl: url,
          clientSecret: secret,
        }),
      })

      const data = await response.json()
      setTestResponse(data)

      if (response.ok) {
        setTestStatus('success')
      } else {
        setTestStatus('error')
      }
    } catch (error) {
      console.error('Error testing webhook:', error)
      setTestStatus('error')
      setTestResponse({ error: 'Failed to connect to webhook endpoint' })
    }
  }

  // Copy webhook URL to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Webduh Webhook Verification
        </CardTitle>
        <CardDescription>
          Verify and test webhook configurations according to Webduh standards
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {clockSynced !== null && (
          <Alert variant={clockSynced ? 'default' : 'destructive'}>
            <Clock className="h-4 w-4" />
            <AlertTitle>System Clock Status</AlertTitle>
            <AlertDescription>
              {clockSynced
                ? `Clock is synchronized (drift: ${clockDrift}ms)`
                : `Warning: System clock is not synchronized (drift: ${clockDrift}ms). Webhook timestamp validation may fail.`}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="config">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="test">Test Connection</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Webhook URL</label>
              <div className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-service.com/webhooks/mcp"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(url)}
                  disabled={!url}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Webhook Secret</label>
              <div className="flex gap-2">
                <Input
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Your webhook secret"
                  type="password"
                />
                <Button variant="outline" onClick={handleGenerateSecret}>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                The secret is used to sign webhooks and verify their
                authenticity. Keep this value secure and never expose it in
                client-side code.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Security Notes</label>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                <li>
                  Webhooks are signed with HMAC-SHA256 and include a timestamp
                </li>
                <li>
                  Webhooks older than 5 minutes are automatically rejected
                </li>
                <li>Duplicate webhooks are detected and ignored</li>
                <li>
                  All webhook data is enriched with metadata as per Webduh
                  standards
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="test" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Test Webhook Connection
                </label>
                <Badge
                  variant={
                    testStatus === 'idle'
                      ? 'outline'
                      : testStatus === 'loading'
                      ? 'secondary'
                      : testStatus === 'success'
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {testStatus === 'idle'
                    ? 'Not Tested'
                    : testStatus === 'loading'
                    ? 'Testing...'
                    : testStatus === 'success'
                    ? 'Connected'
                    : 'Failed'}
                </Badge>
              </div>

              <Button
                onClick={testWebhook}
                disabled={!url || !secret || testStatus === 'loading'}
                className="w-full"
              >
                {testStatus === 'loading' ? (
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                ) : testStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : testStatus === 'error' ? (
                  <AlertCircle className="h-4 w-4 mr-2" />
                ) : null}
                Test Connection
              </Button>
            </div>

            {testResponse && (
              <div className="rounded border p-4 bg-muted/50">
                <p className="text-sm font-medium mb-2">Response:</p>
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Following Webduh security standards established by David and Amber
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open('/docs/webhook-security.md', '_blank')}
        >
          View Documentation
        </Button>
      </CardFooter>
    </Card>
  )
}
