/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'node:path';
import os from 'node:os';
import { LocalIndex } from 'vectra';
import { pipeline } from '@xenova/transformers';

const VECTOR_DB_PATH = path.join(os.homedir(), '.gemini', 'vector_db');

async function query(text) {
  const index = new LocalIndex(VECTOR_DB_PATH);
  if (!(await index.isIndexCreated())) {
    console.log('No index found.');
    return;
  }

  console.log(`[Query] Loading model...`);
  const extractor = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
  );

  console.log(`[Query] Searching for: "${text}"`);
  const result = await extractor(text, { pooling: 'mean', normalize: true });
  const vector = Array.from(result.data);

  const results = await index.queryItems(vector, 3); // Get top 3 matches

  if (results.length > 0) {
    console.log(`\n[Answer Context Found]`);
    results.forEach((item) => {
      console.log(
        `- Score: ${item.score.toFixed(4)} | Section: ${item.item.metadata.section}`,
      );
      console.log(`  Snippet: ${item.item.metadata.text.substring(0, 100)}...`);
    });
  } else {
    console.log('No relevant memory found.');
  }
}

const q = process.argv[2] || 'What is my backup strategy?';
query(q);
