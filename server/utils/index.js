export const check = (matrix, row, col, dr, dc) => {
  return (
    matrix[row][col] == matrix[row + dr][col + dc] &&
    matrix[row][col] == matrix[row + 2 * dr][col + 2 * dc]
  );
};
