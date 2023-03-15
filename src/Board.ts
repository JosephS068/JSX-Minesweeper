import { Square } from './Square';

export class Board {
    static readonly BOARD_PADDING = 20;
    public squares: Square[][];
    private width: number;
    private height: number;
    public gameFinished: boolean;
    private flagCount: number;
    private mineCount: number;
    private span;
    private squaresRemaining: number;
    private GameStarted = false;
    private interval: number;
    private leftMouseButtonDown: boolean;
    private rightMouseButtonDown: boolean;
    private mostRecentSquares: Square[];
    private middleClick: boolean;
    private seconds: number;

    constructor() { }

    public NewGame(width: number, height: number, mineCount:number) {
        this.ZeroState();
        // Setup mine counter
        this.mineCount = mineCount;
        this.squaresRemaining = width * height;

        this.span = document.getElementById('mineCounter') as HTMLElement;
        this.span.textContent=this.mineCount - this.flagCount;
        this.span.style.color = 'red';

        this.width = width;
        this.height = height;
        this.GenerateSquares(width, height);
        this.AddMinesToSquares(mineCount);
        this.connectSquares();
    }

    private ZeroState() {
        this.squares = [];
        this.width = null;
        this.height = null;
        this.gameFinished = false;
        this.flagCount = 0;
        this.mineCount = null;
        this.span = null;
        this.squaresRemaining = null;
        this.GameStarted = false;
        this.interval = null;
        this.leftMouseButtonDown = false;
        this.rightMouseButtonDown = false;
        this.mostRecentSquares = [];
        this.middleClick = false;
        this.seconds = 0;
        const a = 'a';
    }

    private GenerateSquares(width: number, height: number): void {
        let x = Board.BOARD_PADDING;
        let y = Board.BOARD_PADDING;

        var canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        // Initialize the squares
        for (let row=0;row<height; row++) {
            this.squares[row]= new Array();
            for (let col=0;col<width; col++) {
                let square = new Square(x, y, ctx);
                this.squares[row].push(square);
                x = x + Square.SIZE;
            }
            x = Board.BOARD_PADDING;
            y = y + Square.SIZE;
        }
    }

    private AddMinesToSquares(mineCount: number): void {
        while (mineCount > 0) {
            let minePos = Math.floor(Math.random() * this.width * this.height);
            let x = Math.floor(minePos/this.width);
            let y = minePos % this.width;
            if (this.squares[x][y].containsMine!==true) {
                this.squares[x][y].containsMine=true;
                mineCount--;
            }
        }
    }

    private connectSquares(): void {
        for (let i=0;i<this.height; i++) {
            for (let j=0;j<this.width; j++) {
                let square = this.squares[i][j];
                this.ConnectSquare(square, i-1, j);
                this.ConnectSquare(square, i, j);
                this.ConnectSquare(square, i+1, j);
                square.CalculateAdjacentMineCount();
            }
        }
    }

    private ConnectSquare(square: Square, i: number, j: number): void {
        if (i < 0 || i >= this.height) return;
        for (let pos=j-1;pos<=j+1;pos++) {
            if (pos>=0 && pos<this.width) {
                square.adjacentSquares.push(this.squares[i][pos]);
            }
        }
    }

    public DrawBoard(): void {
        for (let i=0;i<this.height; i++) {
            for (let j=0;j<this.width; j++) {
                const square = this.squares[i][j];
                square.Draw();
            }
        }
    }

    public OnLeftClick(event): void {
        const square = this.GetClickedSquare(event.offsetX, event.offsetY);
        if (square == null) return; // You can click the canvas without clicking the square
        let clickedMine = square.HandleLeftClick();
        if (clickedMine) {
            this.GameOver();
        } else {
            this.squaresRemaining=0;
            for (let i=0;i<this.height; i++) {
                for (let j=0;j<this.width; j++) {
                    const square = this.squares[i][j];
                    if (!square.squareClicked) this.squaresRemaining++;
                }
            }

            if (this.GameStarted == false) {
                this.GameStarted = true;
                this.interval = setInterval(this.myTimer, 100, this);
            }

            if (this.squaresRemaining == this.mineCount) {
                this.GameComplete();
            }
        }
    }

    private myTimer(board) {
        let timerSpan = document.getElementById('timer') as HTMLElement;
        timerSpan.textContent=board.seconds;
        board.seconds++;
    }

