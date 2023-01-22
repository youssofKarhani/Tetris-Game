class Game {
  constructor() {
    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.sprites = [];
  }

  update() {
    if (start && !gameOver) {
      if (gridPiece != null) {
        switch (moveKey) {
          case "Down":
            updateEvery = 3;
            break;

          case "Up":
            gridPiece.rotation();
            break;

          case "Right":
            gridPiece.moveRight();
            break;

          case "Left":
            gridPiece.moveLeft();
            break;

          default:
            break;
        }
      }
      if (ticks % updateEvery == 0) {
        ticks = 0;

        if (gridPiece == null) {
          gridPiece = nextPiece;
          gridPiece.addToGrid();
          nextPiece = generateShape();
          nextPiece.addToNext();
          this.addSprite(nextPiece);
          gridPieces.push(gridPiece);
        }

        //updates all sprites
        for (var i = 0; i < this.sprites.length; i += 1) {
          this.sprites[i].update();
        }

        if (gridPiece.stopped) {
          gridPiece = null;

          //checks if a new line has been completed.
          var lineComplete = true;
          for (let j = 0; j < 18; j++) {
            //18 = height of the canvas
            lineComplete = true;
            for (let i = 5; i < 15; i++) {
              //4 and 5 the borders of the canvas
              if (!arrayOfNodes[i][j].is) lineComplete = false;
            }
            if (lineComplete) {
              currentScore+=50;
              linesCleared++;
              if(linesCleared%5 == 0) 
                currentLevel++;
              for (let i = 4; i < 15; i++) {
                arrayOfNodes[i][j].is = false;
                for (let i = 0; i < gridPieces.length; i++) {
                  gridPieces[i].updateBottom(j);
                }
              }
            }
          }
        }
      }
      ticks++;
    }
  }

  draw() {
    //clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //draws the canvas
    draw(myGame.ctx);
    //drawDrawingCanvas(this.ctx);
    //draws all sprites.
    for (var i = 0; i < this.sprites.length; i += 1) {
      this.sprites[i].draw(this.ctx);
    }
    if (gameOver) {
      if (!scoreAdded){
        scoreAdded = true;
        currentScore += currentLevel * 100;
      }
      this.ctx.fillStyle = Red;
      this.ctx.lineWidth = 0;
      this.ctx.font = "50px serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText("Game Over!", gameEdgeLeft + 150, canvasHeight / 2 + 8);
    }
  }

  addSprite(newSprite) {
    this.sprites.push(newSprite);
  }
}

class Sprite {
  update() {}
  draw(ctx) {}
}
//create a new Game instance.
var myGame = new Game();

//colors
var colorDark = "#071820",
  colorLight = "#344c57",
  colorBackground = "#ecf4cb",
  Red = "#A11E22", // side colors
  Yellow = "#E8A631", // writing
  FadedOrange = "#E0C098", // game area
  lightGrey = "#E5E4DA", //
  LightBlack = "#333C3E";
Blue = "#27647B";
lightBlue = "#E0F2F2";

//Grid info variables
const nodeSize = 30; //node height and width
const counterGridWidth = myGame.canvas.width / nodeSize;
const counterGridHeight = myGame.canvas.height / nodeSize;
var canvasWidth = myGame.canvas.width;
var canvasHeight = myGame.canvas.height;
var gameEdgeLeft = 150; //edges of the playable game
var gameEdgeRight = 450;

//Game variables
var score = 0;
var currentScore = 0;
var currentLevel = 1;
var linesCleared = 0;

var ticks = 0;
var updateEvery = 50;
var gameOver = false;
var scoreAdded = false;
var start = false;
var moveKey;
var gridPieces = [];

//==========================- Class Node -===========================//

class Node extends Sprite {
  constructor(posX, posY) {
    super();
    this.Xindex = posX;
    this.Yindex = posY;
    this.posX = posX * nodeSize;
    this.posY = posY * nodeSize;
    this.is = false;
    this.shapeType;
  }
  update() {}
  draw(pctx) {
    if (this.is) drawNode(pctx, this.Xindex, this.Yindex, this.shapeType);
  }

  getXIndex() {
    return this.Xindex;
  }
  getYIndex() {
    return this.Yindex;
  }
  getPosX() {
    return this.posX;
  }
  getPosY() {
    return this.posY;
  }
}

arrayOfNodes = [[]];
for (var i = 0; i < counterGridWidth; i++) {
  arrayOfNodes[i] = [];
  for (var j = 0; j < counterGridHeight; j++) {
    arrayOfNodes[i][j] = new Node(i, j);
    //myGame.addSprite(arrayOfNodes[i][j]);
  }
}

