import { createHash } from 'crypto'

/**
 * Types for the metadata-enriched data structure required by Webduh
 */
export interface WebduhMetadata {
  sources: string[]
  confidenceScore: number
  additionalDetails?: string
}

export interface EnrichedCell {
  value: string
  metadata: WebduhMetadata
}

export interface EnrichedRow {
  cells: Record<string, EnrichedCell>
  id: string
}

export interface EnrichedWebhookPayload {
  row: EnrichedRow
  processed_at: string
  webhook_id: string
}

/**
 * Options for enriching webhook data
 */
export interface EnrichmentOptions {
  /**
   * Default confidence score if not provided
   */
  defaultConfidenceScore?: number

  /**
   * Additional data sources to include
   */
  additionalSources?: string[]

  /**
   * Function to generate row IDs
   */
  idGenerator?: (data: any) => string
}

/**
 * Generate a stable ID for a data row
 *
 * @param data The data to generate an ID for
 * @returns A stable ID string
 */
function generateStableId(data: any): string {
  const hash = createHash('sha256')
  hash.update(JSON.stringify(data))
  return `sr_${hash.digest('hex').substring(0, 8)}`
}

/**
 * Enriches webhook payload data with the required metadata structure
 *
 * @param rawData The raw webhook payload data
 * @param sources The data sources to attribute
 * @param options Additional enrichment options
 * @returns Enriched webhook payload data
 */
export function enrichWebhookData(
  rawData: Record<string, any>,
  sources: string[] = [],
  options: EnrichmentOptions = {}
): EnrichedWebhookPayload {
  const {
    defaultConfidenceScore = 70,
    additionalSources = [],
    idGenerator = generateStableId,
  } = options

  // Combine all sources
  const allSources = [...sources, ...additionalSources].filter(Boolean)

  // Process the data into cells with metadata
  const cells: Record<string, EnrichedCell> = {}

  for (const [key, value] of Object.entries(rawData)) {
    if (value && typeof value !== 'object') {
      // Simple value, add metadata
      cells[key] = {
        value: String(value),
        metadata: {
          sources: allSources,
          confidenceScore: defaultConfidenceScore,
          additionalDetails: `Processed via Webduh webhook enrichment`,
        },
      }
    } else if (value && typeof value === 'object') {
      // Check if this is already in the enriched format
      if ('value' in value && 'metadata' in value) {
        // Already has metadata structure, just ensure it meets requirements
        cells[key] = {
          value: String(value.value),
          metadata: {
            sources: [...(value.metadata.sources || []), ...allSources],
            confidenceScore:
              value.metadata.confidenceScore || defaultConfidenceScore,
            additionalDetails: value.metadata.additionalDetails || undefined,
          },
        }
      } else {
        // Complex object, stringify it
        cells[key] = {
          value: JSON.stringify(value),
          metadata: {
            sources: allSources,
            confidenceScore: defaultConfidenceScore,
            additionalDetails: `Complex data structure simplified`,
          },
        }
      }
    }
  }

  // Generate a stable row ID
  const rowId = idGenerator(rawData)

  return {
    row: {
      cells,
      id: rowId,
    },
    processed_at: new Date().toISOString(),
    webhook_id: `wh_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .substr(2, 5)}`,
  }
}

/**
 * Calculates a confidence score based on source quality and data completeness
 *
 * @param sources Array of data sources
 * @param data The data being evaluated
 * @returns A confidence score between 0-100
 */
export function calculateConfidenceScore(sources: string[], data: any): number {
  // Base score starts at 50
  let score = 50

  // Increase score based on number and quality of sources
  if (sources && sources.length) {
    // Up to +30 points for sources
    score += Math.min(sources.length * 10, 30)

    // Bonus for high-quality sources
    const highQualitySources = sources.filter(
      (source) =>
        source.includes('linkedin.com') ||
        source.includes('crunchbase.com') ||
        source.includes('sec.gov') ||
        source.includes('github.com')
    )

    if (highQualitySources.length > 0) {
      score += 10
    }
  }

  // Check data completeness
  if (data && typeof data === 'object') {
    // Up to +10 points for data completeness
    const completenessScore = Math.min(Object.keys(data).length, 10)
    score += completenessScore
  }

  // Cap at 100
  return Math.min(score, 100)
}

/**
 * Updates a single field in the enriched data with new information
 * and recalculates the confidence score
 */
export function updateEnrichedField(
  enrichedData: EnrichedWebhookPayload,
  fieldName: string,
  value: string,
  additionalSources: string[] = [],
  details?: string
): EnrichedWebhookPayload {
  const updatedData = { ...enrichedData }
  const field = updatedData.row.cells[fieldName]

  if (!field) {
    // Create new field
    updatedData.row.cells[fieldName] = {
      value,
      metadata: {
        sources: additionalSources,
        confidenceScore: calculateConfidenceScore(additionalSources, value),
        additionalDetails: details,
      },
    }
  } else {
    // Update existing field
    const updatedSources = [
      ...new Set([...field.metadata.sources, ...additionalSources]),
    ]

    updatedData.row.cells[fieldName] = {
      value,
      metadata: {
        sources: updatedSources,
        confidenceScore: calculateConfidenceScore(updatedSources, value),
        additionalDetails: details || field.metadata.additionalDetails,
      },
    }
  }

  return updatedData
}
