const chunks = [];

const processedAt = new Date().toISOString();
const chunkSize = 1000;
const overlapLines = 2;

// =====================
// METADATA
// =====================
const triggerData = $("Google Drive Trigger").item.json;

const fileName = triggerData.name || "unknown_file";
const fileId = triggerData.id || "0000";

// =====================
// INPUT
// =====================
let rawText = items[0]?.json?.content || items[0]?.json?.text || "";

if (!rawText.trim()) {
  return [];
}

// =====================
// NORMALIZE
// =====================
rawText = rawText
  .replace(/\r\n/g, "\n")
  .replace(/\r/g, "\n");

const lines = rawText.split("\n");

let currentChunk = "";
let chunkIndex = 1;

// =====================
// CHUNKING
// =====================
for (const line of lines) {

  const cleanLine = line.trim();

  if (!cleanLine) continue;

  if (
    currentChunk.length + cleanLine.length > chunkSize &&
    currentChunk.length > 0
  ) {

    chunks.push({
      json: {
        text_payload: currentChunk.trim(),
        metadata: {
          source_file: fileName,
          drive_id: fileId,
          chunk_index: chunkIndex++,
          data_type: "narrative_context",
          processed_at: processedAt
        }
      }
    });

    const overlap = currentChunk
      .split("\n")
      .slice(-overlapLines)
      .join("\n");

    currentChunk = overlap + "\n";
  }

  currentChunk += cleanLine + "\n";
}

// =====================
// FINAL FLUSH
// =====================
if (currentChunk.trim()) {
  chunks.push({
    json: {
      text_payload: currentChunk.trim(),
      metadata: {
        source_file: fileName,
        drive_id: fileId,
        chunk_index: chunkIndex,
        data_type: "narrative_context",
        processed_at: processedAt
      }
    }
  });
}

return chunks;
