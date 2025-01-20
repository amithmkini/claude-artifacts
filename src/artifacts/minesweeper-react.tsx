import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const BOARD_SIZE = 10;
const NUM_MINES = 10;

interface CellProps {
  value: number | 'X';
  revealed: boolean;
  flagged: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isWin: boolean;
}

const Cell: React.FC<CellProps> = ({ value, revealed, flagged, onClick, onContextMenu, isWin }) => (
  <Button
    variant="outline"
    className={`w-8 h-8 p-0 m-0 ${
      revealed ? 'bg-secondary' : 'bg-background hover:bg-secondary/50'
    } ${flagged ? 'bg-yellow-200 hover:bg-yellow-300' : ''} ${
      isWin && value === 'X' ? 'bg-green-200 hover:bg-green-300' : ''
    }`}
    onClick={onClick}
    onContextMenu={onContextMenu}
    disabled={flagged}
  >
    {(revealed || (isWin && value === 'X')) && value !== 0 && (value === 'X' ? '💣' : value)}
    {flagged && !revealed && '🚩'}
  </Button>
);

interface CellData {
  value: number | 'X';
  revealed: boolean;
  flagged: boolean;
}

const Minesweeper: React.FC = () => {
  const [board, setBoard] = useState<CellData[][]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [win, setWin] = useState<boolean>(false);

  const initializeBoard = useCallback((): void => {
    const newBoard: CellData[][] = Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill(null).map(() => ({
        value: 0,
        revealed: false,
        flagged: false,
      }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < NUM_MINES) {
      const row = Math.floor(Math.random() * BOARD_SIZE);
      const col = Math.floor(Math.random() * BOARD_SIZE);
      if (newBoard[row][col].value !== 'X') {
        newBoard[row][col].value = 'X';
        minesPlaced++;
      }
    }

    // Calculate numbers
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (newBoard[row][col].value !== 'X') {
          newBoard[row][col].value = countAdjacentMines(newBoard, row, col);
        }
      }
    }

    setBoard(newBoard);
    setGameOver(false);
    setWin(false);
  }, []); // Empty dependency array as it doesn't depend on any external variables

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  const countAdjacentMines = (board: CellData[][], row: number, col: number): number => {
    let count = 0;
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (r === 0 && c === 0) continue;
        const newRow = row + r;
        const newCol = col + c;
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
          if (board[newRow][newCol].value === 'X') count++;
        }
      }
    }
    return count;
  };

  const revealCell = (row: number, col: number): void => {
    if (gameOver || win || board[row][col].flagged) return;

    const newBoard = [...board];
    
    if (newBoard[row][col].revealed) {
      // If the cell is already revealed, perform chord action
      chordAction(newBoard, row, col);
    } else if (newBoard[row][col].value === 'X') {
      setGameOver(true);
      revealAllMines(newBoard);
    } else {
      floodFill(newBoard, row, col);
    }

    setBoard(newBoard);
    checkWinCondition(newBoard);
  };

  const chordAction = (board: CellData[][], row: number, col: number): void => {
    const cell = board[row][col];
    const adjacentFlags = countAdjacentFlags(board, row, col);

    if (typeof cell.value === 'number' && cell.value === adjacentFlags) {
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          if (r === 0 && c === 0) continue;
          const newRow = row + r;
          const newCol = col + c;
          if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
            if (!board[newRow][newCol].flagged && !board[newRow][newCol].revealed) {
              if (board[newRow][newCol].value === 'X') {
                setGameOver(true);
                revealAllMines(board);
                return;
              }
              floodFill(board, newRow, newCol);
            }
          }
        }
      }
    }
  };

  const countAdjacentFlags = (board: CellData[][], row: number, col: number): number => {
    let count = 0;
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (r === 0 && c === 0) continue;
        const newRow = row + r;
        const newCol = col + c;
        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
          if (board[newRow][newCol].flagged) count++;
        }
      }
    }
    return count;
  };

  const floodFill = (board: CellData[][], row: number, col: number): void => {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE || board[row][col].revealed || board[row][col].flagged) return;

    board[row][col].revealed = true;

    if (board[row][col].value === 0) {
      for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
          floodFill(board, row + r, col + c);
        }
      }
    }
  };

  const toggleFlag = (e: React.MouseEvent<HTMLButtonElement>, row: number, col: number): void => {
    e.preventDefault();
    if (gameOver || win || board[row][col].revealed) return;

    const newBoard = [...board];
    newBoard[row][col].flagged = !newBoard[row][col].flagged;
    setBoard(newBoard);
  };

  const revealAllMines = (board: CellData[][]): void => {
    board.forEach(row => {
      row.forEach(cell => {
        if (cell.value === 'X') {
          cell.revealed = true;
        }
      });
    });
  };

  const checkWinCondition = (board: CellData[][]): void => {
    const win = board.every(row =>
      row.every(cell =>
        cell.value === 'X' ? !cell.revealed : cell.revealed
      )
    );
    if (win) {
      setWin(true);
      // Reveal all mines with green tint
      const newBoard = board.map(row =>
        row.map(cell =>
          cell.value === 'X' ? { ...cell, revealed: true } : cell
        )
      );
      setBoard(newBoard);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <Card className="w-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-4">Minesweeper</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-card p-4 rounded shadow">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => (
                  <Cell
                    key={`${rowIndex}-${colIndex}`}
                    value={cell.value}
                    revealed={cell.revealed}
                    flagged={cell.flagged}
                    onClick={() => revealCell(rowIndex, colIndex)}
                    onContextMenu={(e) => toggleFlag(e, rowIndex, colIndex)}
                    isWin={win}
                  />
                ))}
              </div>
            ))}
          </div>
          {gameOver && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Game Over!</AlertTitle>
              <AlertDescription>You hit a mine. Better luck next time!</AlertDescription>
            </Alert>
          )}
          {win && (
            <Alert variant="default" className="mt-4">
              <AlertTitle>Congratulations!</AlertTitle>
              <AlertDescription>You've won the game!</AlertDescription>
            </Alert>
          )}
          <Button
            className="mt-4 w-full"
            onClick={initializeBoard}
          >
            New Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Minesweeper;