//==========================- Shape Classes -===========================//

/**
  * All shapes have 4 functions other than the 
  constructor and the movement functions.
  * addToNext( show block on the Next Display )
  * addToGrid( add block to the grid )
  * updateBottom( update the bottom row of the block when a line is cleared )
  * rotate( rotate the block clock wise)
 */


//--------------------------------Line--------------------------------//
class Line extends Node {
  constructor() {
    super();
    this.rot = 1; //position (for rotation)

    //will be initialized to true inside the grid.
    this.moving = false;
    //if true it means it either hit another block or the bottom.
    this.stopped = false;
    /*if moving = true and stopped = true then the block has been stopped
    by another stop and could potentially keep moving incase the block underneath 
    gets destroyed.
    moving will be initialized to false when hitting bottom of the grid.  
    */

    this.justAdded = true; //to prevent updating before first time drawing
    this.shape = [[], [], [], []];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.shape[i][j] = new Node(i + 16, 12);
        this.shape[i][j].shapeType = 1;
      }
    }

    //initializing the shape.
    for (let i = 0; i < 4; i++) {
      this.shape[i][0].is = true;
    }

    //edges of the shape
    this.top = [
      this.shape[0][0],
      this.shape[1][0],
      this.shape[2][0],
      this.shape[3][0],
    ];
    this.bottom = [
      this.shape[0][0],
      this.shape[1][0],
      this.shape[2][0],
      this.shape[3][0],
    ];
    this.right = [this.shape[3][0]];
    this.left = [this.shape[0][0]];
  }

  addToNext() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        myGame.addSprite(this.shape[i][j]);
        arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
          this.shape[i][j];
      }
    }
  }

  addToGrid() {
    this.moving = true;
    this.justAdded = true;
    //changing position to inside the grid
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.shape[i][j].Xindex = 8 + i;
        this.shape[i][j].Yindex = 0 + j;
        //adding them to the arrayOfNodes
        if (this.shape[i][j].is) {
          arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
            this.shape[i][j];
        }
      }
    }
  }

  rotation() {
    var free = true; //bool will stay true if the surrounding is safe for rotation
    if (this.rot == 1) {
      if (this.shape[0][0].Yindex < 11) {
        for (let i = 1; i < this.bottom.length; i++) {
          for (let j = 1; j < 4; j++) {
            if (
              arrayOfNodes[this.bottom[i].Xindex][this.bottom[i].Yindex + j].is
            )
              free = false;
          }
        }
        //if free space for rotation
        if (free) {
          //reset all node nodes.is and update the arrayOfNodes
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (this.shape[i][j].is) {
                arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
                  new Node(this.shape[i][j].Xindex, this.shape[i][j].Yindex);
                this.shape[i][j].is = false;
              }
            }
          }
          //change to pos2
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              this.shape[0][i].is = true;
              //adding them to the arrayOfNodes
              if (this.shape[i][j].is) {
                arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
                  new Node(this.shape[i][j].Xindex, this.shape[i][j].Yindex);
              }
            }
          }
          this.bottom = [this.shape[0][3]];
          this.top = [this.shape[0][0]];
          this.right = [
            this.shape[0][0],
            this.shape[0][1],
            this.shape[0][2],
            this.shape[0][3],
          ];
          this.left = [
            this.shape[0][0],
            this.shape[0][1],
            this.shape[0][2],
            this.shape[0][3],
          ];
          this.rot = 2;
        }
      }
    } else if (this.rot == 2) {
      if (this.right[0].Xindex < 12 && this.left[0].Xindex > 5) {
        for (let i = 1; i < 4; i++) {
          for (let j = 1; j < 4; j++) {
            if (
              arrayOfNodes[this.shape[0][0].Xindex + i][
                this.shape[0][0].Yindex + j
              ].is
            )
              free = false;
          }
        }
        //if free space for rotation
        if (free) {
          //reset all node nodes.is
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              this.shape[i][j].is = false;
            }
          }
          //change to pos1
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              this.shape[i][0].is = true;
              //adding them to the arrayOfNodes
              if (this.shape[i][j].is) {
                arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
                  new Node(this.shape[i][j].Xindex, this.shape[i][j].Yindex);
              }
            }
          }
          //edges of the shape
          this.top = [
            this.shape[0][0],
            this.shape[1][0],
            this.shape[2][0],
            this.shape[3][0],
          ];
          this.bottom = [
            this.shape[0][0],
            this.shape[1][0],
            this.shape[2][0],
            this.shape[3][0],
          ];
          this.right = [this.shape[3][0]];
          this.left = [this.shape[0][0]];
          this.rot = 1;
        }
      }
    }
    //reset key and safe to stop rotation
    moveKey = null;
  }

  /**
   * This function is called when the block is safe to go down.
   * What this function does is update the Yindex of the block as
   * well as its position inside the array of Nodes by filling the
   * previously visited place of the block by a new Node.
   */

  moveDown() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        //update the shape position and the array
        this.shape[i][j].Yindex++;
        if (this.shape[i][j].is)
          arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
            this.shape[i][j];
      }
    }

    for (let i = 0; i < this.top.length; i++) {
      if (this.top[i].Yindex != 0)
        arrayOfNodes[this.top[i].Xindex][this.top[i].Yindex - 1] = new Node(
          this.top[i].Xindex,
          this.top[i].Yindex - 1
        );
    }
  }

  moveRight() {
    var safe = true;
    for (let i = 0; i < this.right.length; i++) {
      if (
        this.right[i].Xindex + 1 >= 15 ||
        arrayOfNodes[this.right[i].Xindex + 1][this.right[i].Yindex].is
      ) {
        safe = false;
      }
    }

    if (safe) {
      //update the shape position and the array
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          this.shape[i][j].Xindex++;
          if (this.shape[i][j].is)
            arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
              this.shape[i][j];
        }
      }
      for (let i = 0; i < this.left.length; i++) {
        arrayOfNodes[this.left[i].Xindex - 1][this.left[i].Yindex] = new Node(
          this.left[i].Xindex - 1,
          this.left[i].Yindex
        );
      }
    }
    moveKey = null;
  }

  moveLeft() {
    var safe = true;
    for (let i = 0; i < this.left.length; i++) {
      if (
        this.left[i].Xindex - 1 <= 4 ||
        arrayOfNodes[this.left[i].Xindex - 1][this.left[i].Yindex].is
      ) {
        safe = false;
      }
    }

    if (safe) {
      //update the shape position and the array
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          this.shape[i][j].Xindex--;
          if (this.shape[i][j].is)
            arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
              this.shape[i][j];
        }
      }
      for (let i = 0; i < this.right.length; i++) {
        arrayOfNodes[this.right[i].Xindex + 1][this.right[i].Yindex] = new Node(
          this.right[i].Xindex + 1,
          this.right[i].Yindex
        );
      }
    }
    moveKey = null;
  }

  //updates the bottom in case a line from the shape has been deleted
  updateBottom(num) {
    if (this.bottom[0].Yindex == num && this.rot == 2) {
      this.bottom[0].Yindex--;
    }
  }

  update() {
    this.stopped = false;
    if (this.bottom[0].Yindex < 17 && this.right[0].Xindex < 15) {
      this.moving = true;
      //checks if underneath the block is empty to move
      for (let i = 0; i < this.bottom.length; i++) {
        if (arrayOfNodes[this.bottom[i].Xindex][this.bottom[i].Yindex + 1].is) {
          this.stopped = true;
          if (this.top[0].Yindex == 0) gameOver = true;
        }
      }
      if (this.moving && !this.justAdded && !this.stopped) {
        this.moveDown();
      }
      if (this.justAdded) this.justAdded = false;
    } else {
      this.moving = false;
      this.stopped = true;
    }
  }
  draw(pctx) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.shape[i][j].draw(pctx);
      }
    }
  }
}



