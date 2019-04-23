import React from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
import './index.css';
import { Column, Row } from 'simple-flexbox';
class Board extends React.Component {

  /* Lifting State into Parent instead of Child */
  constructor(props) {
    super(props);
    this.state = {
      rows: this.props.row,
      columns: this.props.column,
      areaVisited: [],
      squares: this.initBoardData(this.props.row, this.props.column
        , this.props.startPoint, this.props.endPoint, this.props.obstacles),
      currentLocation: this.props.startPoint,
      obstacle: this.props.obstacles,
      endLocation: this.props.endPoint,
      pathFound: false,
      agenda: [[this.props.startPoint[0], this.props.startPoint[1], "bot"]],
      noPath: false,
      path: [],
    };

    //Bindings
    this.nextStep = this.nextStep.bind(this);
    this.updateStartPoint = this.updateStartPoint.bind(this);
    this.moveBetweenNodes = this.moveBetweenNodes.bind(this);
    this.isCurrentLocation = this.isCurrentLocation.bind(this);

    this.reset = this.reset.bind(this);
    this.resetNarrow = this.resetNarrow.bind(this);
    this.resetNoPath = this.resetNoPath.bind(this);


    this.moveUp = this.moveUp.bind(this);
    this.moveDown = this.moveDown.bind(this);
    this.moveLeft = this.moveLeft.bind(this);
    this.moveRight = this.moveRight.bind(this);

    this.startAlgorithm = this.startAlgorithm.bind(this);
    this.stepAlgorithm = this.stepAlgorithm.bind(this);
    this.backtrack = this.backtrack.bind(this);
    this.reproducePath = this.reproducePath.bind(this);

    this.state.squares = this.revealArea(this.state.squares, this.props.startPoint[0],
      this.props.startPoint[1], "bot");

    //Initialize graph nodes 
    this.state.squares = this.initializeGraph(this.state.squares);
  }
  //Initialize Array with Cell Objects
  initBoardData(row, column, startPoint, endPoint, obstacles) {
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
          isEnd: false,
          parent: [],

        }
        if (i === startPoint[0]
          && j === startPoint[1]) {
          data[i][j].color = 'red';
          data[i][j].seen = true;
        }
        else if (i === endPoint[0]
          && j === endPoint[1]) {
          data[i][j].color = 'green';
          data[i][j].isEnd = true;
        }
        else if (this.checkObstacle(i, j, obstacles)) {
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
    let updatedData = this.initBoardData(this.props.row, this.props.column
      , this.props.startPoint, this.props.endPoint, this.props.obstacles)
    updatedData = this.revealArea(updatedData, this.props.startPoint[0], this.props.startPoint[1]
      , "bot");
    updatedData = this.initializeGraph(updatedData);
    this.setState({
      areaVisited: [],
      currentLocation: this.props.startPoint,
      squares: updatedData,
      obstacle: this.props.obstacles,
      endLocation: this.props.endPoint,
      pathFound: false,
      agenda: [[this.props.startPoint[0], this.props.startPoint[1], "bot"]],
      noPath: false,
      path: [],
    })
  }
  resetNoPath() {
    
    let obstacles = [[5, 4], [5, 3], [6, 6], [6, 2], [6,1], [6,5], 
    [7,6], [8,6], [6,6], [5,6], [4,6], [3,6], [2,6], [1,6], [9,6], [10,6], [11,6],
  [12,6], [13,6], [14,6], [15,6], [16,6], [17,6], [18,6], [19,6], [18,7], [18,8],
[18,9], [18,10], [18,11], [18,12], [18,13],[0,6]];
    let endPoint = [19,10]; 
    let updatedData = this.initBoardData(this.props.row, this.props.column,
      this.props.startPoint, endPoint, obstacles);
    updatedData = this.revealArea(updatedData, this.props.startPoint[0], this.props.startPoint[1]
      , "bot");
    updatedData = this.initializeGraph(updatedData);
    this.setState({
      areaVisited: [],
      currentLocation: this.props.startPoint,
      squares: updatedData,
      obstacle: obstacles,
      endLocation: endPoint,
      pathFound: false,
      agenda: [[this.props.startPoint[0], this.props.startPoint[1], "bot"]],
      noPath: false,
      path: [],
    })
  }
  resetNarrow() {
    
    let obstacles = [[5, 4], [5, 3], [6, 6], [6, 2], [6,1], [6,5], 
    [7,6], [8,6], [6,6], [5,6], [4,6], [3,6], [2,6], [1,6], [9,6], [10,6], [11,6],
  [12,6], [13,6], [14,6], [15,6], [16,6], [17,6], [18,6], [19,6], [18,7], [18,8],
[18,9], [18,10], [18,11], [18,12], [18,13]];
    let endPoint = [19,10]; 
    let updatedData = this.initBoardData(this.props.row, this.props.column,
      this.props.startPoint, endPoint, obstacles);
    updatedData = this.revealArea(updatedData, this.props.startPoint[0], this.props.startPoint[1]
      , "bot");
    updatedData = this.initializeGraph(updatedData);
    this.setState({
      areaVisited: [],
      currentLocation: this.props.startPoint,
      squares: updatedData,
      obstacle: obstacles,
      endLocation: endPoint,
      pathFound: false,
      agenda: [[this.props.startPoint[0], this.props.startPoint[1], "bot"]],
      noPath: false,
      path: [],
    }) 
  }
  nextStep() {
    let nextLocation = []
    let updatedBoard = this.revealArea(this.state.squares,
      this.state.currentLocation[0], this.state.currentLocation[1], "right");

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
    this.updateStartPoint(updatedBoard, this.state.currentLocation[0],
      this.state.currentLocation[1], nextLocation[0], nextLocation[1]);

    this.setState({
      squares: updatedBoard
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
    if (!this.isLegalSquare(destI, destJ)) {
      console.log("Illegal Node");
      return;
    }
    if (destI === this.state.endLocation[0]
      && destJ === this.state.endLocation[1]) {
      console.log("Path found!")
      this.setState({
        pathFound: true
      });
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
    //Moving in Vertical Direction
    if (destI !== currX) {
      //If moving up (negative direction)
      if (start > end) {
        for (let i = start; i >= end; i--) {
          console.log(i, currY)
          updatedBoard[i][currY].color = 'yellow';
          updatedBoard = this.revealArea(updatedBoard,
            i, currY, "top");
        }
      }
      //If moving down (positive direction)
      else {
        for (let i = start; i <= end; i++) {
          updatedBoard[i][currY].color = 'yellow';
          updatedBoard = this.revealArea(updatedBoard,
            i, currY, "bot");
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
            currX, i, "left");
        }
      }
      //Moving right (positive direction)
      else {
        for (let i = start; i <= end; i++) {
          updatedBoard[currX][i].color = 'yellow';
          updatedBoard = this.revealArea(updatedBoard,
            currX, i, "right");
        }
      }
      updatedBoard[currX][end].color = 'red';


      currentLocation[0] = currX;
      currentLocation[1] = end;

    }


    this.setState({
      squares: updatedBoard,
      currentLocation: currentLocation,
    })
  }
  updateStartPoint(data, i, j, newI, newJ) {
    let updatedData = data.slice();
    updatedData[i][j].color = (updatedData[i][j].seen) ? 'yellow' : 'white';
    updatedData[newI][newJ].color = updatedData[newI][newJ].isEnd ? '#7FFF00' : 'red';
    this.setState({
      squares: updatedData,
      currentLocation: [newI, newJ],
    })
  }

  /**
   * Visibility Function: Defines what area the robot can see
   * Narrow Cone Function
   */
  revealArea(data, currX, currY, direction) {
    data[currX][currY].seen = true;
    if (direction === 'right') {
      return this.revealRightArea(data, currX, currY);
    }
    if (direction === 'left') {
      return this.revealLeftArea(data, currX, currY);
    }
    if (direction === 'top') {
      return this.revealTopArea(data, currX, currY);
    }
    if (direction === 'bot') {
      return this.revealBotArea(data, currX, currY);
    }

    console.log("ERROR: Direction " + direction + " must match a valid direction");
    return data;

  }
  revealLeftArea(data, currX, currY) {
    let updatedBoard = data;
    updatedBoard[currX][currY].seen = true;
    let obsX = currX;
    let obsY = currY - 1;
    if (this.isLegalSquare(obsX, obsY)) {
      updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard,
        obsX, obsY);
      updatedBoard[obsX][obsY].seen = true;

      obsX = currX;
      obsY = currY - 2;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard,
          obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
      }
      obsX = currX - 1;
      obsY = currY - 2;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard,
          obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
      }
      obsX = currX + 1;
      obsY = currY - 2;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard,
          obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
      }
    }
    return updatedBoard;
  }
  revealTopArea(data, currX, currY) {
    let updatedBoard = data;
    updatedBoard[currX][currY].seen = true;
    let obsX = currX - 1;
    let obsY = currY;
    if (this.isLegalSquare(obsX, obsY)) {

      updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard,
        obsX, obsY);
      updatedBoard[obsX][obsY].seen = true;

      obsX = currX - 2;
      obsY = currY;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard,
          obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
      }
      obsX = currX - 2;
      obsY = currY + 1;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard,
          obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
      }
      obsX = currX - 2;
      obsY = currY - 1
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard,
          obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
      }
    }
    return updatedBoard;
  }
  revealBotArea(data, currX, currY) {
    let updatedBoard = data;
    updatedBoard[currX][currY].seen = true;
    let obsX = currX + 1;
    let obsY = currY
    if (this.isLegalSquare(obsX, obsY)) {
      updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
      updatedBoard[obsX][obsY].seen = true;

      obsX = currX + 2;
      obsY = currY;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
      }
      obsX = currX + 2;
      obsY = currY - 1;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
      }
      obsX = currX + 2;
      obsY = currY + 1;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
      }
    }
    return updatedBoard;
  }

  revealRightArea(data, currX, currY) {
    let updatedBoard = data;
    updatedBoard[currX][currY].seen = true;
    let obsX = currX;
    let obsY = currY + 1;
    if (this.isLegalSquare(obsX, obsY)) {
      updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
      updatedBoard[obsX][obsY].seen = true;

      obsX = currX;
      obsY = currY + 2;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
      }
      obsX = currX + 1;
      obsY = currY + 2;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
      }
      obsX = currX - 1;
      obsY = currY + 2;
      if (this.isLegalSquare(obsX, obsY)) {
        updatedBoard[obsX][obsY].color = this.determineColor(updatedBoard, obsX, obsY);
        updatedBoard[obsX][obsY].seen = true;
      }
    }
    return updatedBoard;

  }


  //Vamp_Tree Implementation==================

  //Initialize outgoing edges for all nodes in cell
  //Add diagonal movement
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
          curr.outEdge.push([i, j + 1]);
        }
      }
    }
    return data;
  }
  /**
   * Breadth first traversal of nodes which have already been seen
   */
  stepAlgorithm() {
    if (this.state.noPath || this.state.pathFound) {
      console.log("Path already found!");
      return;
    }

    //Queue of what nodes to visit next
    let agenda = this.state.agenda.slice();
    let visited = this.state.areaVisited.slice();

    //If goal found


    //If no more agenda    
    if (agenda.length === 0 || this.allObstaclesUnseen(this.state.squares, agenda)) {
      console.log("No path found!");
      this.setState({
        noPath: true
      });
      return;
    }

    let index = agenda.shift();
    let next = this.state.squares[index[0]][index[1]];

    if (next.isEnd) {
      console.log("Path found!");
      this.setState({
        pathFound: true
      })
    }

    if (this.nodeVisited(visited, index[0], index[1], index[2])) {
      //Node visited already
      console.log("Node already visited");
      this.setState({
        agenda: agenda,
      })
      return;
    }
    if (!next.seen) {
      agenda.push([index[0], index[1], index[2]]);
      console.log("Node hasn't been seen yet, " +
        "add back to Queue for future consideration");
      this.setState({
        agenda: agenda,
      })
      return;
    }
    if (next.isObstacle) {
      console.log("Cannot traverse obstacle: " + next);
      return;
    }

    //Add all children to queue
    let updatedData = this.state.squares.slice();
    for (let i = 0; i < next.outEdge.length; i++) {
      let child = updatedData[next.outEdge[i][0]][next.outEdge[i][1]];
      if (child.seen) {
        //Save parents information (including direction)
        child.parent.push([index[0], index[1], index[2]]);
      }
      //Push in itself in all directions
      agenda.push([index[0], index[1], "top"]);
      agenda.push([index[0], index[1], "bot"]);
      agenda.push([index[0], index[1], "left"]);
      agenda.push([index[0], index[1], "right"]);
      //IMPORTANT: Calculate the direction of all children and pass into agenda
      let childIndex = next.outEdge[i]
      agenda.push([childIndex[0], childIndex[1]
        , this.determineDirection(index[0], index[1]
          , childIndex[0], childIndex[1])]);
    }

    //Add node to visited
    visited.push([index[0], index[1], index[2]]);
    this.updateStartPoint(updatedData, this.state.currentLocation[0],
      this.state.currentLocation[1], index[0], index[1]);

    //Could make it scan in every direction, but not exactly natural and good in practice
    //Path needs to be reproducable

    //Determine the direction the robot is facing

    //Reveal the appropriate direction
    if (next.parent.length !== 0) {
      this.revealArea(updatedData, index[0], index[1], index[2]);
    }
    this.setState({
      agenda: agenda,
      areaVisited: visited
    });

    console.log("Successfully traversed to next step with node: ");
  }



  /**
   * Continuously performs Tree-Visability Algorithm
   */
  startAlgorithm() {

    let agenda = this.state.agenda.slice();
    let visited = this.state.areaVisited.slice();
    let currentLocation = this.state.currentLocation.slice();
    var steps = 0;
    while (!this.state.noPath && !this.state.pathFound) {
      steps++;
      let updatedData = this.state.squares.slice();

      if (this.state.noPath || this.state.pathFound) {
        console.log("Path already found!");
        break;
      }

      //If no more agenda    
      if (this.allObstaclesUnseen(updatedData, agenda) || agenda.length === 0) {
        console.log("No path found!");
        this.setState({
          noPath: true
        })
        break;
      }

      let index = agenda.shift();
      let next = this.state.squares[index[0]][index[1]];
      if (!next.seen) {
        agenda.push([index[0], index[1], index[2]]);
        continue;
      }
      if (next.isEnd) {
        console.log("Path found!");
        console.log("steps: " + steps);
        //TODO Modify backtrack to include direction
        this.updateStartPoint(updatedData, currentLocation[0],
          currentLocation[1], index[0], index[1]);

        this.backtrack(index[0], index[1], index[2], []);
        this.setState({
          pathFound: true
        })
        break;
      }

      if (this.nodeVisited(visited, index[0], index[1], index[2])) {
        //Node visited already
        continue;
      }

      if (next.isObstacle) {
        console.log("Cannot traverse obstacle: " + next);
        continue;
      }

      //Add all children to queue

      for (let i = 0; i < next.outEdge.length; i++) {
        let child = updatedData[next.outEdge[i][0]][next.outEdge[i][1]];
        if (child.seen) {
          child.parent.push([index[0], index[1], index[2]]);
        }
        //Push in itself in all directions
        agenda.push([index[0], index[1], "top"]);
        agenda.push([index[0], index[1], "bot"]);
        agenda.push([index[0], index[1], "left"]);
        agenda.push([index[0], index[1], "right"]);

        //Push all children plus direction
        let childIndex = next.outEdge[i];
        agenda.push([childIndex[0], childIndex[1]
          , this.determineDirection(index[0], index[1]
            , childIndex[0], childIndex[1])]);
      }

      //Add node to visited
      visited.push([index[0], index[1], index[2]]);
      this.updateStartPoint(updatedData, currentLocation[0],
        currentLocation[1], index[0], index[1]);
      currentLocation = index;
      updatedData = this.state.squares.slice();

      //Reveal the appropriate direction
      if (next.parent.length !== 0) {
        this.revealArea(updatedData, index[0], index[1], index[2]);
      }
    }
    this.setState({
      agenda: agenda,
      areaVisited: visited
    })
  }
  /**
   * 
   */

  backtrack(currX, currY, direction, path) {
    //continue backtrack until reach original start point
    //If path found
    console.log("backtracking...")
    if (currX === this.props.startPoint[0]
      && currY === this.props.startPoint[1]) {
      //Add our path to list of solution paths
      console.log("Actual path found!");
      for (let i = 0; i < path.length; i++) {
        console.log(path[i]);
      }
      this.setState({
        path: path,
      })
      return -1;
    }

    let currSquare = this.state.squares[currX][currY];
    for (let i = 0; i < currSquare.parent.length; i++) {
      let value = currSquare.parent[i];

      //Avoid infinite loops
      if (this.nodeVisitedNoDirection(path, value[0], value[1])) {
        continue;
      }
      console.log([value[0], value[1], value[2]]);
      path.push([value[0], value[1], value[2]]);
      if (this.backtrack(value[0], value[1], value[2], path) === -1) {
        return -1;
      }
      path.pop();
    }
    return 1;

  }
  reproducePath() {
    if (this.state.path.length !== 0) {
      console.log("Reproduced!")
      let updatedData = this.state.squares.slice();
      this.state.path.forEach(value => {
        updatedData[value[0]][value[1]].color = "green";
      })
      updatedData[this.props.startPoint[0]][this.props.startPoint[1]].color = "red";

      this.setState({
        squares: updatedData
      })
    }
  }




  //Helper methods============================
  determineDirection(parentIndexI, parentIndexJ, currI, currJ) {
    if (parentIndexI > currI) {
      //Traveled top
      return "top";
    }
    else if (parentIndexI < currI) {
      //Traveled bot
      return "bot";
    }
    else if (parentIndexJ > currJ) {
      //Travel left
      return "left";
    }
    else if (parentIndexJ < currJ) {
      //Travel right
      return "right";
    }
    else {
      return "ERROR";
    }
  }
  /*
  Check if point is out of boundaries
  */
  nodeVisited(visited, i, j, direction) {
    var isVisited = false;
    visited.forEach(values => {
      if (values[0] === i && values[1] === j && values[2] === direction) {
        isVisited = true;
      }
    });
    return isVisited;
  }
  allObstaclesUnseen(updatedData, agenda) {
    let unseen = true;
    
    agenda.forEach(value => {
      if (updatedData[value[0]][value[1]].seen) {
        unseen = false;
      }
    });
    return unseen;
  }
  nodeVisitedNoDirection(visited, i, j) {
    var isVisited = false;
    visited.forEach(values => {
      if (values[0] === i && values[1] === j) {
        isVisited = true;
      }
    });
    return isVisited;
  }
  determineColor(data, i, j) {
    if (data[i][j].isEnd) {
      return '#7FFF00';
    }
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
  checkObstacle(row, column, obstacles) {
    for (let i = 0; i < obstacles.length; i++) {
      let x = obstacles[i][0];
      let y = obstacles[i][1];
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
    console.log(i, j);
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
        <Button varient="contained" color="primary" onClick={this.startAlgorithm}>
          Run
          </Button>
          <Button varient="contained" color="primary" onClick={this.reproducePath}>
          Create Path
          </Button>
        <Button varient="contained" color="primary"
          onClick={this.stepAlgorithm}>
          Next
          </Button>
        <Button varient="contained" color="primary" onClick={this.reset}>
          Reset
          </Button>
          <Button varient="contained" color="primary" onClick={this.resetNarrow}>
          Narrow Path
          </Button>
          <Button varient="contained" color="primary" onClick={this.resetNoPath}>
          No Path
          </Button>
        <Row>
          <div>
            {this.createGrid(this.state.squares.length)}
          </div>
          <div style={{ marginLeft: '20px' }}>
            <b>Agenda:</b>
            {this.state.agenda.map((value, index) => {
              if (value === 0) {
                return (
                  <div key={value + index + value + index}>
                    <b> Coordinate: ({value[0]}, {value[1]}, {value[2]}) </b>
                  </div>
                );
              }
              else {
                if (index < 15) {
                  return (
                    <div key={value + index + value + index}>
                      Coordinate: ({value[0]}, {value[1]}, {value[2]})
                    </div>
                  );
                }
                if (index === 15) {
                  return (<div key={value + index + value + index}>
                    Coordinate: ({value[0]}, {value[1]}, {value[2]})
                  <div> ... </div>
                  </div>);
                }
              }
            })
            }
          </div>
          <div style={{ marginLeft: '30px' }}>
            <b>Current Node:</b>
            <br />
            ({this.state.currentLocation[0]}, {this.state.currentLocation[1]})
          </div>

          <div style={{ marginLeft: '30px' }}>

            <b> {this.state.areaVisited.length} Visited Nodes </b>
            <br />
            {this.state.areaVisited.map((value, index) => {
              if (index < 15) {
                return (
                  <div key={value + index + value + index}> ({value[0]}, {value[1]}, {value[2]}) </div>
                );
              }
              if (index === 15) {
                return (
                  <div key={value + index + value + index}> ({value[0]}, {value[1]}, {value[2]})
                  <div> ... </div>
                  </div>
                );
              }

            })}
          </div>

        </Row>
        <div>
          <b> {this.state.path.length} Length Solution Path </b>
          {this.state.path.map((value, index) => {
            return (<div key={value + index + value + index}>
              ({value[0]}, {value[1]}, {value[2]})
            </div>);
          })}
        </div>


      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    //Define board parameters
    let obstacles = [[5, 4], [5, 3], [6, 6], [6, 2], [6,1], [6,5], 
    [7,6], [8,6], [6,6], [5,6], [4,6], [3,6]];
    let startPoint = [10,1];
    let endPoint = [19,10]
    return (
      <div className="game">
        <div className="game-board">

          <br />
          <Board startPoint={startPoint} obstacles={obstacles} endPoint={endPoint} row={20} column={20} />

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
