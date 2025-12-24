/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { LocalIndex } from 'vectra';
import { v4 as uuidv4 } from 'uuid';
import { pipeline } from '@xenova/transformers';

const PROJECT_ROOT = process.cwd();
const MEMORY_FILE = path.join(PROJECT_ROOT, 'GEMINI.md');
const VECTOR_DB_PATH = path.join(os.homedir(), '.gemini', 'vector_db');

// Real embedding using a local model
async function getEmbedding(text, extractor) {
  const result = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}

async function ingest() {
  if (!fs.existsSync(MEMORY_FILE)) return;

  const index = new LocalIndex(VECTOR_DB_PATH);
  if (!(await index.isIndexCreated())) await index.createIndex();

  console.log('[Memory] Loading embedding model (Xenova/all-MiniLM-L6-v2)...');
  const extractor = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
  );

  const content = fs.readFileSync(MEMORY_FILE, 'utf-8');

  // Split by Markdown headers (##)
  const sections = content.split(/^## /gm).slice(1); // Skip preamble

  console.log(
    `[Memory] Ingesting ${sections.length} sections from GEMINI.md...`,
  );

  for (const section of sections) {
    const lines = section.split('\n');
    const title = lines[0].trim();
    const body = lines.slice(1).join('\n').trim();

    if (!body) continue;

    // Generate real embedding
    const vector = await getEmbedding(title + '\n' + body, extractor);

    // Create a memory item
    const item = {
      id: uuidv4(),
      vector: vector,
      metadata: {
        source: 'GEMINI.md',
        section: title,
        text: body, // Storing full text for retrieval
        ingested_at: new Date().toISOString(),
      },
    };

    await index.insertItem(item);
    console.log(`[Memory] Indexed section: "${title}"`);
  }
  console.log('[Memory] Ingestion complete.');
}

ingest().catch((err) => console.error(err));
