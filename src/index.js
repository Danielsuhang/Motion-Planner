import React from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
import './index.css';
class Board extends React.Component {

  /* Lifting State into Parent instead of Child */
  constructor(props) {
    super(props);
    this.state = {
      rows: this.props.row,
      columns: this.props.column,
      areaVisited: [[this.props.row, this.props.column]],
      squares: this.initBoardData(this.props.row, this.props.column),
      currentLocation: this.props.startPoint,
      obstacle: this.props.obstacles,
    };

    //Bindings
    this.nextStep = this.nextStep.bind(this);
    this.updateStartPoint = this.updateStartPoint.bind(this);
    this.moveBetweenNodes = this.moveBetweenNodes.bind(this);
    this.isCurrentLocation = this.isCurrentLocation.bind(this);
    this.reset = this.reset.bind(this);


    this.moveUp = this.moveUp.bind(this);
    this.moveDown = this.moveDown.bind(this);
    this.moveLeft = this.moveLeft.bind(this);
    this.moveRight = this.moveRight.bind(this);

    this.state.squares = this.revealArea(this.state.squares, this.props.startPoint[0],
      this.props.startPoint[1], this.state.areaVisited, "bot");

    //Initialize graph nodes 
    this.state.squares = this.initializeGraph(this.state.squares);
  }
  //Initialize Array with Cell Objects
  initBoardData(row, column) {
    let data = []
    for (let i = 0; i < row; i++) {
      data.push([]);
      for (let j = 0; j < column; j++) {
        data[i][j] = {
          x: i,
          y: j,
          seen: false,  //If seen 
          isObstacle: false,
          color: 'white',
          outEdge: [],
        }
        if (i === this.props.startPoint[0]
          && j === this.props.startPoint[1]) {
          data[i][j].color = 'red';
          data[i][j].seen = true;
        }
        else if (this.checkObstacle(i, j)) {
          data[i][j].color = 'black';
          data[i][j].isObstacle = true;
        }
      }
    }
    return data;
  }


  //Methods update board after intialization ==============

