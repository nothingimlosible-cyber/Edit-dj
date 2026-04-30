let deckA, deckB, crossFade, masterEQ, masterReverb, masterDelay, masterFilter;
let audioReady = false;
let bpmA = 120, bpmB = 120;
let loopA = false, loopB = false;

async function startAudio() {
  if (audioReady) return true;
  try {
    await Tone.start();
    audioReady = true;
    document.getElementById('status').textContent = '✅ AUDIO READY! Upload lagu terus Play';
    document.getElementById('status').className = 'status ready';

    masterEQ = new Tone.EQ3(0, 0, 0).toDestination();
    masterFilter = new Tone.Filter(20000, "lowpass").connect(masterEQ);
    masterReverb = new Tone.Reverb({ decay: 2, wet: 0 }).connect(masterFilter);
    masterDelay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.5, wet: 0 }).connect(masterReverb);
    crossFade = new Tone.CrossFade(0.5).connect(masterDelay);

    deckA = new Tone.Player().connect(crossFade.a);
    deckB = new Tone.Player().connect(crossFade.b);
    return true;
  } catch (e) {
    alert('Error init audio: ' + e);
    return false;
  }
}

// FILE LOAD
document.getElementById('fileA').onchange = async e => {
  if (!await startAudio()) return;
  if (!e.target.files[0]) return;
  await deckA.load(URL.createObjectURL(e.target.files[0]));
  drawWaveform('waveA', deckA.buffer);
  bpmA = await detectBPM(deckA.buffer);
  document.getElementById('bpmA').textContent = bpmA.toFixed(1) + ' BPM';
};

document.getElementById('fileB').onchange = async e => {
  if (!await startAudio()) return;
  if (!e.target.files[0]) return;
  await deckB.load(URL.createObjectURL(e.target.files[0]));
  drawWaveform('waveB', deckB.buffer);
  bpmB = await detectBPM(deckB.buffer);
  document.getElementById('bpmB').textContent = bpmB.toFixed(1) + ' BPM';
};

// PLAY BUTTONS
document.getElementById('playA').onclick = async () => {
  if (!await startAudio()) return;
  if (!deckA.loaded) return alert('Upload lagu dulu di Deck A');
  if (deckA.state === 'started') {
    deckA.stop();
    document.getElementById('playA').textContent = '▶ PLAY';
    document.getElementById('playA').classList.remove('stop');
  } else {
    deckA.start();
    document.getElementById('playA').textContent = '■ STOP';
    document.getElementById('playA').classList.add('stop');
  }
};

document.getElementById('playB').onclick = async () => {
  if (!await startAudio()) return;
  if (!deckB.loaded) return alert('Upload lagu dulu di Deck B');
  if (deckB.state === 'started') {
    deckB.stop();
    document.getElementById('playB').textContent = '▶ PLAY';
    document.getElementById('playB').classList.remove('stop');
  } else {
    deckB.start();
    document.getElementById('playB').textContent = '■ STOP';
    document.getElementById('playB').classList.add('stop');
  }
};

// CONTROLS
document.getElementById('cueA').onclick = () => deckA.seek(0);
document.getElementById('cueB').onclick = () => deckB.seek(0);
document.getElementById('loopA').onclick = () => { loopA =!loopA; deckA.loop = loopA; document.getElementById('loopA').classList.toggle('active'); };
document.getElementById('loopB').onclick = () => { loopB =!loopB; deckB.loop = loopB; document.getElementById('loopB').classList.toggle('active'); };
document.getElementById('tempoA').oninput = e => { deckA.playbackRate = parseFloat(e.target.value); document.getElementById('tempoAVal').textContent = parseFloat(e.target.value).toFixed(2) + 'x'; };
document.getElementById('tempoB').oninput = e => { deckB.playbackRate = parseFloat(e.target.value); document.getElementById('tempoBVal').textContent = parseFloat(e.target.value).toFixed(2) + 'x'; };
document.getElementById('volA').oninput = e => { deckA.volume.value = parseFloat(e.target.value); document.getElementById('volAVal').textContent = e.target.value + 'dB'; };
document.getElementById('volB').oninput = e => { deckB.volume.value = parseFloat(e.target.value); document.getElementById('volBVal').textContent = e.target.value + 'dB'; };
document.getElementById('crossfader').oninput = e => crossFade.fade.value = parseFloat(e.target.value);

