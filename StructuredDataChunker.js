let chunks = [];
const processedAt = new Date().toISOString();

let fileName = "unknown_file";
let fileId = "0000";

try {
  const triggerData = $('Google Drive Trigger').item?.json;
  if (triggerData?.name) fileName = triggerData.name;
  if (triggerData?.id) fileId = triggerData.id;
} catch (e) {
  // Safe fallback
}

const inputItems = typeof items !== 'undefined' ? items : [];
if (inputItems.length === 0) return [];

inputItems.forEach((item, index) => {
  const rowText = Object.entries(item.json)
    .filter(([k, v]) => v !== null && v !== undefined && v !== "" && k !== 'row_number')
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
    
  if (rowText.trim().length > 0) {
    chunks.push({
      text_payload: rowText,
      // We dump the entire dynamic row context here automatically
      metadata_dump: {
        ...item.json, // Dynamically includes every single column header automatically
        source_file: fileName,
        drive_id: fileId,
        chunk_index: index + 1,
        data_type: "structured_inventory_matrix",
        processed_at: processedAt
      }
    });
  }
});

// Return as individual items so n8n can loop through them smoothly one by one
return chunks.map(c => ({ json: c }));
