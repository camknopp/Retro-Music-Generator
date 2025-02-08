const express = require('express');
const MidiWriter = require('midi-writer-js');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const chordTypes = {
  triad: {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    augmented: [0, 4, 8]
  },
  seventh: {
    dominant7: [0, 4, 7, 10],
    major7: [0, 4, 7, 11],
    minor7: [0, 3, 7, 10],
    halfDiminished7: [0, 3, 6, 10],
    diminished7: [0, 3, 6, 9],
    minorMajor7: [0, 3, 7, 11]
  },
  extended: {
    ninth: [0, 4, 7, 10, 14],
    major9: [0, 4, 7, 11, 14],
    minor9: [0, 3, 7, 10, 14],
    eleventh: [0, 4, 7, 10, 14, 17],
    thirteenth: [0, 4, 7, 10, 14, 21],
    minor11: [0, 3, 7, 10, 14, 17],
    minor13: [0, 3, 7, 10, 14, 21]
  },
  altered: {
    dominant7flat9: [0, 4, 7, 10, 13],
    dominant7sharp9: [0, 4, 7, 10, 15],
    dominant7flat5: [0, 4, 6, 10],
    dominant7sharp5: [0, 4, 8, 10]
  }
};

const noteToMidi = {
  'C': 60, 'C#': 61, 'Db': 61,
  'D': 62, 'D#': 63, 'Eb': 63,
  'E': 64,
  'F': 65, 'F#': 66, 'Gb': 66,
  'G': 67, 'G#': 68, 'Ab': 68,
  'A': 69, 'A#': 70, 'Bb': 70,
  'B': 71
};

function midiToNote(midiNumber) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const note = notes[midiNumber % 12];
  const octave = Math.floor(midiNumber / 12) - 1;
  return `${note}${octave}`;
}

function getNthDegree(key, n) {
  const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const keyIndex = scale.indexOf(key);
  return scale[(keyIndex + n - 1) % 7];
}

// Add chromatic approach chords and secondary dominants
function getSecondaryDominant(key, targetDegree) {
  const scale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const target = getNthDegree(key, targetDegree);
  const targetIndex = scale.indexOf(target);
  const dominantIndex = (targetIndex + 4) % 7;
  return scale[dominantIndex];
}

function generateChordProgressions(key, type) {
  const progressions = {
    jazz: [
      // ii-V-I with extensions and chromatic approach
      [
        { root: getNthDegree(key, 2), chord: 'minor9', inversion: 1 },
        { root: getSecondaryDominant(key, 5), chord: 'dominant7sharp9', inversion: 0 },
        { root: getNthDegree(key, 5), chord: 'dominant13', inversion: 2 },
        { root: key, chord: 'major9', inversion: 0 }
      ],
      // Bird Changes (based on Confirmation changes)
      [
        { root: key, chord: 'major9', inversion: 0 },
        { root: getNthDegree(key, 7), chord: 'dominant7flat9', inversion: 1 },
        { root: getNthDegree(key, 3), chord: 'minor11', inversion: 0 },
        { root: getNthDegree(key, 6), chord: 'dominant13', inversion: 2 }
      ]
    ],
    extended: [
      // Modal interchange with upper structures
      [
        { root: key, chord: 'major13', inversion: 0 },
        { root: getNthDegree(key, 6), chord: 'minor13', inversion: 1 },
        { root: getSecondaryDominant(key, 2), chord: 'dominant7sharp9', inversion: 0 },
        { root: getNthDegree(key, 2), chord: 'minor11', inversion: 2 }
      ],
      // Coltrane Changes inspired
      [
        { root: key, chord: 'major13', inversion: 0 },
        { root: getNthDegree(key, 3), chord: 'dominant13', inversion: 1 },
        { root: getNthDegree(key, 6), chord: 'minor13', inversion: 2 },
        { root: getNthDegree(key, 2), chord: 'dominant7flat9', inversion: 0 }
      ]
    ],
    complex: [
      // Altered dominants and diminished approach
      [
        { root: key, chord: 'major9', inversion: 0 },
        { root: getNthDegree(key, 7), chord: 'halfDiminished7', inversion: 1 },
        { root: getSecondaryDominant(key, 4), chord: 'dominant7sharp5', inversion: 2 },
        { root: getNthDegree(key, 4), chord: 'minor13', inversion: 0 }
      ],
      // Modern jazz harmony
      [
        { root: getNthDegree(key, 4), chord: 'major13', inversion: 0 },
        { root: getNthDegree(key, 7), chord: 'dominant7flat9', inversion: 2 },
        { root: getNthDegree(key, 3), chord: 'minor11', inversion: 1 },
        { root: key, chord: 'major9', inversion: 0 }
      ]
    ]
  };

  const selectedProgressions = progressions[type] || progressions.jazz;
  return selectedProgressions[Math.floor(Math.random() * selectedProgressions.length)];
}

