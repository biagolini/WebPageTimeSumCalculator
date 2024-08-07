document.getElementById('addRowBtn').addEventListener('click', addRow)

function addRow() {
  const table = document
    .getElementById('timeTable')
    .getElementsByTagName('tbody')[0]
  const newRow = table.insertRow()
  for (let i = 0; i < 5; i++) {
    const newCell = newRow.insertCell(i)
    if (i < 4) {
      const input = document.createElement('input')
      input.type = 'number'
      input.min = 0
      input.value = 0
      if (i === 1) input.max = '23'
      else if (i > 1) input.max = '59'

      input.addEventListener('change', () => {
        validateInput(input, i)
        updateSum()
      })
      newCell.appendChild(input)
    } else {
      newCell.textContent = '0:0:0'
    }
  }
}

function validateInput(input, index) {
  const value = parseInt(input.value, 10)
  if (index > 0 && index < 4) {
    if ((index === 1 && value > 23) || value > 59) {
      input.value = index === 1 ? '23' : '59'
    }
  }
}

function updateSum() {
  const rows = document.getElementById('timeTable').rows
  let totalDistance = 0
  let totalSeconds = 0

  for (let i = 1; i < rows.length; i++) {
    const distanceInput = rows[i].cells[0].children[0]
    const hourInput = rows[i].cells[1].children[0]
    const minuteInput = rows[i].cells[2].children[0]
    const secondInput = rows[i].cells[3].children[0]

    validateInput(distanceInput, 0)
    validateInput(hourInput, 1)
    validateInput(minuteInput, 2)
    validateInput(secondInput, 3)

    const distance = parseFloat(distanceInput.value)
    const hour = parseInt(hourInput.value)
    const minute = parseInt(minuteInput.value)
    const second = parseInt(secondInput.value)

    totalDistance += distance
    totalSeconds += hour * 3600 + minute * 60 + second

    const sumCell = rows[i].cells[4]
    if (i > 1) {
      const prevSum = rows[i - 1].cells[4].textContent.split(':')
      const cumulativeSeconds =
        parseInt(prevSum[0]) * 3600 +
        parseInt(prevSum[1]) * 60 +
        parseInt(prevSum[2]) +
        hour * 3600 +
        minute * 60 +
        second
      const sumHours = Math.floor(cumulativeSeconds / 3600)
      const sumMinutes = Math.floor((cumulativeSeconds % 3600) / 60)
      const sumSeconds = cumulativeSeconds % 60
      sumCell.textContent = `${sumHours}:${sumMinutes}:${sumSeconds}`
    } else {
      sumCell.textContent = `${hour}:${minute}:${second}`
    }
  }

  updateSummary(totalDistance, totalSeconds)
}

function updateSummary(totalDistance, totalSeconds) {
  const totalHours = Math.floor(totalSeconds / 3600)
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60)
  const totalSec = totalSeconds % 60

  const averagePaceSeconds = totalSeconds / totalDistance
  const paceMinutes = Math.floor(averagePaceSeconds / 60)
  const paceSeconds = Math.round(averagePaceSeconds % 60)

  document.getElementById('totalDistance').textContent =
    totalDistance.toFixed(2)
  document.getElementById(
    'totalTime'
  ).textContent = `${totalHours}:${totalMinutes}:${totalSec}`
  document.getElementById(
    'averagePace'
  ).textContent = `${paceMinutes}:${paceSeconds} per km`
}

// Initialize the table with two rows
addRow()
addRow()
