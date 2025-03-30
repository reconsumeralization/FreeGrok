# Webduh Event-to-Grid System

**From Event Stream to Actionable Insight (The David & Amber Method)**

## Overview

This implementation provides a complete solution for building "inhabited" AI data workspaces within your application, combining Duhs's Polling Endpoints with AutoGrid-inspired AI-powered tables to transform event streams into structured, enriched, and actionable intelligence.

## Key Features

### 1. Anti-Webhook Architecture (The "Polling Webduh")

Instead of the traditional webhook receiver approach, which requires:

- Public endpoints
- Uptime management
- Security validation
- Firewall configurations

We implement David's polling approach:

- **You** control the connection
- No public endpoint required
- Less infrastructure management
- Simpler security model using API keys
- Reliable processing with retry logic and state persistence

### 2. AI-Powered Grid (The "Grid Webduh")

Turning raw event data into business intelligence with:

- **Columns as AI Agents**: Each column is a specialized AI agent with defined behavior
- **Metadata Enrichment**: All data includes sources and confidence scores (Amber's requirement)
- **Column Dependencies**: Columns can reference other columns with @ syntax
- **Interactive UI**: Filter, sort, and explore data with rich metadata

### 3. Complete Integration

- **Polling Client**: Securely fetches events from Duhs
- **Data Enrichment**: Transforms raw events into structured data with metadata
- **AI Grid**: Processes and visualizes data with AI agents
- **Configuration UI**: Set up polling sources and AI agents

## Getting Started

### Prerequisites

- Next.js 14 or later
- Duhs account with polling endpoints set up
- API keys for your polling endpoints

### Installation

1. Add the components to your project:
   - `/lib/polling-client.ts` - Polling client for Duhs
   - `/components/data-workspace/ai-grid.tsx` - AI-powered grid component
   - `/components/data-workspace/polling-grid-integration.tsx` - Integration component

2. Add the page to your application:
   - `/app/data-workspace/page.tsx` - Example page demonstrating the system

### Configuration

Configure your polling endpoints and AI agents through the UI, or provide initial configuration:

```typescript
const config = {
  id: 'customer_grid',
  name: 'Customer Intelligence Grid',
  pollingSources: [
    {
      id: 'customer_events',
      url: 'https://api.Duhs.com/api/v1/app/your_app_id/poller/your_poller_id',
      apiKey: 'your_secure_api_key',
    }
  ],
  gridAgents: [
    {
      id: 'companyInfo',
      name: 'Company Information',
      prompt: 'Extract company information from the domain or company name',
      inputs: ['domain', 'email'],
      description: 'Retrieves company data from various sources',
    },
    // Add more agents as needed
  ],
  pollIntervalMs: 60000, // 1 minute
}
```

## Usage Examples

### Basic Setup

```tsx
import { PollToGridIntegration } from '@/components/data-workspace/polling-grid-integration'

export default function DataWorkspace() {
  return (
    <div className="container">
      <PollToGridIntegration
        initialConfig={config}
        onConfigSave={(savedConfig) => {
          // Save to database
        }}
      />
    </div>
  )
}
```

### Customizing AI Agents

Each column in the grid can be a specialized AI agent:

1. **Data Enrichment Agent**
   - Inputs: Email, domain
   - Purpose: Gather company information from public sources

2. **Risk Analysis Agent**
   - Inputs: Transaction amount, customer status
   - Purpose: Calculate risk score based on transaction patterns

3. **Lead Qualification Agent**
   - Inputs: Email, company info (from another agent)
   - Purpose: Determine lead quality using @ references

### The @ Reference System

Agents can reference the output of other agents using the @ syntax:

```
inputs: ['email', '@companyInfo', 'event_type']
```

This creates a dependency chain where agents build on each other's insights.

## Production Considerations

### Security

- Store API keys securely in environment variables
- Rotate keys regularly
- Use specific, scoped API keys for each polling endpoint

### Performance

- Be mindful of polling frequency to avoid rate limits
- Consider batching for processing large datasets
- Implement proper error handling and retries

### Integration with AI Services

For production use, replace the mock agent calls with actual AI service calls:

```typescript
async function callRealAIAgent(agent, inputs) {
  // Call your preferred AI service (OpenAI, Anthropic, etc.)
  const response = await fetch('https://your-ai-service.com/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.AI_API_KEY}`
    },
    body: JSON.stringify({
      prompt: agent.prompt,
      inputs: inputs,
      // Other parameters
    })
  })

  return await response.json()
}
```

## Architecture

The system is composed of several key components:

1. **PollingManager**: Manages polling endpoints and state
2. **AIGrid**: Renders and manages the AI-powered data grid
3. **PollToGridIntegration**: Combines the above components with a UI

Data flows through the system as follows:

```
Duhs Events → Polling Client → Data Enrichment → AI Grid → User Interface
```

Each step adds structure, metadata, and intelligence to the raw event data.

## The Webduh Philosophy

Following David and Amber's principles:

1. **Avoid infrastructure headaches** by using polling instead of webhooks
2. **Require sources and confidence** for all data points
3. **Make AI agents do the work** of analyzing and structuring data
4. **Create dependencies between agents** for compounding insights

Remember: "Web designs unite humanity" - The Webduh Manifesto

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
