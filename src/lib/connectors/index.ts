/**
 * @module connectors
 * @description Global tender platform connectors
 */

export * from './base-connector';
export * from './ted-connector';
export * from './sam-connector';

import { TEDConnector } from './ted-connector';
import { SAMConnector } from './sam-connector';
import type { BaseConnector, SourceId } from './base-connector';

/**
 * Connector factory - creates connector instance by source ID
 */
export function createConnector(sourceId: SourceId): BaseConnector {
  switch (sourceId) {
    case 'ted':
      return new TEDConnector();
    case 'sam_gov':
      return new SAMConnector();
    default:
      throw new Error(`Unsupported connector: ${sourceId}`);
  }
}

/**
 * Get all available connectors
 */
export function getAllConnectors(): BaseConnector[] {
  return [new TEDConnector(), new SAMConnector()];
}
