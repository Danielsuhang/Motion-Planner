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
      squares: this.initBoardData(this.props.row, this.props.column),
      startPoint: this.props.startPoint,
      obstacle: this.props.obstacles, 
    };
    this.changeColor = this.changeColor.bind(this);
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
          visited: false,
          color: 'white'
        }
        if (i === this.props.startPoint[0] 
          && j === this.props.startPoint[1]) {
            data[i][j].color = 'red';
        }
        else if (this.checkObstacle(i,j)) {
          data[i][j].color = 'black';
        }
      }
    }
    return data;
  }
  changeColor() {
    let updatedData = this.state.squares.slice();
    updatedData[5][5].color = "black";
    this.setState({
      squares: updatedData
    })
  }
  handleClick(i, j) {
    /* Create a copy of our squares array to make it immutable */
    const squares = this.state.squares.slice();
    this.setState({ squares: squares });
  }
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
  renderSquare(i, j) {
    let divStyle = {
      background: this.state.squares[i][j].color
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
        <Button varient="contained" color="primary" onClick={this.changeColor}>
          Next
          </Button>
        {this.createGrid(this.state.squares.length)}
        {/* <div className="board-row">
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
          </div>
          <div className="board-row">
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
          </div>
          <div className="board-row">
            {this.renderSquare(6)}
            {this.renderSquare(7)}
            {this.renderSquare(8)}
          </div> */}
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
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
  <Game/>,
  document.getElementById('root')
);
