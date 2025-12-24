/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'node:path';
import os from 'node:os';
import { LocalIndex } from 'vectra';
import { v4 as uuidv4 } from 'uuid';

const VECTOR_DB_PATH = path.join(os.homedir(), '.gemini', 'vector_db');

// Mock embedding function (Placeholder for OpenAI/Local ONNX)
// In a real scenario, this returns a 1536-dim vector from an LLM.
function getFakeEmbedding(_text) {
  // Generate a random vector of dimension 10 for demonstration
  return Array.from({ length: 10 }, () => Math.random());
}

async function main() {
  console.log(`[Memory] Initializing Vector DB at: ${VECTOR_DB_PATH}`);

  const index = new LocalIndex(VECTOR_DB_PATH);

  if (!(await index.isIndexCreated())) {
    await index.createIndex();
    console.log('[Memory] New index created.');
  } else {
    console.log('[Memory] Existing index found.');
  }

  // Example: Adding a memory
  const memoryText =
    'Gemini was initialized on 2025-12-24 with autonomous admin rights.';
  const item = {
    id: uuidv4(),
    vector: getFakeEmbedding(memoryText),
    metadata: {
      text: memoryText,
      type: 'fact',
      created_at: new Date().toISOString(),
    },
  };

  await index.insertItem(item);
  console.log(`[Memory] Inserted fact: "${memoryText}"`);

  // Example: Querying (Mock)
  // In reality, we would query with an embedding of the question.
  const queryVector = getFakeEmbedding('When was Gemini born?');
  const results = await index.queryItems(queryVector, 3);

  console.log(`[Memory] Query test complete. Found ${results.length} matches.`);
}

main().catch(console.error);
