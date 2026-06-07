const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\duong\\.gemini\\antigravity-ide\\brain\\c49ac19a-1d59-4604-944a-38a08c648c09\\.system_generated\\logs\\transcript.jsonl';
const targetPath = 'd:\\SUPPORT_FULL\\SP_EXE202\\Livaxis\\FE\\src\\page\\AIRoomPlanner.tsx';

function cleanChunk(content) {
  // Remove the prefix header "Created At: ..." etc.
  const lines = content.split('\n');
  const cleanedLines = [];
  
  for (let line of lines) {
    // Check if line starts with line number, e.g., "123: "
    const match = line.match(/^(\d+): (.*)$/);
    if (match) {
      cleanedLines.push(match[2]);
    } else {
      // If it doesn't have the prefix, skip it if it's header stuff
      if (line.startsWith('Created At:') || line.startsWith('Completed At:') || line.startsWith('File Path:') || line.startsWith('Total Lines:') || line.startsWith('Total Bytes:') || line.startsWith('Showing lines') || line.startsWith('The following code has been modified') || line.startsWith('Please note that any changes')) {
        continue;
      }
      // Keep empty lines or other content if it fits
      if (line.trim() === '') {
        cleanedLines.push('');
      }
    }
  }
  return cleanedLines.join('\n');
}

try {
  const fileContent = fs.readFileSync(logPath, 'utf8');
  const lines = fileContent.split('\n');
  
  let chunk1 = '';
  let chunk2 = '';
  let chunk3 = '';
  let chunk4 = '';
  
  for (let line of lines) {
    if (!line.trim()) continue;
    const obj = JSON.parse(line);
    
    // We want the system/tool output steps:
    // Step 204 is output of lines 1-800
    // Step 214 is output of lines 801-1600
    // Step 216 is output of lines 1601-2400
    // Step 218 is output of lines 2401-2940
    if (obj.step_index === 204) {
      chunk1 = cleanChunk(obj.content);
    } else if (obj.step_index === 214) {
      chunk2 = cleanChunk(obj.content);
    } else if (obj.step_index === 216) {
      chunk3 = cleanChunk(obj.content);
    } else if (obj.step_index === 218) {
      chunk4 = cleanChunk(obj.content);
    }
  }
  
  if (!chunk1 || !chunk2 || !chunk3 || !chunk4) {
    console.error('Failed to find all 4 chunks in the transcript!');
    console.error('chunk1:', !!chunk1, 'chunk2:', !!chunk2, 'chunk3:', !!chunk3, 'chunk4:', !!chunk4);
    process.exit(1);
  }
  
  // Combine all chunks
  const fullContent = [chunk1, chunk2, chunk3, chunk4].join('\n');
  
  fs.writeFileSync(targetPath, fullContent, 'utf8');
  console.log('Successfully restored AIRoomPlanner.tsx to its pre-reverted state!');
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
