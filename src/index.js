import React from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
import './index.css';

/* Change Square to be a Function Component */
class Square extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          divStyle: {
            background: this.props.color
          }
        }
        if (this.props.obstacle) {
          this.state.divStyle = {background: 'gray'}  
        }
        if (this.props.isStart) {
          this.state.divStyle = {background: 'green'}  
        } 
      }
      render() {
        return (
          <button className="square" style={this.state.divStyle} onClick={() => {
            this.props.onClick();
            this.setState({
              divStyle: {background: 'yellow'}
            })
          }}>
          </button>
        );
      }
      
  }
  
  class Board extends React.Component {

    /* Lifting State into Parent instead of Child */
    constructor(props) {
        super(props);
        this.state = {
            squares: this.initBoardData(20, 20),
            startPoint: [15, 5],
            obstacle: [[5,4], [5,3], [6,6], [6,2]],
            color: 'white',
        };
        this.changeColor = this.changeColor.bind(this);
    }
    //Initialize Array with Cell Objects
    initBoardData(width, height) {
      let data = []
      for (let i = 0; i < width; i++) {
        data.push([]);
        for (let j = 0; j < height; j++) {
          data[i][j] = {
            x: i,
            y: j,
            curr: false,
            visited: false,
            color: 'white'
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
        this.setState({squares: squares});
    }
    checkObstacle(width, height) {
      for (let i = 0; i < this.state.obstacle.length; i++) {
        let x = this.state.obstacle[i][0];
        let y = this.state.obstacle[i][1];
        if (width === x && height === y) {
          return true;
        }
      }
      return false;
    }
    renderSquare(i, j) {
      let obs = false;
      let startPt = false;
      if (this.checkObstacle(i,j)) {
        obs = true;
      }
      if (i === this.state.startPoint[0] 
        && j === this.state.startPoint[1]) {
          startPt = true;
        }
      // return <Square key={i * j + i + j + 2 * i} 
      // value={this.state.squares[i][j]}
      // /* Pass in onClick function into Square */
      // onClick={() => this.handleClick(i, j)} obstacle={obs}
      // color = {this.state.color}
      // isStart={startPt}
      // />;
      let divStyle = {
        background: this.state.squares[i][j].color
      }
      return (
        <button key={i*j+i+j*2} className="square" style={divStyle}>
        </button>
      )
    }
    
    callChildren(row, size) {
      let children = [];
      for (let i = 0; i < size; i++) {
        children.push(this.renderSquare(row,i));
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
      return (
        <div className="game">
          <div className="game-board">
            
            <br /> 
            <Board />
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
  