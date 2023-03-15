import flagImage from './assets/flag.png';
import bombImage from './assets/bomb.png';

export class Square {
    static readonly SIZE=30;
    private position: number[];
    public adjacentSquares: Square[] = [];
    public adjacentMineCount = 0;
    public containsMine= false;
    public isFlagged=false;
    public squareClicked=false;
    private ctx;

    constructor(x:number, y:number, ctx) {
        this.position=[x, y];
        this.ctx = ctx;
    }

    public Draw(): void {
        if (!this.squareClicked) {
            if (!this.isFlagged){
                this.DisplaySquare();
            } else {
                this.DisplayFlag();
            }
        } else {
            if (this.containsMine) {
                this.DisplayMine();
            } else {
                this.DisplayNumberCount();
            }
        }
    }

    public IsInsideSquare(x: number, y: number): boolean {
        const lowestX = this.position[0];
        const lowestY = this.position[1];
        const highestX = this.position[0] + Square.SIZE;
        const highestY = this.position[1] + Square.SIZE;

        return ( lowestX < x && x < highestX) && (lowestY < y && y < highestY);
    }

    public CalculateAdjacentMineCount(): void {
        for (let square of this.adjacentSquares) {
            if (square.containsMine) {
                this.adjacentMineCount++;
            }
        }
    }

    public HandleLeftClick(): boolean {
        if (this.isFlagged) return;
        this.squareClicked=true;
        if (!this.containsMine && this.adjacentMineCount === 0) {
            this.OpenAdjacentSquares();
        }
        this.Draw();
        return this.containsMine;
    }

    public DisplaySquare() {
        let [x, y] = this.position;
        this.ctx.fillStyle = 'gray';
        this.ctx.fillRect(x, y, Square.SIZE, Square.SIZE);

        this.ctx.fillStyle = 'black';
        this.ctx.strokeRect(x, y, Square.SIZE, Square.SIZE);
    }

    public DisplayMine() {
        let [x, y] = this.position;
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(x, y, Square.SIZE, Square.SIZE);
        this.DisplayImage(bombImage);
    }

    public DisplayFlag() {
        let [x, y] = this.position;
        this.ctx.fillStyle = 'gray';
        this.ctx.fillRect(x, y, Square.SIZE, Square.SIZE);

        this.ctx.fillStyle = 'black';
        this.ctx.strokeRect(this.position[0], this.position[1], Square.SIZE, Square.SIZE);
        this.DisplayImage(flagImage);
    }

    public DisplayNumberCount() {
        let [x, y] = this.position;
        let ctx = this.ctx;
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, Square.SIZE, Square.SIZE);
        ctx.fillStyle = 'black';
        ctx.strokeRect(x, y, Square.SIZE, Square.SIZE);
        // Fill in the number if there are surrounding mines
        if (this.adjacentMineCount != 0) {
            this.SetCtxFontColor();
            ctx.font = Square.SIZE + 'px serif';
            ctx.fillText(this.adjacentMineCount, this.position[0]+8, this.position[1]+25);
        }
    }

    public DisplayIncorrectlyFlagged() {
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillRect(this.position[0], this.position[1], Square.SIZE, Square.SIZE);
    }

    private SetCtxFontColor(): void {
        let ctx=this.ctx;
        switch (this.adjacentMineCount) {
            case 1:
                ctx.fillStyle = 'blue';
                break;
            case 2:
                ctx.fillStyle = 'green';
                break;
            case 3:
                ctx.fillStyle = 'red';
                break;
            case 4:
                ctx.fillStyle = 'darkslategray';
                break;
            case 5:
                ctx.fillStyle = 'fuchsia';
                break;
            case 6:
                ctx.fillStyle = 'aqua';
                break;
            case 7:
                ctx.fillStyle = 'black';
                break;
            case 8:
                ctx.fillStyle = 'dimgray';
                break;
        }
    }

    public HandleRightClick(): boolean {
        if (this.isFlagged) {
            this.isFlagged=false;
        } else {
            this.isFlagged=true;
        }

        this.Draw();
        return this.isFlagged;
    }

    private OpenAdjacentSquares(): void {
        for (let square of this.adjacentSquares) {
            if (!square.squareClicked) {
                square.HandleLeftClick();
            }
        }
    }

    private DisplayImage(imageSource): void {
        var img = new Image();
        img.src=imageSource;
        img.onload = () => {
            this.ctx.drawImage(img, this.position[0], this.position[1], Square.SIZE, Square.SIZE);
        };
    }

    public hover() {
        if (this.squareClicked || this.isFlagged) return;
        const ctx = this.ctx;
        ctx.fillStyle = 'white';
        ctx.fillRect(this.position[0], this.position[1], Square.SIZE, Square.SIZE);
        ctx.fillStyle = 'black';
        ctx.strokeRect(this.position[0], this.position[1], Square.SIZE, Square.SIZE);
    }
}