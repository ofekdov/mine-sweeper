'use strict'

const MINE = '💣'
const FLAG = '🚩'

// a global size for the board
var gSize = 4
var gMinesNum = 2
var gBoard = buildBoard()
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}



function onInit() {
    playGame()
}

function playGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = buildBoard()
    // addMines(gBoard,gMinesNum)
    renderBoard(gBoard)
}


// building a board 
function buildBoard() {
    const board = []

    for (var i = 0; i < gSize; i++) {
        board[i] = []

        for (var j = 0; j < gSize; j++) {
            board[i][j] = createCell()
        }
    }
    board[1][1].isMine = true
    board[2][2].isMine = true
    return board
}

// creating an object cell
function createCell() {
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false

    }
    return cell
}

//render the board to an Html table
function renderBoard(board) {
    //checks how many negs are next to a cell and update the modal
    setMinesNegsCount(board)

    console.table('board', board)
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            strHTML += `<td data-i="${i}" data-j="${j}" class="cell" oncontextmenu="onCellMarked(event,this)" onclick="onCellClicked(this, ${i},${j})" >`
            if (!currCell.isShown) {
                strHTML += ''
            } else if (currCell.isMine) {
                strHTML += MINE
                // } else if (currCell.isMarked) {
                // strHTML += FLAG
            } else {
                strHTML += currCell.minesAroundCount
            }

            strHTML += '</td>'
        }
        strHTML += '</tr>'
        // console.log('strHTML', strHTML)
    }

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

//Count mines around each cell and set the cell's minesAroundCount
function setMinesNegsCount(board) {
    for (var i = 0; i < gSize; i++) {
        var row = board[i]
        for (var j = 0; j < gSize; j++) {
            var currCell = board[i][j]
            if (currCell.isMine) continue
            currCell.minesAroundCount = countMinesAroundCell(i, j)
        }
    }
}

//count mines around a cell
function countMinesAroundCell(cellPosI, cellPosJ) {
    var negsCount = 0;
    for (var i = cellPosI - 1; i <= cellPosI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellPosJ - 1; j <= cellPosJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === cellPosI && j === cellPosJ) continue
            var currCell = gBoard[i][j]
            if (currCell.isMine) negsCount++
        }
    }
    return negsCount
}

function onCellClicked(elCell, i, j) {
    var currCell = gBoard[i][j]
    if (elCell.innerHTML === MINE) {
        gGame.isOn = false
    } else if (elCell.innerHTML === FLAG) {
        return
    } else if (elCell.innerHTML === 0) {
        expandShown(gBoard, elCell, i, j)
    } else {
        currCell.isShown = true
        gGame.shownCount++
    }

    // update the modal
    // update the DOM
    renderBoard(gBoard)
    checkGameOver()
}

function onCellMarked(ev, elCell) {
    ev.preventDefault()
    var currCell = gBoard[elCell.dataset.i][elCell.dataset.j]
    if (currCell.isShown) return // checks if he is already shown in the board
    elCell.classList.toggle('marked')

    if (currCell.isMarked) {
        currCell.isMarked = false
        elCell.innerHTML = (currCell.isMine)? MINE : currCell.minesAroundCount
        if (currCell.isMine) gGame.markedCount--
    } else {
        currCell.isMarked = true
        elCell.innerHTML = FLAG
        if (currCell.isMine) gGame.markedCount++
    }
}

// function onHandleMouse(ev, elCell, cellI, cellJ) {

// var currCell = gBoard[cellI][cellJ]
// if (ev.which === 1) {
// onCellClicked(elCell, cellI, cellJ)
// } else if (ev.which === 3) {
// onCellMarked(ev, elCell)
// currCell.isMarked = (currCell.isMarked) ? false : true
// 
// }
// 
// }


//add mines in the modal


function addMines(board, gMinesNum) {
    for (var i = 0; i < gMinesNum; i++) {
        board[getRandomInt(0, board.length)][getRandomInt(0, board[0].length)].isMine = true
    }
}

function checkGameOver() {
    if (gGame.shownCount === (gSize * gSize - gMinesNum && gGame.markedCount === gMinesNum)) {
        gGame.isOn = false
        console.log('hi')
        return true

    }
    return false

}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

function expandShown(board, elCell, cellPosI, cellPosJ) {
    if (countMinesAroundCell(board[cellPosI][cellPosJ]) === 0)
        for (var i = cellPosI - 1; i <= cellPosI + 1; i++) {
            if (i < 0 || i >= board.length) continue
            for (var j = cellPosJ - 1; j <= cellPosJ + 1; j++) {
                if (j < 0 || j >= board[i].length) continue
                if (i === cellPosI && j === cellPosJ) continue
                var currCell = board[i][j]
                if (currCell.isMine) continue
                if (countMinesAroundCell(currCell) === 0) {
                    currCell.isShown = true
                    // expandShown(board, elCell, i, j)
                }
            }
        }
    renderBoard(board)
}
