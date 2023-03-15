import * as React from 'preact';
import * as ReactDOM from 'preact';
import { Board } from './Board';
import { Square } from './Square';

export const Canvas2D = () => {
    return (
        <div id="Horizontal-Center">
            <div id="Verticle-Center">
                <span id="mineCounter"></span>
                <span id="timer"></span>
                <canvas id="glCanvas"></canvas>
                <div id="Buttons">
                    <button className="button" onClick={() => main(false)}> Reset </button>
                    <button className="button">Guidance</button>
                    <button className="button">Setting</button>
                </div>
                <div id="settings">
                    <table>
                        <tr>
                            <th>Difficulty</th>
                            <th>Height</th>
                            <th>Width</th>
                            <th>Mines</th>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor="html">Beginner</label><br/>
                                <input type="radio" id="" name="difficulty" value="1"/>
                            </td>
                            <td> 9 </td>
                            <td> 9 </td>
                            <td> 10 </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor="html">Intermediate</label><br/>
                                <input type="radio" id="" name="difficulty" value="2"/>
                            </td>
                            <td> 16 </td>
                            <td> 16 </td>
                            <td> 40 </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor="html">Expert</label><br/>
                                <input type="radio" id="" name="difficulty" value="3" checked={true}/>
                            </td>
                            <td> 16 </td>
                            <td> 30 </td>
                            <td> 99 </td>
                        </tr>
                        <tr>
                            <td>
                                <label htmlFor="html">Custom</label><br/>
                                <input type="radio" id="" name="difficulty" value="4"/>
                            </td>
                            <td><input type="text" id="Custom-Height"/></td>
                            <td><input type="text" id="Custom-Width"/></td>
                            <td><input type="text" id="Custom-Mines"/></td>
                        </tr>
                    </table>
                    <button className="button" onClick={() => main(true)}>New Game</button>
                </div>
            </div>
        </div>
    );
};

ReactDOM.render(<Canvas2D/>, document.getElementById('root'));

var board = new Board();
var width, height, mineCount;
var initialSetup = true;
main(true);

enum Difficulty {
    Beginner = 0,
    Intermediate = 1,
    Expert = 2,
    Custom = 3
}

function main(changeSetting: boolean) {
    var canvas = document.getElementById('glCanvas') as HTMLCanvasElement;

    let difficultySetting: Difficulty;
    if (changeSetting) {
        var ele = document.getElementsByName('difficulty') as NodeListOf<HTMLInputElement>;
        for (let i = 0; i < ele.length; i++) {
            if (ele[i].checked) {
                difficultySetting = i;
            }
        }
    }

    switch (difficultySetting) {
        case 0:
            width=9;
            height=9;
            mineCount=10;
            break;
        case 1:
            width=16;
            height=16;
            mineCount=40;
            break;
        case 2:
            width=30;
            height=16;//32
            mineCount=99;
            break;
        case 3:
            let customHeight = document.getElementById('Custom-Height') as HTMLInputElement;
            let customWidth = document.getElementById('Custom-Width') as HTMLInputElement;
            let customMines = document.getElementById('Custom-Mines') as HTMLInputElement;
            height=customHeight.value;
            width=customWidth.value;
            mineCount=customMines.value;
            break;
    }

    canvas.width=Square.SIZE * width + (2 * Board.BOARD_PADDING);
    canvas.height=Square.SIZE * height + (2 * Board.BOARD_PADDING);

    // the below is being done because flex flow is being used to vertically stack elements
    // width will be wrong if this is not set, height set just to be safe
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';

    board.NewGame(width, height, mineCount);
    board.DrawBoard();

    if (initialSetup) {
        //canvas.addEventListener("click", event => board.OnLeftClick(event));
        //canvas.addEventListener('contextmenu', () => null);

        // responsive hold down
        canvas.addEventListener('mousemove', event => board.mousemove(event));
        canvas.addEventListener('mouseup', event => board.mouseup(event));
        canvas.addEventListener('mousedown', event => board.mousedown(event));
        initialSetup = false;
    }

    return;
}