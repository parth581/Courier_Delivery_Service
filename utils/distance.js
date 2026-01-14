/**
 * Calculate Manhattan distance between two points
 * Formula: |x1 - x2| + |y1 - y2|
 * 
 * @param {Object} point1 - {x: number, y: number}
 * @param {Object} point2 - {x: number, y: number}
 * @returns {number} Manhattan distance
 */
function calculateManhattanDistance(point1, point2) {
  if (!point1 || !point2 || 
      typeof point1.x !== 'number' || typeof point1.y !== 'number' ||
      typeof point2.x !== 'number' || typeof point2.y !== 'number') {
    throw new Error('Invalid points provided for distance calculation');
  }
  
  return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
}

/**
 * Check if two points are approximately equal (within threshold)
 * Used to determine if courier has reached a location
 * 
 * @param {Object} point1 - {x: number, y: number}
 * @param {Object} point2 - {x: number, y: number}
 * @param {number} threshold - Distance threshold (default: 0.5)
 * @returns {boolean} True if points are within threshold
 */
function isWithinThreshold(point1, point2, threshold = 0.5) {
  const distance = calculateManhattanDistance(point1, point2);
  return distance <= threshold;
}

module.exports = {
  calculateManhattanDistance,
  isWithinThreshold
};
