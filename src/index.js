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
          curr: false,
          visited: false, //If path has been visited
          seen: false,  //If seen 
          isObstacle: false,
          color: 'white',
        }
        if (i === this.props.startPoint[0]
          && j === this.props.startPoint[1]) {
          data[i][j].color = 'red';
          data[i][j].visited = true;
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
    this.setState({
      areaVisited: [[this.props.row, this.props.column]],
      currentLocation: this.props.startPoint,
      squares: this.initBoardData(this.props.row, this.props.column),
      obstacle: this.props.obstacles, 

    })
  }
  nextStep() {
    let nextLocation = []
    let updatedBoard = this.revealArea(this.state.squares, 
      this.state.currentLocation[0], this.state.currentLocation[1]);

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
  moveBetweenNodes(destI, destJ) {
    let currX = this.state.currentLocation[0];
    let currY = this.state.currentLocation[1];
    //TODO: Check if path between I and J have been "seen"
    if (!this.isLegalSquare(destI,destJ)) {
      console.log("Illegal Node");
      return;
    }
    if (destI !== currX && destJ !== currY) {
      console.log("Diagonal Movement")
      //TODO: Call moveDiagonalNodes
    }
    if (destI === currX && destJ === currY) {
      console.log("Destination node is the same as current location");
    }
    let updatedBoard = this.state.squares.slice();
    let currentLocation = this.state.currentLocation.slice();

    //Define start and end nodes for path:
    //Check if robot is moving along X or Y axis
    //Check if robot is moving in the positive or negative direction
    let start = destI !== currX ? Math.min(destI, currX) : Math.min(destJ, currY);
    let end = destI !== currX ? Math.max(destI, currX) : Math.max(destJ, currY);

    let seenArea = this.state.areaVisited.slice();
    //Moving in Horizontal Direction
    if (destI !== currX) {
      for (let i = start; i <= end; i++) {
        updatedBoard[i][currY].color = 'yellow'; 
        updatedBoard[i][currY].seen = true;
        seenArea.push([i, currY]);
      }
      updatedBoard[end][currY].color = 'red';
      currentLocation[0] = end;
      currentLocation[1] = currY;

    }
    //Moving in Vertical Direction
    else {
      for (let i = start; i <= end; i++) {
        updatedBoard[currX][i].color = 'yellow';
        updatedBoard[currX][i].seen = true;
        seenArea.push([currX, i]);
      }
      updatedBoard[currX][end].color = 'red';
      currentLocation[0] = currX;
      currentLocation[1] = end;
    }
    //Reveal area in front of new point
    updatedBoard = this.revealArea(updatedBoard, 
      currentLocation[0], currentLocation[1], seenArea);

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
  revealArea(data, currX, currY, seenArea) {
    let updatedBoard = data;
    updatedBoard[currX][currY].seen = true;
    if (this.isLegalSquare(currX, currY + 1)) {
      updatedBoard[currX][currY + 1].color = 'yellow';
      updatedBoard[currX][currY + 1].seen = true;
      seenArea.push([currX][currY + 1]);

      if (this.isLegalSquare(currX, currY + 2)) {
        updatedBoard[currX][currY + 2].color = 'yellow';
        updatedBoard[currX][currY + 2].seen = true;
        seenArea.push([currX][currY + 1]);
      }
    }
    return updatedBoard;

  }


//Helper methods============================

  /*
  Check if point is out of boundaries
  */
  isLegalSquare(i, j) {
    return (i < this.props.row && i > 0
      && j < this.props.column && j > 0);
  }
  
  isCurrentLocation(i,j) {
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
    const squares = this.state.squares.slice();
    this.setState({ squares: squares });
  }


//Initial Board Rendering ==============================
  renderSquare(i, j) {
    let divStyle = {
      background: this.state.squares[i][j].color,
    }
    return (
      <button key={i * j + i + j * 2} className="square" style={divStyle}>
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
        <Button varient="contained" color="primary" onClick={this.nextStep}>
          Next
          </Button>
          <Button varient="contained" color="primary" 
          onClick={() => {this.moveBetweenNodes(this.state.currentLocation[0], this.state.currentLocation[1] + 5)}}>
         Move
          </Button>
          <Button varient="contained" color="primary" 
          onClick={this.reset}>
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
