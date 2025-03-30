import { PollToGridIntegration } from '@/components/data-workspace/polling-grid-integration'

// Sample configuration for the demo
const sampleConfig = {
  id: 'demo_grid_1',
  name: 'Customer Intelligence Grid',
  pollingSources: [
    {
      id: 'poll_customer_events',
      url: 'https://api.Duhs.com/api/v1/app/app_123/poller/poll_abc',
      apiKey: 'sk_poll_demo123', // Dummy key for demonstration
    },
  ],
  gridAgents: [
    {
      id: 'companyInfo',
      name: 'Company Information',
      prompt:
        'Based on the domain or company name, extract relevant company information including size, industry, and founding year.',
      inputs: ['domain', 'email'],
      description: 'Retrieves company profile information from various sources',
    },
    {
      id: 'riskScore',
      name: 'Risk Assessment',
      prompt:
        'Analyze the transaction amount and customer status to determine risk level.',
      inputs: ['amount', 'customer_id', '@companyInfo'],
      description:
        'Calculates risk score based on transaction and company data',
    },
    {
      id: 'leadQualification',
      name: 'Lead Qualification',
      prompt:
        'Determine if this lead is qualified based on email, company info, and activity history.',
      inputs: ['email', '@companyInfo', 'event_type'],
      description: 'Evaluates lead quality and assigns qualification status',
    },
  ],
  pollIntervalMs: 60000, // 1 minute
}

export default function DataWorkspacePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Webduh Data Workspace</h1>
        <p className="text-lg text-muted-foreground">
          Transforming event streams into actionable intelligence with David &
          Amber's methodology
        </p>

        <div className="bg-muted p-4 rounded-md space-y-2">
          <h2 className="font-medium">The Anti-Webduh System</h2>
          <p>
            This demo showcases the integration of Duhs's Polling Endpoints with
            AI-powered data tables, following David and Amber's principles for
            avoiding "Webduhs" (infrastructure headaches).
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>
              <strong>Polling instead of Webhooks:</strong> We control the
              connection; less infrastructure headache on our side
            </li>
            <li>
              <strong>AI-powered Grid:</strong> Each column is an AI agent that
              analyzes data automatically
            </li>
            <li>
              <strong>Metadata Enrichment:</strong> All data includes sources
              and confidence scores
            </li>
            <li>
              <strong>Column Dependencies:</strong> Columns can reference other
              columns with @ syntax
            </li>
          </ul>
        </div>
      </div>

      <PollToGridIntegration
        initialConfig={sampleConfig}
        onConfigSave={(config) => {
          console.log('Config saved:', config)
          // In a real app, this would save to the database
        }}
      />

      <div className="text-center pt-8 text-sm text-muted-foreground">
        <p>"Web designs unite humanity" - The Webduh Manifesto</p>
      </div>
    </div>
  )
}