function generateChord(root, type, inversion = 0) {
  let intervals;
  if (type.includes('13')) {
    intervals = type.includes('minor') ? chordTypes.extended.minor13 : chordTypes.extended.thirteenth;
  } else if (type.includes('11')) {
    intervals = type.includes('minor') ? chordTypes.extended.minor11 : chordTypes.extended.eleventh;
  } else if (type.includes('9')) {
    if (type.includes('flat9')) {
      intervals = chordTypes.altered.dominant7flat9;
    } else if (type.includes('sharp9')) {
      intervals = chordTypes.altered.dominant7sharp9;
    } else {
      intervals = type.includes('minor') ? chordTypes.extended.minor9 : 
                 type.includes('major') ? chordTypes.extended.major9 :
                 chordTypes.extended.ninth;
    }
  } else if (type.includes('7')) {
    if (type.includes('flat5')) {
      intervals = chordTypes.altered.dominant7flat5;
    } else if (type.includes('sharp5')) {
      intervals = chordTypes.altered.dominant7sharp5;
    } else {
      intervals = type.includes('major7') ? chordTypes.seventh.major7 :
                 type.includes('minor7') ? chordTypes.seventh.minor7 :
                 type.includes('dim7') ? chordTypes.seventh.diminished7 :
                 type.includes('m7b5') ? chordTypes.seventh.halfDiminished7 :
                 chordTypes.seventh.dominant7;
    }
  } else {
    intervals = type.includes('minor') ? chordTypes.triad.minor :
               type.includes('dim') ? chordTypes.triad.diminished :
               type.includes('aug') ? chordTypes.triad.augmented :
               chordTypes.triad.major;
  }

  const rootMidi = noteToMidi[root];
  let notes = intervals.map(interval => rootMidi + interval);

  // Apply inversion with proper octave handling
  for (let i = 0; i < inversion; i++) {
    const note = notes.shift();
    notes.push(note + 12);
  }

  // Convert to note names with proper octaves
  return notes.map(midiNote => {
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][midiNote % 12];
    return `${noteName}${octave}`;
  });
}

app.post('/generate', (req, res) => {
  const { key, progressionType } = req.body;
  const progression = generateChordProgressions(key, progressionType);
  const track = new MidiWriter.Track();
  
  const chords = progression.map(({ root, chord, inversion }) => {
    return generateChord(root, chord, inversion);
  });

  chords.forEach((chord) => {
    const noteEvent = new MidiWriter.NoteEvent({
      pitch: chord,
      duration: '2',
      velocity: 85,
      channel: 1,
      sequential: false // Play notes simultaneously as a chord
    });
    track.addEvent(noteEvent);
  });

  const writer = new MidiWriter.Writer(track);
  
  res.json({
    midi: Buffer.from(writer.buildFile()).toString('base64'),
    noteData: chords.map((chord, index) => ({
      notes: chord,
      duration: 2,
      time: index * 2,
      velocity: 85 // Include velocity for consistent playback
    }))
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
