// src/utils/grid.ts
import { GRID_W, GRID_H } from '../types';

/**
 * Converts grid coordinates (x, y) to 3D world space position.
 * This is used by both the tokens and particle effects to ensure they align perfectly.
 * @param x - The grid column index
 * @param y - The grid row index
 * @returns An array representing the [x, y, z] position in 3D space.
 */
export const getPos = (x: number, y: number): [number, number, number] => {
  const spacing = 1.0; // Restored spacing to 1.0 since we have fewer columns
  const xOffset = (GRID_W * spacing) / 2 - 0.5; // Centering the grid horizontally
  const yOffset = (GRID_H * spacing) / 2 - 0.5; // Centering the grid vertically
  return [(x * spacing) - xOffset, (y * spacing) - yOffset, 0];
};
