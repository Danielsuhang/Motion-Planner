import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/* Change Square to be a Function Component */
class Square extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          divStyle: {
            background: 'white'
          }
        }
      }
      render() {
        return (
          <button className="square" style={this.state.divStyle} onClick={() => {
            this.props.onClick();
            this.setState({
              divStyle: {background: 'green'}
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
            squares: this.initBoardData(20, 20) 
        };
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
            visited: false
          }
        }
      }
      return data;
    }
    handleClick(i, j) {
        /* Create a copy of our squares array to make it immutable */ 
        const squares = this.state.squares.slice();
        this.setState({squares: squares});
        /* If someone has won or if that square is already selected, do nothing when Square is clicked*/
    }
    renderSquare(i, j) {
      return <Square key={i * j + i + j + 2 * i} value={this.state.squares[i][j]}
      /* Pass in onClick function into Square */
      onClick={() => this.handleClick(i, j)}
      />;
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
          Board:
            <Board />
          </div>
          <div className="game-info">
            <div>{/* status */}</div>
            <ol>{/* TODO */}</ol>
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
  