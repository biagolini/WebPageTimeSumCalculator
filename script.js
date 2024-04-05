document.getElementById('addRowBtn').addEventListener('click', addRow)

function addRow() {
  const table = document
    .getElementById('timeTable')
    .getElementsByTagName('tbody')[0]
  const newRow = table.insertRow()
  for (let i = 0; i < 4; i++) {
    const newCell = newRow.insertCell(i)
    if (i < 3) {
      const input = document.createElement('input')
      input.type = 'text' // Keep as text to manually handle numeric validation
      input.pattern = '\\d*' // Ensures on mobile keyboards, numeric keyboard is shown
      input.value = 0
      input.setAttribute('data-type', i < 1 ? 'hour' : 'minsec') // Custom attribute to distinguish between hour and minute/second inputs
      input.addEventListener('input', enforceNumericInput)
      input.addEventListener('change', updateSum)
      newCell.appendChild(input)
    } else {
      newCell.textContent = '0:0:0'
    }
  }
}

function enforceNumericInput(event) {
  let value = event.target.value.replace(/[^0-9]/g, '')
  value = parseInt(value, 10)

  if (isNaN(value)) {
    value = 0 // Default to 0 if the result is NaN (not a number)
  } else if (
    event.target.getAttribute('data-type') === 'minsec' &&
    value > 59
  ) {
    value = 59 // Cap minute and second values at 59
  } else if (value < 0) {
    value = 0 // Prevent negative numbers
  }

  event.target.value = value
}

function updateSum() {
  const rows = document.getElementById('timeTable').rows
  for (let i = 1; i < rows.length; i++) {
    // Skip header row
    const hour = rows[i].cells[0].children[0].value
    const minute = rows[i].cells[1].children[0].value
    const second = rows[i].cells[2].children[0].value
    const sumCell = rows[i].cells[3]
    if (i > 1) {
      const prevSum = rows[i - 1].cells[3].textContent.split(':')
      const totalSeconds =
        parseInt(hour) * 3600 +
        parseInt(minute) * 60 +
        parseInt(second) +
        parseInt(prevSum[0]) * 3600 +
        parseInt(prevSum[1]) * 60 +
        parseInt(prevSum[2])
      const sumHours = Math.floor(totalSeconds / 3600)
      const sumMinutes = Math.floor((totalSeconds % 3600) / 60)
      const sumSeconds = totalSeconds % 60
      sumCell.textContent = `${sumHours}:${sumMinutes}:${sumSeconds}`
    } else {
      sumCell.textContent = `${hour}:${minute}:${second}`
    }
  }
}

// Initialize the table with one row
addRow()
addRow()