//--------------------------------Square--------------------------------//
class Square extends Node {
  constructor() {
    super();
    this.rot = 1; //position (for rotation).

    //will be initialized to true inside the grid
    this.moving = false;
    //if true it means it either hit another block or the bottom.
    this.stopped = false;
    /*if moving = true and stopped = true then the block has been stopped
    by another stop and could potentially keep moving incase the block underneath 
    gets destroyed.
    moving will be initialized to false when hitting bottom of the grid.  
    */

    this.justAdded = true; //to prevent updating before first time drawing

    this.shape = [[], [], [], []]; //double array will hold the shape nodes

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.shape[i][j] = new Node(i + 16, 11 + j); //initialized inside the next box
        this.shape[i][j].shapeType = 2;
      }
    }

    //initializing the shape.
    this.shape[1][0].is = true;
    this.shape[2][0].is = true;
    this.shape[1][1].is = true;
    this.shape[2][1].is = true;

    //edges of the shape
    this.top = [this.shape[1][0], this.shape[2][0]];
    this.bottom = [this.shape[1][1], this.shape[2][1]];
    this.right = [this.shape[2][0], this.shape[2][1]];
    this.left = [this.shape[1][0], this.shape[1][1]];
  }

  addToNext() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        myGame.addSprite(this.shape[i][j]);
        arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
          this.shape[i][j];
      }
    }
  }

  addToGrid() {
    this.moving = true;
    this.justAdded = true;
    //changing position inside the grid
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.shape[i][j].is) {
          this.shape[i][j].Xindex = 8 + i;
          this.shape[i][j].Yindex = 0 + j;
        }
      }
    }
    //adding them to arrayOfNodes
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.shape[i][j].is) {
          myGame.addSprite(this.shape[i][j]);
          arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
            this.shape[i][j];
        }
      }
    }
  }

  rotation() {
    if (this.rot == 1) this.rot = 2;
    else this.rot = 1;
  }
  /**
   * This function is called when the block is safe to go down.
   * What this function does is update the Yindex of the block as
   * well as its position inside the array of Nodes by filling the
   * previously visited place of the block by a new Node.
   */
  moveDown() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        //update the shape position and the array
        this.shape[i][j].Yindex++;
        if (this.shape[i][j].is)
          arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
            this.shape[i][j];
      }
    }

    for (let i = 0; i < this.top.length; i++) {
      if (this.top[i].Yindex != 0)
        arrayOfNodes[this.top[i].Xindex][this.top[i].Yindex - 1] = new Node(
          this.top[i].Xindex,
          this.top[i].Yindex - 1
        );
    }
  }

  moveRight() {
    var safe = true;
    for (let i = 0; i < this.right.length; i++) {
      if (
        this.right[i].Xindex + 1 >= 15 ||
        arrayOfNodes[this.right[i].Xindex + 1][this.right[i].Yindex].is
      ) {
        safe = false;
      }
    }

    if (safe) {
      //update the shape position and the array
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          this.shape[i][j].Xindex++;
          if (this.shape[i][j].is)
            arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
              this.shape[i][j];
        }
      }
      for (let i = 0; i < this.left.length; i++) {
        arrayOfNodes[this.left[i].Xindex - 1][this.left[i].Yindex] = new Node(
          this.left[i].Xindex - 1,
          this.left[i].Yindex
        );
      }
    }
    moveKey = null;
  }

  moveLeft() {
    var safe = true;
    for (let i = 0; i < this.left.length; i++) {
      if (
        this.left[i].Xindex - 1 <= 4 ||
        arrayOfNodes[this.left[i].Xindex - 1][this.left[i].Yindex].is
      ) {
        safe = false;
      }
    }

    if (safe) {
      //update the shape position and the array
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          this.shape[i][j].Xindex--;
          if (this.shape[i][j].is)
            arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
              this.shape[i][j];
        }
      }
      for (let i = 0; i < this.right.length; i++) {
        arrayOfNodes[this.right[i].Xindex + 1][this.right[i].Yindex] = new Node(
          this.right[i].Xindex + 1,
          this.right[i].Yindex
        );
      }
    }
    moveKey = null;
  }

  updateBottom(num) {
    if (this.bottom[0].Yindex == num) {
      this.bottom[0] = this.top[0];
      this.bottom[1] = this.top[1];
    }
  }

  update() {
    this.stopped = false;
    if (this.bottom[0].Yindex < 17 && this.right[0].Xindex < 15) {
      this.moving = true;
      //checks if underneath the block is empty to move
      for (let i = 0; i < 2; i++) {
        if (arrayOfNodes[this.bottom[i].Xindex][this.bottom[i].Yindex + 1].is) {
          this.stopped = true;
          if (this.top[0].Yindex == 0) gameOver = true;
        }
      }
      if (this.moving && !this.justAdded && !this.stopped) {
        this.moveDown();
      }
      if (this.justAdded) this.justAdded = false;
    } else {
      this.moving = false;
      this.stopped = true;
    }
  }
  draw(pctx) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.shape[i][j].draw(pctx);
      }
    }
  }
}