    private GameComplete() {
        clearInterval(this.interval);
        this.gameFinished = true;
        var canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, 300, Square.SIZE);
    }

    private GameOver() {
        clearInterval(this.interval);
        this.gameFinished = true;
        for (let i=0;i<this.height; i++) {
            for (let j=0;j<this.width; j++) {
                const square = this.squares[i][j];

                // This displays all other mines
                if (square.containsMine) {
                    square.DisplayMine();
                } else if (square.isFlagged) {
                    square.DisplayIncorrectlyFlagged();
                }
            }
        }
    }

    public OnRightClick(event): void {
        const square = this.GetClickedSquare(event.offsetX, event.offsetY);
        if (square == null) return; // You can click the canvas without clicking the square
        if (square.squareClicked) return;
        const wasFlagged = square.HandleRightClick();
        if (wasFlagged) {
            this.flagCount++;
        } else {
            this.flagCount--;
        }

        const remainingMines = this.mineCount - this.flagCount;
        this.span.innerText = remainingMines;

        if (remainingMines > (this.mineCount * 0.70)) {
            this.span.style.color = 'red';
        } else if (remainingMines > (this.mineCount * 0.40)) {
            this.span.style.color = 'yellow';
        } else {
            this.span.style.color = 'green';
        }
    }

    private HandleBothClicked(event) {
        const square = this.GetClickedSquare(event.offsetX, event.offsetY);
        if (square.isFlagged) return;
        let adjacentFlagCount = 0;
        for (let adjacentSquare of square.adjacentSquares) {
            if (adjacentSquare.isFlagged) {
                adjacentFlagCount++;
            }
        }

        if (adjacentFlagCount === square.adjacentMineCount) {
            square.HandleLeftClick();
            for (let adjacentSquare of square.adjacentSquares) {
                adjacentSquare.HandleLeftClick();
            }
        }

        square.Draw();
        for (let adjacentSquare of square.adjacentSquares) {
            if (!adjacentSquare.isFlagged) {
                adjacentSquare.Draw();
            }
        }
    }

    private GetClickedSquare(x: number, y: number): Square {
        if (this.gameFinished) return;
        for (let i=0;i<this.height; i++) {
            for (let j=0;j<this.width; j++) {
                const square = this.squares[i][j];
                if (square.IsInsideSquare(x, y)) {
                    return square;
                }
            }
        }
    }

    public mousemove(event) {
        if (this.gameFinished) return;
        const square = this.GetClickedSquare(event.offsetX, event.offsetY);
        if (!square) return ;
        if (this.leftMouseButtonDown && !this.rightMouseButtonDown && !this.middleClick) {

            for (let recentSquare of this.mostRecentSquares) {
                if (recentSquare !== square) {
                    recentSquare.Draw();
                }
            }

            this.mostRecentSquares = [];
            this.mostRecentSquares.push(square);
            square.hover();

        } else if (this.leftMouseButtonDown && this.rightMouseButtonDown) {

            for (let recentSquare of this.mostRecentSquares) {
                if (recentSquare !== square && !square.adjacentSquares.includes(recentSquare)) {
                    recentSquare.Draw();
                }
            }

            this.mostRecentSquares = [];
            this.mostRecentSquares.push(square);
            this.mostRecentSquares.push.apply(this.mostRecentSquares, square.adjacentSquares);
            square.hover();
            for (let adjacentSquare of square.adjacentSquares) {
                adjacentSquare.hover();
            }
        }
    }

    public mousedown(event) {
        if (this.gameFinished) return;

        if (event.button == MouseButton.Left) {
            this.leftMouseButtonDown = true;
        } else {
            this.rightMouseButtonDown = true;
        }

        if (this.leftMouseButtonDown && this.rightMouseButtonDown) {
            this.middleClick = true;
        }
    }

    public mouseup(event) {
        if (this.gameFinished) return;
        if (this.leftMouseButtonDown && this.rightMouseButtonDown) {
            this.HandleBothClicked(event);
        } else if (event.button == MouseButton.Right && !this.middleClick) {
            this.OnRightClick(event);
        } else if (!this.middleClick) {
            this.OnLeftClick(event);
        }

        if (event.button == MouseButton.Left) {
            this.leftMouseButtonDown = false;
        } else {
            this.rightMouseButtonDown = false;
        }
        if (!this.leftMouseButtonDown && !this.rightMouseButtonDown) {
            this.middleClick = false;
            if (this.mostRecentSquares){
                for (let adjacentSquare of this.mostRecentSquares) {
                    adjacentSquare.Draw();
                }
                this.mostRecentSquares = [];
            }
        }
    }
}

export enum MouseButton {
    Left = 0,
    Right = 2
}