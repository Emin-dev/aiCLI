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

function getEmbedding(_text) {
  return Array.from({ length: 10 }, () => Math.random());
}

async function main() {
  const index = new LocalIndex(VECTOR_DB_PATH);

  if (!(await index.isIndexCreated())) {
    await index.createIndex();
  }

  const memoryText = 'System initialized.';
  const item = {
    id: uuidv4(),
    vector: getEmbedding(memoryText),
    metadata: {
      text: memoryText,
      type: 'init',
      created_at: new Date().toISOString(),
    },
  };

  await index.insertItem(item);
}

main().catch(() => {});