//--------------------------------TShape--------------------------------//
class Tshape extends Node {
  constructor() {
    super();
    this.rot = 1; //position (for rotation)

    //will be initialized to true inside the grid.
    this.moving = false;
    //if true it means it either hit another block or the bottom.
    this.stopped = false;
    /*if moving = true and stopped = true then the block has been stopped
    by another stop and could potentially keep moving incase the block underneath 
    gets destroyed.
    moving will be initialized to false when hitting bottom of the grid.  
    */

    this.justAdded = true; //to prevent updating before first time drawing
    this.shape = [[], [], [], []];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.shape[i][j] = new Node(i + 16, 12);
        this.shape[i][j].shapeType = 3;
      }
    }

    //initializing the shape.
    this.shape[2][0].is = true;
    this.shape[1][1].is = true;
    this.shape[2][1].is = true;
    this.shape[3][1].is = true;

    //edges of the shape
    this.top = [this.shape[2][0], this.shape[1][1], this.shape[3][1]];
    this.bottom = [this.shape[1][1], this.shape[2][1], this.shape[3][1]];
    this.right = [this.shape[3][1], this.shape[2][0]];
    this.left = [this.shape[1][1], this.shape[2][0]];
  }

  addToNext() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        myGame.addSprite(this.shape[i][j]);
        arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
          this.shape[i][j];
      }
    }
  }

  addToGrid() {
    this.moving = true;
    this.justAdded = true;
    //changing position to inside the grid
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.shape[i][j].Xindex = 8 + i;
        this.shape[i][j].Yindex = 0 + j;
        //adding them to the arrayOfNodes
        if (this.shape[i][j].is) {
          arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
            this.shape[i][j];
        }
      }
    }
  }

  rotation() {
    var free = true; //bool will stay true if the surrounding is safe for rotation
    if (this.rot == 1) {
      if (this.bottom[0].Yindex < 16) {
        for (let i = 1; i < 3; i++) {
          if (arrayOfNodes[this.bottom[i].Xindex][this.bottom[i].Yindex + 1].is)
            free = false;
        }
        //if free space for rotation
        if (free) {
          //reset all node nodes.is and update the arrayOfNodes
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (this.shape[i][j].is) {
                arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
                  new Node(this.shape[i][j].Xindex, this.shape[i][j].Yindex);
                this.shape[i][j].is = false;
              }
            }
          }
          //change to pos2
          this.shape[2][0].is = true;
          this.shape[2][1].is = true;
          this.shape[2][2].is = true;
          this.shape[3][1].is = true;
          //adding them to the arrayOfNodes
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (this.shape[i][j].is) {
                arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
                  new Node(this.shape[i][j].Xindex, this.shape[i][j].Yindex);
              }
            }
          }

          this.bottom = [this.shape[2][2], this.shape[3][1]];
          this.top = [this.shape[2][0], this.shape[3][1]];
          this.right = [this.shape[3][1], this.shape[2][0], this.shape[2][2]];
          this.left = [this.shape[2][0], this.shape[2][1], this.shape[2][2]];
          this.rot = 2;
        }
      }
    } else if (this.rot == 2) {
      if (this.left[0].Xindex > 5) {
        for (let i = 1; i < 3; i++) {
          if (arrayOfNodes[this.left[i].Xindex - 1][this.left[i].Yindex].is)
            free = false;
        }
        //if free space for rotation
        if (free) {
          //reset all node nodes.is and update the arrayOfNodes
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (this.shape[i][j].is) {
                arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
                  new Node(this.shape[i][j].Xindex, this.shape[i][j].Yindex);
                this.shape[i][j].is = false;
              }
            }
          }
          //change to pos3
          this.shape[1][1].is = true;
          this.shape[2][1].is = true;
          this.shape[2][2].is = true;
          this.shape[3][1].is = true;
          //adding them to the arrayOfNodes
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (this.shape[i][j].is) {
                arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
                  new Node(this.shape[i][j].Xindex, this.shape[i][j].Yindex);
              }
            }
          }

          this.bottom = [this.shape[2][2], this.shape[1][1], this.shape[3][1]];
          this.top = [this.shape[1][1], this.shape[2][1], this.shape[3][1]];
          this.right = [this.shape[3][1], this.shape[2][2]];
          this.left = [this.shape[1][1], this.shape[2][2]];
          this.rot = 3;
        }
      }
    } else if (this.rot == 3) {
      if (this.top[0].Yindex > 0) {
        for (let i = 1; i < 3; i++) {
          if (arrayOfNodes[this.top[i].Xindex][this.top[i].Yindex - 1].is)
            free = false;
        }
        //if free space for rotation
        if (free) {
          //reset all node nodes.is and update the arrayOfNodes
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (this.shape[i][j].is) {
                arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
                  new Node(this.shape[i][j].Xindex, this.shape[i][j].Yindex);
                this.shape[i][j].is = false;
              }
            }
          }
          //change to pos4
          this.shape[2][0].is = true;
          this.shape[1][1].is = true;
          this.shape[2][1].is = true;
          this.shape[2][2].is = true;

          //adding them to the arrayOfNodes
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (this.shape[i][j].is) {
                arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
                  new Node(this.shape[i][j].Xindex, this.shape[i][j].Yindex);
              }
            }
          }

          //edges of the shape
          this.top = [this.shape[2][0], this.shape[1][1]];
          this.bottom = [this.shape[2][2], this.shape[1][1]];
          this.right = [this.shape[2][0], this.shape[2][1], this.shape[2][2]];
          this.left = [this.shape[1][1], this.shape[2][0], this.shape[2][2]];
          this.rot = 4;
        }
      }
    } else if (this.rot == 4) {
      if (this.right[0].Xindex < 15) {
        for (let i = 1; i < 3; i++) {
          if (arrayOfNodes[this.right[i].Xindex + 1][this.right[i].Yindex].is)
            free = false;
        }
        //if free space for rotation
        if (free) {
          //reset all node nodes.is and update the arrayOfNodes
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (this.shape[i][j].is) {
                arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
                  new Node(this.shape[i][j].Xindex, this.shape[i][j].Yindex);
                this.shape[i][j].is = false;
              }
            }
          }

          //change to pos1
          this.shape[2][0].is = true;
          this.shape[1][1].is = true;
          this.shape[2][1].is = true;
          this.shape[3][1].is = true;
          //adding them to the arrayOfNodes
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (this.shape[i][j].is) {
                arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
                  new Node(this.shape[i][j].Xindex, this.shape[i][j].Yindex);
              }
            }
          }

          this.top = [this.shape[2][0], this.shape[1][1], this.shape[3][1]];
          this.bottom = [this.shape[1][1], this.shape[2][1], this.shape[3][1]];
          this.right = [this.shape[3][1], this.shape[2][0]];
          this.left = [this.shape[1][1], this.shape[2][0]];
          this.rot = 1;
        }
      }
    }
    //reset key and safe to stop rotation
    moveKey = null;
  }

  /**
   * This function is called when the block is safe to go down.
   * What this function does is update the Yindex of the block as
   * well as its position inside the array of Nodes by filling the
   * previously visited place of the block by a new Node.
   */
  moveDown() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        //update the shape position and the array
        this.shape[i][j].Yindex++;
        if (this.shape[i][j].is)
          arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
            this.shape[i][j];
      }
    }

    for (let i = 0; i < this.top.length; i++) {
      if (this.top[i].Yindex != 0)
        arrayOfNodes[this.top[i].Xindex][this.top[i].Yindex - 1] = new Node(
          this.top[i].Xindex,
          this.top[i].Yindex - 1
        );
    }
  }

  moveRight() {
    var safe = true;
    for (let i = 0; i < this.right.length; i++) {
      if (
        this.right[i].Xindex + 1 >= 15 ||
        arrayOfNodes[this.right[i].Xindex + 1][this.right[i].Yindex].is
      ) {
        safe = false;
      }
    }

    if (safe) {
      //update the shape position and the array
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          this.shape[i][j].Xindex++;
          if (this.shape[i][j].is)
            arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
              this.shape[i][j];
        }
      }
      for (let i = 0; i < this.left.length; i++) {
        arrayOfNodes[this.left[i].Xindex - 1][this.left[i].Yindex] = new Node(
          this.left[i].Xindex - 1,
          this.left[i].Yindex
        );
      }
    }
    moveKey = null;
  }

  moveLeft() {
    var safe = true;
    for (let i = 0; i < this.left.length; i++) {
      if (
        this.left[i].Xindex - 1 <= 4 ||
        arrayOfNodes[this.left[i].Xindex - 1][this.left[i].Yindex].is
      ) {
        safe = false;
      }
    }

    if (safe) {
      //update the shape position and the array
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          this.shape[i][j].Xindex--;
          if (this.shape[i][j].is)
            arrayOfNodes[this.shape[i][j].Xindex][this.shape[i][j].Yindex] =
              this.shape[i][j];
        }
      }
      for (let i = 0; i < this.right.length; i++) {
        arrayOfNodes[this.right[i].Xindex + 1][this.right[i].Yindex] = new Node(
          this.right[i].Xindex + 1,
          this.right[i].Yindex
        );
      }
    }
    moveKey = null;
  }
  //updates the bottom in case a line from the shape has been deleted
  updateBottom(num) {
    if (this.bottom[0].Yindex == num && this.rot == 1) {
      this.bottom = null; //reset bottom var
      this.bottom = [this.shape[2][0]];
    }
  }

  update() {
    this.stopped = false;
    if (this.bottom[0].Yindex < 17 && this.right[0].Xindex < 15) {
      this.moving = true;
      //checks if underneath the block is empty to move
      for (let i = 0; i < this.bottom.length; i++) {
        if (arrayOfNodes[this.bottom[i].Xindex][this.bottom[i].Yindex + 1].is) {
          this.stopped = true;
          if (this.top[0].Yindex == 0) gameOver = true;
        }
      }
      if (this.moving && !this.justAdded && !this.stopped) {
        this.moveDown();
      }
      if (this.justAdded) this.justAdded = false;
    } else {
      this.moving = false;
      this.stopped = true;
    }
  }
  draw(pctx) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.shape[i][j].draw(pctx);
      }
    }
  }
}

