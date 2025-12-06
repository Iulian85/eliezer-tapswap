
// src/utils/grid.ts

/**
 * Converts grid coordinates (x, y) to 3D world space position.
 * This is used by both the tokens and particle effects to ensure they align perfectly.
 * @param x - The grid column index (0-5)
 * @param y - The grid row index (0-6)
 * @returns An array representing the [x, y, z] position in 3D space.
 */
export const getPos = (x: number, y: number): [number, number, number] => {
  // Spacing adjusted for 6 columns
  const spacing = 1.0; 
  // Center based on 6 columns (GRID_W)
  const xOffset = (6 * spacing) / 2 - 0.5; 
  // Center based on 7 rows (GRID_H)
  const yOffset = (7 * spacing) / 2 - 0.5; 
  return [(x * spacing) - xOffset, (y * spacing) - yOffset, 0];
};
