document.getElementById('addRowBtn').addEventListener('click', addEntry);
document.getElementById('clearAllBtn').addEventListener('click', clearAll);

window.onload = function () {
  loadPreviousEntries();
};

let entryCounter = 0;

function addEntry(distance = 0, hour = 0, minute = 0, second = 0) {
  entryCounter++;
  const container = document.getElementById('entriesContainer');
  
  const entryCard = document.createElement('div');
  entryCard.className = 'entry-card';
  entryCard.dataset.entryId = entryCounter;
  
  entryCard.innerHTML = `
    <div class="entry-header">
      <span class="entry-number">Entry ${entryCounter}</span>
      <button class="delete-btn" onclick="deleteEntry(${entryCounter})">×</button>
    </div>
    
    <div class="input-group">
      <div class="input-field">
        <label>Distance</label>
        <input type="number" step="0.1" min="0" value="${distance}" data-field="distance">
      </div>
      <div class="input-field">
        <label>Hours</label>
        <input type="number" min="0" max="23" value="${hour}" data-field="hour">
      </div>
      <div class="input-field">
        <label>Minutes</label>
        <input type="number" min="0" max="59" value="${minute}" data-field="minute">
      </div>
      <div class="input-field">
        <label>Seconds</label>
        <input type="number" min="0" max="59" value="${second}" data-field="second">
      </div>
    </div>
    
    <div class="sum-display">
      Cumulative: <span class="sum-time">00:00:00</span>
    </div>
  `;
  
  container.appendChild(entryCard);
  
  // Add event listeners to inputs
  const inputs = entryCard.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      validateInput(input);
      updateSums();
      saveEntries();
    });
  });
  
  updateSums();
}

function deleteEntry(entryId) {
  const entryCard = document.querySelector(`[data-entry-id="${entryId}"]`);
  if (entryCard) {
    entryCard.remove();
    updateSums();
    saveEntries();
  }
}

function validateInput(input) {
  const field = input.dataset.field;
  let value = parseInt(input.value) || 0;
  
  if (field === 'hour' && value > 23) {
    input.value = 23;
  } else if ((field === 'minute' || field === 'second') && value > 59) {
    input.value = 59;
  } else if (value < 0) {
    input.value = 0;
  }
}

function updateSums() {
  const entries = document.querySelectorAll('.entry-card');
  let totalDistance = 0;
  let cumulativeSeconds = 0;
  let totalSeconds = 0;
  
  entries.forEach((entry, index) => {
    const inputs = entry.querySelectorAll('input');
    const distance = parseFloat(inputs[0].value) || 0;
    const hour = parseInt(inputs[1].value) || 0;
    const minute = parseInt(inputs[2].value) || 0;
    const second = parseInt(inputs[3].value) || 0;
    
    const entrySeconds = hour * 3600 + minute * 60 + second;
    cumulativeSeconds += entrySeconds;
    totalDistance += distance;
    totalSeconds += entrySeconds;
    
    const sumDisplay = entry.querySelector('.sum-time');
    sumDisplay.textContent = formatTime(cumulativeSeconds);
  });
  
  updateSummary(totalDistance, totalSeconds);
}

function updateSummary(totalDistance, totalSeconds) {
  const averagePaceSeconds = totalDistance > 0 ? totalSeconds / totalDistance : 0;
  const paceMinutes = Math.floor(averagePaceSeconds / 60);
  const paceSeconds = Math.round(averagePaceSeconds % 60);
  
  document.getElementById('totalDistance').textContent = totalDistance.toFixed(1);
  document.getElementById('totalTime').textContent = formatTime(totalSeconds);
  document.getElementById('averagePace').textContent = 
    totalDistance > 0 ? `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}` : '0:00';
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function saveEntries() {
  const entries = [];
  document.querySelectorAll('.entry-card').forEach(entry => {
    const inputs = entry.querySelectorAll('input');
    entries.push({
      distance: inputs[0].value,
      hour: inputs[1].value,
      minute: inputs[2].value,
      second: inputs[3].value
    });
  });
  localStorage.setItem('entries', JSON.stringify(entries));
}

function loadPreviousEntries() {
  const entries = JSON.parse(localStorage.getItem('entries'));
  if (entries && entries.length > 0) {
    entries.forEach(entry => {
      addEntry(entry.distance, entry.hour, entry.minute, entry.second);
    });
  } else {
    addEntry();
  }
}

function clearAll() {
  document.getElementById('entriesContainer').innerHTML = '';
  entryCounter = 0;
  localStorage.removeItem('entries');
  addEntry();
}
