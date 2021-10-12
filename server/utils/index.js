// function to item equality
const check = (matrix, row, col, dr, dc) => {
  return (
    matrix[row][col] == matrix[row + dr][col + dc] &&
    matrix[row][col] == matrix[row + 2 * dr][col + 2 * dc]
  );
};

// check player is winner
export const isWinner = (matrix) => {
  const hasWin =
    check(matrix, 0, 0, 0, 1) || // First horizontal line
    check(matrix, 1, 0, 0, 1) || // Second horizontal line
    check(matrix, 2, 0, 0, 1) || // Third horizontal line
    check(matrix, 0, 0, 1, 0) || // First vertical line
    check(matrix, 0, 1, 1, 0) || // Second vertical line
    check(matrix, 0, 2, 1, 0) || // Third vertical line
    check(matrix, 0, 0, 1, 1) || // First diagonal
    check(matrix, 0, 2, 1, -1); // Second diagonal

  return hasWin;
};
