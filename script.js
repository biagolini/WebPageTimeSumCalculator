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
      input.type = 'number'
      input.min = 0
      input.value = 0
      input.max = i === 0 ? '23' : '59'
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
  if (index > 0) {
    const value = parseInt(input.value, 10)
    if (value > 59) {
      input.value = '59'
    }
  }
}

function updateSum() {
  const rows = document.getElementById('timeTable').rows
  for (let i = 1; i < rows.length; i++) {
    const hourInput = rows[i].cells[0].children[0]
    const minuteInput = rows[i].cells[1].children[0]
    const secondInput = rows[i].cells[2].children[0]
    validateInput(hourInput, 0)
    validateInput(minuteInput, 1)
    validateInput(secondInput, 2)

    const hour = hourInput.value
    const minute = minuteInput.value
    const second = secondInput.value
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

// Initialize the table with two rows
addRow()
addRow()
