/**
 * One-time script to upload all player headshots from the MLB CDN to S3.
 *
 * Usage:
 *   node scripts/uploadHeadshots.mjs
 *
 * Prerequisites:
 *   - AWS CLI configured (aws configure)
 *   - S3 bucket already created and configured for public read
 *   - npm install (to have @aws-sdk/client-s3 available)
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const BUCKET = 'outside-baseball-headshots';
const REGION = 'us-east-1';
const HEADSHOT_PREFIX = 'headshots';
const BATCH_SIZE = 10; // concurrent uploads

const __dirname = dirname(fileURLToPath(import.meta.url));
const playerIds = JSON.parse(
  readFileSync(join(__dirname, '../public/data/playerIds.json'), 'utf8')
);

const s3 = new S3Client({ region: REGION });

function mlbCdnUrl(mlbId) {
  return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_360,q_auto:best/v1/people/${mlbId}/headshot/67/current`;
}

async function alreadyUploaded(mlbId) {
  try {
    await s3.send(new HeadObjectCommand({
      Bucket: BUCKET,
      Key: `${HEADSHOT_PREFIX}/${mlbId}.jpg`,
    }));
    return true;
  } catch {
    return false;
  }
}

async function uploadHeadshot(name, mlbId) {
  const key = `${HEADSHOT_PREFIX}/${mlbId}.jpg`;

  if (await alreadyUploaded(mlbId)) {
    process.stdout.write(`  skip  ${name} (${mlbId})\n`);
    return { status: 'skipped' };
  }

  const res = await fetch(mlbCdnUrl(mlbId));
  if (!res.ok) {
    process.stdout.write(`  WARN  ${name} (${mlbId}) — CDN returned ${res.status}\n`);
    return { status: 'failed' };
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    CacheControl: 'public, max-age=604800', // 1 week
  }));

  process.stdout.write(`  ok    ${name} (${mlbId})\n`);
  return { status: 'uploaded' };
}

async function main() {
  const entries = Object.entries(playerIds);
  console.log(`\nUploading ${entries.length} headshots → s3://${BUCKET}/${HEADSHOT_PREFIX}/\n`);

  const results = { uploaded: 0, skipped: 0, failed: 0 };

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(([name, id]) => uploadHeadshot(name, id))
    );
    batchResults.forEach(r => results[r.status]++);
    console.log(`  — ${Math.min(i + BATCH_SIZE, entries.length)}/${entries.length} processed`);
  }

  console.log(`\nDone. uploaded=${results.uploaded} skipped=${results.skipped} failed=${results.failed}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
