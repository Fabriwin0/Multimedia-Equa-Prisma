// Frequency analysis utilities
export function getAverageFrequency(frequencyData, start, end) {
  const slice = frequencyData.slice(start, end);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

export function analyzeFrequencyBands(frequencyData) {
  return {
    bass: getAverageFrequency(frequencyData, 0, 10),
    mid: getAverageFrequency(frequencyData, 11, 100),
    treble: getAverageFrequency(frequencyData, 101, 200)
  };
}