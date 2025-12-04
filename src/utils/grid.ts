// src/utils/grid.ts

/**
 * Converts grid coordinates (x, y) to 3D world space position.
 * This is used by both the tokens and particle effects to ensure they align perfectly.
 * @param x - The grid column index (0-7)
 * @param y - The grid row index (0-8)
 * @returns An array representing the [x, y, z] position in 3D space.
 */
export const getPos = (x: number, y: number): [number, number, number] => {
  const spacing = 1.1;
  const xOffset = (8 * spacing) / 2 - 0.5; // Centering the grid horizontally
  const yOffset = (9 * spacing) / 2 - 0.5; // Centering the grid vertically
  return [(x * spacing) - xOffset, (y * spacing) - yOffset, 0];
};