document.getElementById('addRowBtn').addEventListener('click', () => addRow())
document.getElementById('clearAllBtn').addEventListener('click', clearAll)

// Load previous entries from localStorage on page load
window.onload = function () {
  loadPreviousEntries()
}

function addRow(distance = 0, hour = 0, minute = 0, second = 0) {
  const table = document
    .getElementById('timeTable')
    .getElementsByTagName('tbody')[0]
  const newRow = table.insertRow()
  for (let i = 0; i < 6; i++) {
    const newCell = newRow.insertCell(i)
    if (i < 4) {
      const input = document.createElement('input')
      input.type = 'number'
      input.min = 0
      input.value = [distance, hour, minute, second][i]
      input.className = 'form-control'
      if (i === 1) input.max = '23'
      else if (i > 1) input.max = '59'

      input.addEventListener('change', () => {
        validateInput(input, i)
        updateSum()
      })
      newCell.appendChild(input)
    } else if (i === 4) {
      newCell.textContent = '00:00:00'
    } else {
      // Add delete button in the last cell
      const deleteButton = document.createElement('button')
      deleteButton.textContent = 'Delete'
      deleteButton.className = 'btn btn-danger btn-sm'
      deleteButton.addEventListener('click', () => {
        table.deleteRow(newRow.rowIndex - 1) // Adjust for header row
        updateSum()
        saveEntries() // Save changes after row deletion
      })
      newCell.appendChild(deleteButton)
    }
  }
  updateSum()
}

function validateInput(input, index) {
  const value = parseInt(input.value, 10)
  if (index > 0 && index < 4) {
    if ((index === 1 && value > 23) || value > 59) {
      input.value = index === 1 ? '23' : '59'
    }
  }
  saveEntries() // Save every change to localStorage
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
      sumCell.textContent = formatTime(sumHours, sumMinutes, sumSeconds)
    } else {
      sumCell.textContent = formatTime(hour, minute, second)
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
  document.getElementById('totalTime').textContent = formatTime(
    totalHours,
    totalMinutes,
    totalSec
  )
  document.getElementById('averagePace').textContent = `${formatNumber(
    paceMinutes
  )}:${formatNumber(paceSeconds)}`
}

function formatTime(hours, minutes, seconds) {
  return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(
    seconds
  )}`
}

function formatNumber(num) {
  return num < 10 ? `0${num}` : num
}

function saveEntries() {
  const rows = document.getElementById('timeTable').rows
  const entries = []
  for (let i = 1; i < rows.length; i++) {
    const distance = rows[i].cells[0].children[0].value
    const hour = rows[i].cells[1].children[0].value
    const minute = rows[i].cells[2].children[0].value
    const second = rows[i].cells[3].children[0].value
    entries.push({ distance, hour, minute, second })
  }
  localStorage.setItem('entries', JSON.stringify(entries))
}

function loadPreviousEntries() {
  const entries = JSON.parse(localStorage.getItem('entries'))
  if (entries) {
    entries.forEach(entry => {
      addRow(entry.distance, entry.hour, entry.minute, entry.second)
    })
  } else {
    // Initialize the table with two rows if no previous entries
    addRow()
    addRow()
  }
}

function clearAll() {
  const tableBody = document
    .getElementById('timeTable')
    .getElementsByTagName('tbody')[0]
  tableBody.innerHTML = '' // Clear all rows
  addRow()
  addRow()
  localStorage.removeItem('entries') // Clear entries from localStorage
  updateSum()
}