  /*
  Test Method: Moves start point diagonally until boundary hit, 
  then moves horizontally/vertically
  */
  reset() {
    let updatedData = this.initBoardData(this.props.row, this.props.column);
    updatedData = this.revealArea(updatedData, this.props.startPoint[0], this.props.startPoint[1]
      , [[this.props.row, this.props.column]], "top");
    this.setState({
      areaVisited: [[this.props.row, this.props.column]],
      currentLocation: this.props.startPoint,
      squares: updatedData,
      obstacle: this.props.obstacles,

    })
  }
  nextStep() {
    let nextLocation = []
    let updatedBoard = this.revealArea(this.state.squares,
      this.state.currentLocation[0], this.state.currentLocation[1],
      this.state.areaVisited, "right");

    if (this.isLegalSquare(this.state.currentLocation[0] + 1,
      this.state.currentLocation[1] + 1)) {
      nextLocation[0] = this.state.currentLocation[0] + 1;
      nextLocation[1] = this.state.currentLocation[1] + 1;

    }
    else if (this.isLegalSquare(this.state.currentLocation[0] + 1,
      this.state.currentLocation[1])) {
      nextLocation[0] = this.state.currentLocation[0] + 1;
      nextLocation[1] = this.state.currentLocation[1];
    }
    else if (this.isLegalSquare(this.state.currentLocation[0],
      this.state.currentLocation[1] + 1)) {
      nextLocation[0] = this.state.currentLocation[0];
      nextLocation[1] = this.state.currentLocation[1] + 1;
    }
    else {
      console.log("Edge Reached");
      return;
    }


    //updates board information with new start point
    this.updateStartPoint(this.state.currentLocation[0],
      this.state.currentLocation[1], nextLocation[0], nextLocation[1]);

    this.setState({
      squares: updatedBoard,
      currentLocation: nextLocation
    })
  }
  moveUp() {
    this.moveBetweenNodes(this.state.currentLocation[0] - 1,
      this.state.currentLocation[1])
  }
  moveDown() {
    this.moveBetweenNodes(this.state.currentLocation[0] + 1,
      this.state.currentLocation[1]);
  }
  moveLeft() {
    this.moveBetweenNodes(this.state.currentLocation[0]
      , this.state.currentLocation[1] - 1);
  }
  moveRight() {
    this.moveBetweenNodes(this.state.currentLocation[0],
      this.state.currentLocation[1] + 1);
  }
  moveBetweenNodes(destI, destJ) {
    let currX = this.state.currentLocation[0];
    let currY = this.state.currentLocation[1];
    //TODO: Check if path between I and J have been "seen"
    if (!this.isLegalSquare(destI, destJ)) {
      console.log("Illegal Node");
      return;
    }
    if (destI !== currX && destJ !== currY) {
      console.log("Diagonal Movement")
      return;
    }
    if (destI === currX && destJ === currY) {
      console.log("Destination node is the same as current location");
      return;
    }
    //These need to be updated if more than one square is allowed to be traversed
    if (!this.state.squares[destI][destJ].seen) {
      console.log("Destination node has not been seen, cannot traverse");
      return;
    }
    if (this.state.squares[destI][destJ].isObstacle) {
      console.log("Cannot traverse onto obstacle");
      return;
    }
    let updatedBoard = this.state.squares.slice();
    let currentLocation = this.state.currentLocation.slice();

    //Define start and end nodes for path:
    //Check if robot is moving along X or Y axis
    //Check if robot is moving in the positive or negative direction
    let start = destI !== currX ? currX : currY;
    let end = destI !== currX ? destI : destJ;
    let seenArea = this.state.areaVisited.slice();
    //Moving in Vertical Direction
    if (destI !== currX) {
      //If moving up (negative direction)
      if (start > end) {
        for (let i = start; i >= end; i--) {
          console.log(i, currY)
          updatedBoard[i][currY].color = 'yellow';
          updatedBoard = this.revealArea(updatedBoard,
            i, currY, seenArea, "top");
        }
      }
      //If moving down (positive direction)
      else {
        for (let i = start; i <= end; i++) {
          updatedBoard[i][currY].color = 'yellow';
          updatedBoard = this.revealArea(updatedBoard,
            i, currY, seenArea, "bot");
        }
      }
      updatedBoard[end][currY].color = 'red';
      currentLocation[0] = end;
      currentLocation[1] = currY;
    }
    //Moving in Horizontal Direction
    else {
      //Moving left (negative direction)
      if (start > end) {
        for (let i = start; i >= end; i--) {
          updatedBoard[currX][i].color = 'yellow';
          updatedBoard = this.revealArea(updatedBoard,
            currX, i, seenArea, "left");
        }
      }
      //Moving right (positive direction)
      else {
        for (let i = start; i <= end; i++) {
          updatedBoard[currX][i].color = 'yellow';
          updatedBoard = this.revealArea(updatedBoard,
            currX, i, seenArea, "right");
        }
      }
      updatedBoard[currX][end].color = 'red';

      
      currentLocation[0] = currX;
      currentLocation[1] = end;
      
    }


    this.setState({
      squares: updatedBoard,
      currentLocation: currentLocation,
      areaVisited: seenArea
    })
  }
  updateStartPoint(i, j, newI, newJ) {
    let updatedData = this.state.squares.slice();
    updatedData[i][j].color = (updatedData[i][j].seen) ? 'yellow' : 'white';
    updatedData[newI][newJ].color = 'red';
    this.setState({
      squares: updatedData
    })
  }
  /**
   * Visibility Function: Defines what area the robot can see
   * Narrow Cone Function
   */
  revealArea(data, currX, currY, seenArea, direction) {
    if (direction === 'right') {
      return this.revealRightArea(data, currX, currY, seenArea);
    }
    if (direction === 'left') {
      return this.revealLeftArea(data, currX, currY, seenArea);
    }
    if (direction === 'top') {
      return this.revealTopArea(data, currX, currY, seenArea);
    }
    if (direction === 'bot') {
      return this.revealBotArea(data, currX, currY, seenArea);
    }

    console.log("ERROR: Direction " + direction + " must match a valid direction");
    return data;

  }
  revealLeftArea(data, currX, currY, seenArea) {
    let updatedBoard = data;
    updatedBoard[currX][currY].seen = true;
    let obsX = currX;
    let obsY = currY - 1;
    if (this.isLegalSquare(obsX, obsY)) {
      updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, 
        obsX, obsY);
      updatedBoard[obsX][obsY].seen = true;
      seenArea.push([obsX][obsY]);

      obsX = currX;
      obsY = currY - 2;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, 
          obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
        seenArea.push([obsX][obsY]);
      }
      obsX = currX - 1;
      obsY = currY - 2;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, 
          obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
        seenArea.push([obsX][obsY]);
      }
      obsX = currX + 1;
      obsY = currY - 2;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, 
          obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
        seenArea.push([obsX][obsY]);
      }
    }
    return updatedBoard;
  }
  revealTopArea(data, currX, currY, seenArea) {
    let updatedBoard = data;
    updatedBoard[currX][currY].seen = true;
    let obsX = currX - 1;
    let obsY = currY;
    if (this.isLegalSquare(obsX, obsY)) {
      
      updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard,
        obsX, obsY);
      updatedBoard[obsX][obsY].seen = true;
      seenArea.push([obsX][obsY]);

      obsX = currX - 2;
      obsY = currY;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard,
           obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
        seenArea.push([obsX][obsY]);
      }
      obsX = currX - 2;
      obsY = currY + 1;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard,
           obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
        seenArea.push([obsX][obsY]);
      }
      obsX = currX - 2;
      obsY = currY - 1
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard,
           obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
        seenArea.push([obsX][obsY]);
      }
    }
    return updatedBoard;
  }
  revealBotArea(data, currX, currY, seenArea) {
    let updatedBoard = data;
    updatedBoard[currX][currY].seen = true;
    let obsX = currX + 1;
    let obsY = currY
    if (this.isLegalSquare(obsX, obsY)) {
      updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
      updatedBoard[obsX][obsY].seen = true;
      seenArea.push([obsX][obsY]);

      obsX = currX + 2;
      obsY = currY;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
        seenArea.push([obsX][obsY]);
      }
      obsX = currX + 2;
      obsY = currY - 1;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
        seenArea.push([obsX][obsY]);
      }
      obsX = currX + 2;
      obsY = currY + 1;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
        seenArea.push([obsX][obsY]);
      }
    }
    return updatedBoard;
  }

  revealRightArea(data, currX, currY, seenArea) {
    let updatedBoard = data;
    updatedBoard[currX][currY].seen = true;
    let obsX = currX;
    let obsY = currY + 2;
    if (this.isLegalSquare(obsX, obsY)) {
      updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
      updatedBoard[obsX][obsY].seen = true;
      seenArea.push([obsX][obsY]);

      obsX = currX;
      obsY = currY + 2;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
        seenArea.push([obsX][obsY]);
      }
      obsX = currX + 1;
      obsY = currY + 2;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
        seenArea.push([obsX][obsY]);
      }
      obsX = currX - 1;
      obsY = currY + 2;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
        seenArea.push([obsX][obsY]);
      }
    }
    return updatedBoard;

  }


  //Vamp_Tree Implementation==================

  //Initialize outgoing edges for all nodes in cell
  initializeGraph(data) {
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        let curr = data[i][j];
        curr.outEdge = [];
        if (i > 0) {
          curr.outEdge.push([i - 1, j]);
        }
        if (i < data.length - 1) {
          curr.outEdge.push([i + 1, j]);
        }
        if (j > 0) {
          curr.outEdge.push([i, j - 1]);
        }
        if (j < data[i].length - 1) {
          curr.outEdge.push([i][j + 1]);
        }
      }
    }
    return data;
  }



  //Helper methods============================

  /*
  Check if point is out of boundaries
  */
  determineColor(data, i, j) {
    return data[i][j].isObstacle ? '#D2691E' : 'yellow'
  }
  isLegalSquare(i, j) {
    return (i < this.props.row && i >= 0
      && j < this.props.column && j >= 0);
  }

  isCurrentLocation(i, j) {
    return (i === this.state.currentLocation[0] && j === this.state.currentLocation[1]);
  }
  /*****
 * Handling Initialization of Board
 */
  checkObstacle(row, column) {
    for (let i = 0; i < this.props.obstacles.length; i++) {
      let x = this.props.obstacles[i][0];
      let y = this.props.obstacles[i][1];
      if (row === x && column === y) {
        return true;
      }
    }
    return false;
  }


  //Event Handlers=================================
  /**
   * Handles logic for what happens when the user clicks a square
   * @param {The row coordinate of click} i 
   * @param {The column coordinate of click} j 
   */
  handleClick(i, j) {
    console.log(this.state.squares[i][j]);
  }


  //Initial Board Rendering ==============================
  renderSquare(i, j) {
    let divStyle = {
      background: this.state.squares[i][j].color,
    }
    return (
      <button key={i * j + i + j * 2} className="square" style={divStyle}
        onClick={() => {
          this.handleClick(i, j)
        }}>
      </button>
    )
  }
  callChildren(row, size) {
    let children = [];
    for (let i = 0; i < size; i++) {
      children.push(this.renderSquare(row, i));
    }
    return children;
  }
  createGrid(size) {
    let grid = []
    for (let i = 0; i < size; i++) {
      grid.push(<div className="board-row" key={i}>{this.callChildren(i, size)}</div>)
    }
    return grid;
  }
  render() {
    return (
      <div>
        <Button varient="contained" color="primary" onClick={this.moveUp}>
          Up
          </Button>
          <Button varient="contained" color="primary" onClick={this.moveDown}>
          Down
          </Button>
          <Button varient="contained" color="primary" onClick={this.moveLeft}>
         Left 
          </Button>
          <Button varient="contained" color="primary" onClick={this.moveRight}>
         Right 
          </Button>
        <Button varient="contained" color="primary"
          onClick={() => { this.moveBetweenNodes(this.state.currentLocation[0], this.state.currentLocation[1] + 5) }}>
          Move Right + 5
          </Button>
        <Button varient="contained" color="primary" onClick={this.reset}>
          Reset
          </Button>

        {this.createGrid(this.state.squares.length)}
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    //Define board parameters
    let obstacles = [[5, 4], [5, 3], [6, 6], [6, 2]];
    let startPoint = [15, 5];
    return (
      <div className="game">
        <div className="game-board">

          <br />
          <Board startPoint={startPoint} obstacles={obstacles} row={20} column={20} />

        </div>
        <div className="game-info">
        </div>
      </div>
    );
  }
}


// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
