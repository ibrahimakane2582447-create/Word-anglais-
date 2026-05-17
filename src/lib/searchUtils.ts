export function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[a.length][b.length];
}

export function findBestMatches(term: string, words: { english: string; french: string }[], limit = 5) {
  if (!term) return [];
  
  const normalizedTerm = term.toLowerCase();
  
  // First, exact prefix matches
  const prefixMatches = words
    .filter(w => w.english.toLowerCase().startsWith(normalizedTerm) || w.french.toLowerCase().startsWith(normalizedTerm))
    .slice(0, limit);
    
  if (prefixMatches.length >= limit) return prefixMatches;
  
  // Then, fuzzy distance for typos
  const fuzzyMatches = words
    .map(w => {
      const distEn = getLevenshteinDistance(normalizedTerm, w.english.toLowerCase());
      const distFr = getLevenshteinDistance(normalizedTerm, w.french.toLowerCase());
      return { word: w, distance: Math.min(distEn, distFr) };
    })
    .filter(m => m.distance <= 2) // Max 2 edits
    .sort((a, b) => a.distance - b.distance)
    .map(m => m.word);
    
  const combined = [...prefixMatches];
  for (const match of fuzzyMatches) {
    if (combined.length >= limit) break;
    if (!combined.find(c => c.english === match.english)) {
      combined.push(match);
    }
  }
  
  return combined;
}
