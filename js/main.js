'use strict'

const MINE = '💣'
const FLAG = '🚩'

// a global size for the board
var gSize = 4
var gMinesNum = 2
var gTimerInterval
// var gIsMinesAdded = false
// var gIsFirstClick = true
var gBoard = buildBoard()
var gGame = {
    isOn: false,
    isFirstClick: true,
    isHint: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lifeCount: 3
}



function onInit() {
    playGame()
}

function playGame() {
    gGame = {

        isOn: false,
        isFirstClick: true,
        isHint: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lifeCount: 3
    }
    emojiStatus('😃')
    lifeStatus()
    // gIsMinesAdded = false
    gBoard = buildBoard()
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
    return board
}

// creating an object cell
function createCell() {
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isHint: false

    }
    return cell
}

//render the board to an Html table
function renderBoard(board) {
    //checks how many negs are next to a cell and update the modal


    console.table('board', board)
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass
            if (currCell.isMarked) {
                cellClass = 'marked'
            } else if (currCell.isShown && currCell.isMine) {
                cellClass = 'mine'
            } else if (currCell.isShown) {
                cellClass = 'shown'
            } else {
                cellClass = ''
            }
            strHTML += `<td data-i="${i}" data-j="${j}" class="cell ${cellClass}" oncontextmenu="onCellMarked(event,this)" onclick="onCellClicked(this, ${i},${j})" ><span>`
            if (currCell.isMarked) {
                strHTML += FLAG
            }
            else if (!currCell.isShown) {
                strHTML += ''
            } else if (currCell.isMine) {
                strHTML += MINE
            } else if (currCell.minesAroundCount === 0) {
                strHTML += ''
            } else {
                strHTML += currCell.minesAroundCount
            }

            strHTML += '</span></td>'
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
            var currCell = row[j]
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
    if (gGame.isHint) {
        revealAndHideNegs(i, j)
        setTimeout(() => {
            gGame.isHint = false
            revealAndHideNegs(i, j)
        }, 1000)
    }

    if (gGame.isFirstClick) {
        addMines(i, j)
        gGame.isFirstClick = false
        gGame.isOn = true
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
        // timer()
    }
    if (gGame.isOn) {
        var currCell = gBoard[i][j]

        if (currCell.isShown) return // checks if a cell is shown
        if (currCell.isMine) {
            gGame.lifeCount--
            if (gGame.lifeCount > 0) {
                currCell.isShown = true
                // gGame.shownCount++
            } else {
                gGame.isOn = false
                emojiStatus('😵')
                revealMines() // reveals mines when the user is lost
            }
            lifeStatus()
        } else if (currCell.isMarked) {
            return
        } else if (currCell.minesAroundCount === 0) {
            currCell.isShown = true
            elCell.innerHTML = ''
            // addClassShown(elCell)
            expandShown(gBoard, elCell, i, j)

        } else {
            currCell.isShown = true
            elCell.innerHTML = currCell.minesAroundCount
            // addClassShown(elCell)
            gGame.shownCount++
        }
        renderBoard(gBoard)
        checkVictory()
    }
}

function revealAndHideNegs(cellPosI, cellPosJ) {
    for (var i = cellPosI - 1; i <= cellPosI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellPosJ - 1; j <= cellPosJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            var currCell = gBoard[i][j]
            if (gGame.isHint) {
                if (currCell.isShown) continue
                currCell.isShown = gGame.isHint
                currCell.isHint = true
            } else {
                if (currCell.isHint) {
                    currCell.isHint = false
                    currCell.isShown = gGame.isHint
                }
            }
        }
        renderBoard(gBoard)
    }
}

function lifeStatus() {
    var elH2Span = document.querySelector('.lifeCount')
    elH2Span.innerHTML = gGame.lifeCount
}

// function addClassShown(elCell) {
// elCell.classList.add('shown')
// }

function onCellMarked(ev, elCell) {
    ev.preventDefault()
    var currCell = gBoard[elCell.dataset.i][elCell.dataset.j]
    if (currCell.isShown) return // checks if he is already shown in the board
    elCell.classList.toggle('marked')

    if (currCell.isMarked) {
        currCell.isMarked = false
        elCell.innerHTML = ''
        if (currCell.isMine) gGame.markedCount--
    } else {
        currCell.isMarked = true
        elCell.innerHTML = FLAG
        if (currCell.isMine) gGame.markedCount++
    }
    // renderBoard()
}

function addMines(cellI, cellJ) {
    while (gMinesNum > 0) {
        var currI = getRandomInt(0, gBoard.length)
        var currJ = getRandomInt(0, gBoard[0].length)
        var currCell = gBoard[currI][currJ]
        console.log('board', gBoard)
        if (currCell.isMine) continue
        else if (currI === cellI && currJ === cellJ) continue
        else {
            currCell.isMine = true
            gMinesNum--
            console.log('hiii')
        }

        // debugger
    }
}

function checkVictory() {
    if (gGame.shownCount === gSize * gSize - gGame.markedCount - (3 - gGame.lifeCount) && gGame.markedCount===gMinesNum-(3 - gGame.lifeCount)) {
        gGame.isOn = false
        emojiStatus('🤩')
        return true

    }
    return false

}

function emojiStatus(char) {
    var elEmoji = document.querySelector('.emoji')
    elEmoji.innerHTML = char
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

function expandShown(board, elCell, cellPosI, cellPosJ) {
    for (var i = cellPosI - 1; i <= cellPosI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellPosJ - 1; j <= cellPosJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            // if (i === cellPosI && j === cellPosJ) continue
            var currCell = board[i][j]
            if (currCell.isMine || currCell.isMarked) continue

            currCell.isShown = true
            gGame.shownCount++

            // elCell.innerHTML=currCell.minesAroundCount
            // addClassShown(elCell)
            // expandShown(board, elCell, i, j)

        }
    }
    // renderBoard(board)
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) gBoard[i][j].isShown = true
        }
    }
    renderBoard(gBoard)
}

function showHint(elHint) {
    elHint.style.backgroundcolor = 'yellow'
    gGame.isHint = true
}

function changingSizeBoard(size, minesNum) {
    gSize = size
    gMinesNum = minesNum
    playGame()
}

function restartGame() {
    gSize = 4
    gMinesNum = 2
    playGame()
}

function timer() {
    var startTime = Date.now()

    gTimerInterval = setInterval(() => {
        var elapsedTime = Date.now() - startTime
        document.querySelector('.timer').innerText = (
            elapsedTime / 1000
        ).toFixed(1)
    }, 37)
}