// SYNC
document.getElementById('syncA').onclick = () => {
  const ratio = bpmB / bpmA;
  deckA.playbackRate = ratio;
  document.getElementById('tempoA').value = ratio;
  document.getElementById('tempoAVal').textContent = ratio.toFixed(2) + 'x';
};
document.getElementById('syncB').onclick = () => {
  const ratio = bpmA / bpmB;
  deckB.playbackRate = ratio;
  document.getElementById('tempoB').value = ratio;
  document.getElementById('tempoBVal').textContent = ratio.toFixed(2) + 'x';
};

// FX
document.getElementById('bass').oninput = e => masterEQ.low.value = parseFloat(e.target.value);
document.getElementById('mid').oninput = e => masterEQ.mid.value = parseFloat(e.target.value);
document.getElementById('treble').oninput = e => masterEQ.high.value = parseFloat(e.target.value);
document.getElementById('reverb').oninput = e => { masterReverb.wet.value = parseFloat(e.target.value); document.getElementById('reverbVal').textContent = Math.round(e.target.value * 100) + '%'; };
document.getElementById('decay').oninput = e => { masterReverb.decay = parseFloat(e.target.value); document.getElementById('decayVal').textContent = parseFloat(e.target.value).toFixed(1) + 's'; };
document.getElementById('echo').oninput = e => { masterDelay.wet.value = parseFloat(e.target.value); document.getElementById('echoVal').textContent = Math.round(e.target.value * 100) + '%'; };
document.getElementById('echoTime').oninput = e => { masterDelay.delayTime.value = parseFloat(e.target.value); document.getElementById('echoTimeVal').textContent = parseFloat(e.target.value).toFixed(2) + 's'; };
document.getElementById('filter').oninput = e => { masterFilter.frequency.value = parseFloat(e.target.value); const val = parseFloat(e.target.value); document.getElementById('filterVal').textContent = val >= 1000? (val/1000).toFixed(1) + 'kHz' : val + 'Hz'; };
document.getElementById('resonance').oninput = e => { masterFilter.Q.value = parseFloat(e.target.value); document.getElementById('resVal').textContent = e.target.value; };

// JOGWHEEL SCRATCH
[['jogA', 'tempoA', () => deckA], ['jogB', 'tempoB', () => deckB]].forEach(([jogId, tempoId, getDeck]) => {
  const jog = document.getElementById(jogId);
  let isDragging = false, rotation = 0;
  jog.onmousedown = e => { isDragging = true; e.preventDefault(); };
  document.onmouseup = () => { isDragging = false; };
  document.onmousemove = e => {
    if (isDragging && getDeck().loaded) {
      rotation += e.movementX;
      jog.style.transform = `rotate(${rotation}deg)`;
      const deck = getDeck();
      const currentRate = parseFloat(document.getElementById(tempoId).value);
      deck.playbackRate = currentRate + (e.movementX * 0.01);
      clearTimeout(deck.scratchTimeout);
      deck.scratchTimeout = setTimeout(() => deck.playbackRate = currentRate, 100);
    }
  };
});

// BPM DETECT
async function detectBPM(buffer) {
  const data = buffer.getChannelData(0);
  const peaks = [];
  for(let i = 0; i < data.length; i++) {
    if(data[i] > 0.9) { peaks.push(i); i += 10000; }
  }
  if(peaks.length < 2) return 120;
  const intervals = [];
  for(let i = 1; i < peaks.length; i++) intervals.push(peaks[i] - peaks[i-1]);
  const avg = intervals.reduce((a,b) => a+b, 0) / intervals.length;
  return 60 / (avg / buffer.sampleRate);
}

// WAVEFORM
function drawWaveform(id, buffer) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / canvas.width);
  const amp = canvas.height / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath(); ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
  for(let i = 0; i < canvas.width; i++) {
    let min = 1.0, max = -1.0;
    for(let j = 0; j < step; j++) {
      const datum = data[i * step + j];
      if(datum < min) min = datum;
      if(datum > max) max = datum;
    }
    ctx.moveTo(i, (1 + min) * amp);
    ctx.lineTo(i, (1 + max) * amp);
  }
  ctx.stroke();
}

// PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
