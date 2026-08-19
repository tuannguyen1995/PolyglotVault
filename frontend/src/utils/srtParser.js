/**
 * Simple parser for SRT and VTT subtitle formats.
 */
export function parseSubtitle(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = text.split(/\n\s*\n/);
  const cues = [];

  for (let i = 0; i < blocks.length; i++) {
    const lines = blocks[i].trim().split('\n');
    if (lines.length === 0 || !lines[0]) continue;

    // Check if line 0 is index or WEBVTT header
    let timeIndex = 0;
    if (lines[0].toUpperCase().startsWith('WEBVTT') || lines[0].startsWith('NOTE')) {
      continue;
    }

    if (/^\d+$/.test(lines[0].trim()) && lines.length > 1) {
      timeIndex = 1;
    }

    const timeLine = lines[timeIndex];
    if (timeLine && (timeLine.includes('-->') || timeLine.includes('->'))) {
      const parts = timeLine.split(/-->|->/);
      const start = parts[0]?.trim() || '00:00:00,000';
      const end = parts[1]?.trim() || '00:00:00,000';
      const subtitleText = lines.slice(timeIndex + 1).join('\n').trim();

      cues.push({
        id: i + 1,
        start,
        end,
        text: subtitleText || '(No subtitle content)'
      });
    } else if (lines.length > 0) {
      // Fallback for simple line-by-line text
      cues.push({
        id: i + 1,
        start: `00:00:${String(i * 4).padStart(2, '0')},000`,
        end: `00:00:${String((i + 1) * 4).padStart(2, '0')},000`,
        text: lines.join('\n').trim()
      });
    }
  }

  return cues;
}