//===========================- Functions -============================//
function generateShape() {
  var num = randNum(1, 4);
  switch (num) {
    case 1:
      var newLine = new Line();
      return newLine;
      break;
    case 2:
      var newSqr = new Square();
      return newSqr;
      break;
    case 3:
      var newT = new Tshape();
      return newT;
      break;
    case 4:
      var newSqr = new Square();
      return newSqr;
      break;
  }
}

//draw function
function draw(pctx) {
  pctx.beginPath();
  pctx.fillStyle = "lightBlue";
  pctx.rect(gameEdgeLeft, 0, gameEdgeRight, canvasHeight);
  pctx.fill();

  //Right side info
  pctx.beginPath();
  pctx.fillStyle = Blue;
  pctx.lineWidth = 3;
  pctx.rect(gameEdgeRight, 0, 150, canvasHeight);
  //Left side info
  pctx.rect(0, 0, gameEdgeLeft, canvasHeight);
  pctx.fill();

  pctx.beginPath();
  pctx.fillStyle = Yellow;
  //Score rectangle
  pctx.rect(450, 50, 150, 70);
  //Level rectangle
  pctx.rect(460, 130, 130, 60, 5, 5);
  //Lines rectangle
  pctx.rect(460, 200, 130, 60, 5, 5);
  pctx.fill();

  pctx.beginPath();
  pctx.fillStyle = lightBlue;
  //Next piece rectangle
  pctx.rect(480, 300, 150, 130);
  pctx.fill();

  pctx.beginPath();
  pctx.fillStyle = Red;
  //Score lines
  pctx.rect(450, 55, 150, 20);
  pctx.rect(450, 80, 150, 4);
  pctx.rect(450, 110, 150, 4);
  pctx.fill();

  pctx.beginPath();
  pctx.fillStyle = Yellow;
  //Score banner
  pctx.rect(460, 30, 130, 35, 5, 5);
  pctx.fill();

  pctx.beginPath();
  pctx.lineWidth = 4;
  pctx.fillStyle = Red;
  pctx.strokeStyle = Red;
  //Score banner inner rectangle
  pctx.rect(465, 35, 120, 25, 5, 5);
  pctx.stroke();

  pctx.beginPath();
  pctx.fillStyle = Red;
  //Next piece inner rectangle
  pctx.strokeStyle = Yellow;
  pctx.rect(480, 300, 118, 130);
  pctx.stroke();
  pctx.beginPath();
  pctx.strokeStyle = Red;
  //Level inner rectangle
  pctx.rect(465, 135, 120, 50, 5, 5);
  //Lines inner rectangle
  pctx.rect(465, 205, 120, 50, 5, 5);
  //pctx.fill();
  pctx.stroke();

  pctx.beginPath();
  //Draw the info labels
  pctx.fillStyle = "#FFFFFF";
  pctx.lineWidth = 1;
  pctx.font = "24px serif";
  pctx.textAlign = "CENTER";
  pctx.fillText("Score", 525, 55);
  pctx.fillText("Level", 525, 158);
  pctx.fillText("Lines", 525, 228);

  //Draw the actual info
  pctx.textSize = 24;
  pctx.textAlign = "RIGHT";

  //The score
  pctx.fillText(currentScore, 560, 105);
  pctx.fillText(currentLevel, 560, 180);
  pctx.fillText(linesCleared, 560, 250);

  //Right side Line.
  pctx.strokeStyle = Red;
  pctx.beginPath();
  pctx.lineWidth = 3;
  pctx.moveTo(gameEdgeRight, 0);
  pctx.lineTo(gameEdgeRight, canvasHeight);
  pctx.stroke();
  pctx.fill();

  //Left side Line.
  pctx.beginPath();
  pctx.lineWidth = 3;
  pctx.strokeStyle = Red;
  pctx.moveTo(gameEdgeLeft, 0);
  pctx.lineTo(gameEdgeLeft, canvasHeight);
  pctx.stroke();

  //upper side Line.
  pctx.beginPath();
  pctx.lineWidth = 3;
  pctx.strokeStyle = Red;
  pctx.moveTo(gameEdgeLeft, 1);
  pctx.lineTo(gameEdgeRight, 1);
  pctx.stroke();

  //bottom side Line.
  pctx.beginPath();
  pctx.lineWidth = 3;
  pctx.strokeStyle = Red;
  pctx.moveTo(gameEdgeLeft, canvasHeight - 1);
  pctx.lineTo(gameEdgeRight, canvasHeight - 1);
  pctx.stroke();

  //Explain the controls
  pctx.fillStyle = "#FFFFFF";
  pctx.lineWidth = 0;
  pctx.font = "18px serif";
  pctx.textAlign = "center";
  pctx.fillText("Left and Right: ", 75, 250);
  pctx.fillText("move side to side", 75, 268);
  pctx.fillText("Up:", 75, 310);
  pctx.fillText("rotate", 75, 328);
  pctx.fillText("Down:", 75, 370);
  pctx.fillText("fall faster", 75, 388);

  if (!start) {
    //rect
    pctx.beginPath();
    pctx.lineWidth = 10;
    pctx.fillStyle = Red;
    pctx.strokeStyle = Yellow;
    pctx.rect(gameEdgeLeft + 60, canvasHeight / 2 - 30, gameEdgeLeft + 30, 60);
    pctx.fill();
    pctx.stroke();
    //text
    pctx.fillStyle = "#FFFFFF";
    pctx.lineWidth = 0;
    pctx.font = "30px serif";
    pctx.textAlign = "center";
    pctx.fillText("Start", gameEdgeLeft + 150, canvasHeight / 2 + 8);
  }
  //Game over text
  if (gameOver) {
    pctx.fillStyle = Red;
    pctx.lineWidth = 0;
    pctx.font = "50px serif";
    pctx.textAlign = "center";
    pctx.fillText("Game Over!", gameEdgeLeft + 150, canvasHeight / 2 + 8);
  }
}

