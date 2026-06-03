const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Execute git diff directly from Node (inherits clean terminal encoding)
  const diffBuffer = execSync('git diff', { maxBuffer: 50 * 1024 * 1024 });
  const content = diffBuffer.toString('utf8');
  const lines = content.split('\n');

  let currentFile = '';
  const fileEdits = {};

  for (const line of lines) {
    const cleanLine = line.replace(/\r/g, '');
    if (cleanLine.startsWith('diff --git')) {
      const match = cleanLine.match(/b\/(FE\/src\/[^\s]+)/);
      currentFile = match ? match[1] : '';
      if (currentFile) {
        fileEdits[currentFile] = [];
      }
    } else if (currentFile) {
      if (cleanLine.startsWith('-') && !cleanLine.startsWith('---')) {
        const prev = fileEdits[currentFile][fileEdits[currentFile].length - 1];
        if (prev && prev.type === 'minus') {
          prev.text += '\n' + cleanLine.slice(1);
        } else {
          fileEdits[currentFile].push({ type: 'minus', text: cleanLine.slice(1) });
        }
      } else if (cleanLine.startsWith('+') && !cleanLine.startsWith('+++')) {
        const prev = fileEdits[currentFile][fileEdits[currentFile].length - 1];
        if (prev && prev.type === 'plus') {
          prev.text += '\n' + cleanLine.slice(1);
        } else {
          fileEdits[currentFile].push({ type: 'plus', text: cleanLine.slice(1) });
        }
      }
    }
  }

  let outputText = '';
  for (const [file, edits] of Object.entries(fileEdits)) {
    outputText += `\n=== FILE: ${file} ===\n`;
    for (let i = 0; i < edits.length; i++) {
      const edit = edits[i];
      if (edit.type === 'minus') {
        const next = edits[i + 1];
        if (next && next.type === 'plus') {
          outputText += `[EN] ${edit.text.trim()}\n[VI] ${next.text.trim()}\n---\n`;
          i++;
        } else {
          outputText += `[EN ONLY] ${edit.text.trim()}\n---\n`;
        }
      } else {
        outputText += `[VI ONLY] ${edit.text.trim()}\n---\n`;
      }
    }
  }

  fs.writeFileSync('d:\\Livaxis\\parsed_pairs.txt', outputText, 'utf8');
  console.log('Done parsing directly from git diff buffer.');
} catch (err) {
  console.error('Error executing git diff:', err);
}