draw(myGame.ctx);

//Starting click
var event = document.addEventListener("mousedown", function (e) {
  if (!start) {
    if (e.x > 210 && e.y > 245 && e.x < 400 && e.y < 315) {
      start = true;
      const music = new Audio("tetrisMusic.mp3");
      music.play();
      animate();
    }
  }
});

function randNum(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function animate() {
  myGame.update();
  myGame.draw();
  requestAnimFrame(animate);
}

//requesting animationFrames from all possible web_engines
var requestAnimFrame = (function (callback) {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

//event listener for arrow keys (moveKey)
var event = document.addEventListener("keydown", function (e) {
  if (e.keyCode == 37) {
    console.log("Left");
    moveKey = "Left";
  } else if (e.keyCode == 38) {
    console.log("Up");
    moveKey = "Up";
  } else if (e.keyCode == 39) {
    console.log("Right");
    moveKey = "Right";
  } else if (e.keyCode == 40) {
    console.log("Down");
    moveKey = "Down";
  } else {
    console.log("Not an arrow key");
  }
});
//listerner for keyup of the down key
var event = document.addEventListener("keyup", function (e) {
  if (e.keyCode == 40) {
    updateEvery = 30;
    moveKey = null;
  }
});

//Game objects
//I put these here since can't generate before initializing the class
var gridPiece = null;
var nextPiece = generateShape();
myGame.addSprite(nextPiece);

//============================- Draw Functions -============================//

//Rectangle drawing function
function drawRectBorder(ctx, x, y, width, height) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#FFFFFF";
  ctx.stroke();
}
//Node drawing function
function drawNode(ctx, Xindex, Yindex, num) {
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000000";
  //line
  if (num == 1) ctx.fillStyle = "#e5f10d";
  //square
  else if (num == 2) ctx.fillStyle = "#0049a2";
  //L
  else if (num == 3) ctx.fillStyle = Red;
  //T
  else if (num == 4) ctx.fillStyle = "#555555";
  //z
  else if (num == 5) ctx.fillStyle = "#333333";
  //else
  else {
    ctx.fillStyle = "lightBlue";
    ctx.strokeStyle = Red;
  }
  ctx.rect(Xindex * nodeSize, Yindex * nodeSize, nodeSize, nodeSize);
  ctx.fill();
  ctx.stroke();
}

function fillNode(ctx, Xindex, Yindex) {
  ctx.beginPath();
  ctx.rect(Xindex * nodeSize, Yindex * nodeSize, nodeSize, nodeSize);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000000";
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "undefined";
}

function drawDrawingCanvas(pctx) {
  for (let i = 5; i < 15; i++) {
    for (let j = 0; j < 18; j++) {
      drawNode(pctx, i, j, 9);
    }
  }
}
