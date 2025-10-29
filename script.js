// ======================================================
// !!! 1. CUSTOMIZATION ZONE !!!
// ======================================================

// 1. UNLOCK KEY: Must match the format in the placeholder (e.g., 03/14 for March 14th)
const CORRECT_KEY = "02/12";

// 2. QUIZ QUESTIONS & ANSWERS:
const quizQuestions = [
  {
    question: "Which of these places was the location of our first 'Kiss'?",
    options: ["College", "Park", "Theater"],
    answer: "Theater"
  },
  {
    question: "What's my(Suji ka) favourite outdoor sports?",
    options: ["Cricket", "Football", "Volleyball"],
    answer: "Football"
  },
  {
    question: "Toh batao You don't love me na?",
    options: ["Ummmmm.. Ye kaisa bhadwa question hai", "Yes", "No"],
    answer: "Ummmmm.. Ye kaisa bhadwa question hai"
  }
];

// ======================================================
// 2. CORE UTILITY FUNCTIONS
// ======================================================

function checkKey() {
  const enteredKey = document.getElementById('passkey').value.trim();
  const errorMessage = document.getElementById('error-message');
  const lockScreen = document.getElementById('lock-screen');
  const unlockedContent = document.getElementById('unlocked-content');

  if (enteredKey === CORRECT_KEY) {
    errorMessage.textContent = "";
    lockScreen.classList.add('hidden');
    setTimeout(() => {
      unlockedContent.classList.remove('hidden');
      unlockedContent.style.opacity = 1;
      showSection('letter');
      loadQuiz();
      startGame();
    }, 50);
  } else {
    errorMessage.textContent = "That's not it, my love! Try again (Hint: MM/DD).";
  }
}

function showSection(sectionId) {
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(sectionId + '-section').classList.remove('hidden');
}

// ======================================================
// 3. DYNAMIC PHOTO GALLERY IN LETTER
// ======================================================

const photoSources = {
  // Path updated to .jpeg based on user's uploaded files
  1: './images/secret_photo_1.jpeg',
  2: './images/secret_photo_2.jpeg',
  3: './images/secret_photo_3.jpeg',
};

function revealPhoto(id) {
  const photoDisplay = document.getElementById('dynamic-photo-display');
  photoDisplay.src = photoSources[id];
  photoDisplay.classList.add('visible-photo');
}

function hidePhoto() {
  document.getElementById('dynamic-photo-display').classList.remove('visible-photo');
}

// ======================================================
// 4. THE COUPLE QUIZ GAME LOGIC (Instant Feedback)
// ======================================================

function loadQuiz() {
  const quizContainer = document.getElementById('quiz-container');
  const submitBtn = document.getElementById('submit-quiz-btn');
  quizContainer.innerHTML = '';

  quizQuestions.forEach((q, index) => {
    const item = document.createElement('div');
    item.classList.add('question-item');
    item.dataset.index = index;

    // Safely encode the answer to prevent crashing on quotes (like in 'Ummmmm..')
    const encodedAnswer = q.answer.replace(/'/g, "\\'");

    item.innerHTML = `
            <p><strong>Q${index + 1}: ${q.question}</strong></p>
            <div id="options-q${index}">
                ${q.options.map(option => `
                    <label>
                        <input type="radio"
                            name="question${index}"
                            value="${option}"
                            onclick="handleQuizAnswer(this, ${index}, '${option.replace(/'/g, "\\'")}', '${encodedAnswer}')">
                        ${option}
                    </label>
                `).join('')}
            </div>
        `;
    quizContainer.appendChild(item);
  });

  submitBtn.classList.remove('hidden');
  document.getElementById('quiz-result').classList.add('hidden');
}

function handleQuizAnswer(selectedInput, questionIndex, selectedAnswer, encodedCorrectAnswer) {
  const questionItem = selectedInput.closest('.question-item');
  const optionsDiv = document.getElementById(`options-q${questionIndex}`);

  const correctAnswer = encodedCorrectAnswer.replace(/\\'/g, "'");
  let stickerHTML, message;

  // 1. Disable all radio buttons for this question
  optionsDiv.querySelectorAll('input[type="radio"]').forEach(input => {
    input.disabled = true;
  });

  // 2. Determine feedback (Using her photos for feedback)
  if (selectedAnswer === correctAnswer) {
    // FIX: Use complete <img> tag for happy photo
    stickerHTML = '<img src="./images/gf_happy.png" alt="Happy Face" class="feedback-image">';
    message = 'Waah Chotu! That\'s absolutely correct, my love!';
    questionItem.style.backgroundColor = '#e8f5e9';
    questionItem.dataset.answeredCorrectly = 'true';
  } else {
    // FIX: Use complete <img> tag for sad photo
    stickerHTML = '<img src="./images/gf_sad.png" alt="Sad Face" class="feedback-image">';
    message = `U don't love me :(((( Bhool gai sab tum. Sahi answer "${correctAnswer}" tha... try the next one!`;
    questionItem.style.backgroundColor = '#fce4ec';
    questionItem.dataset.answeredCorrectly = 'false';
  }

  // 3. Show the pop-up
  document.getElementById('feedback-sticker').innerHTML = stickerHTML;
  document.getElementById('feedback-message').textContent = message;

  const feedbackPopup = document.getElementById('feedback-popup');
  feedbackPopup.classList.remove('hidden');
  feedbackPopup.classList.add('visible');
}

function hideFeedback() {
  document.getElementById('feedback-popup').classList.add('hidden');
  document.getElementById('feedback-popup').classList.remove('visible');
}

function submitQuiz() {
  let correctCount = 0;
  const total = quizQuestions.length;
  const resultBox = document.getElementById('quiz-result');
  const questionItems = document.querySelectorAll('.question-item');

  questionItems.forEach(item => {
    if (item.dataset.answeredCorrectly === 'true') {
      correctCount++;
    }
  });

  if (document.querySelectorAll('.question-item[data-answered-correctly]').length < total) {
    alert("Please answer all questions before checking the score!");
    return;
  }

  // Display Final Score
  resultBox.classList.remove('hidden', 'result-correct', 'result-incorrect');

  if (correctCount === total) {
    resultBox.classList.add('result-correct');
    resultBox.innerHTML = `🌟 PERFECT SCORE! ${correctCount}/${total}! Bohot Badhiya Meri Chidkokli. I love you!`;
  } else if (correctCount > total / 2) {
    resultBox.classList.add('result-correct');
    resultBox.innerHTML = `💖 Theek Thak Performance! ${correctCount}/${total}! 1 galat kaise hua..!`;
  } else {
    resultBox.classList.add('result-incorrect');
    resultBox.innerHTML = ` Teri Tohhh! ${correctCount}/${total}. Tera toh aab game bajana padega! Play again!`;
  }
}

// ======================================================
// 5. ROMANTIC PHOTO PUZZLE LOGIC (Video Reward)
// ======================================================

const PUZZLE_SIZE = 9;
let puzzleState = [];
let selectedTile = null;
let moves = 0;
let isGameActive = false;

function initializePuzzle() {
  puzzleState = Array.from({ length: PUZZLE_SIZE }, (_, i) => i);
  shufflePuzzle();
  renderPuzzle();
  isGameActive = true;
  moves = 0;
  document.getElementById('move-count').textContent = moves;
  document.getElementById('puzzle-result').classList.add('hidden');
}

function shufflePuzzle() {
  puzzleState.sort(() => Math.random() - 0.5);
}

function renderPuzzle() {
  const board = document.getElementById('puzzle-board');
  board.innerHTML = '';

  puzzleState.forEach((originalIndex, currentIndex) => {
    const tile = document.createElement('div');
    tile.classList.add('puzzle-tile');
    tile.dataset.position = currentIndex;
    tile.dataset.original = originalIndex;

    const row = Math.floor(originalIndex / 3);
    const col = originalIndex % 3;

    // Uses the .jpeg format for the puzzle
    tile.style.backgroundImage = `url('./images/puzzle_photo.jpeg')`;
    tile.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;

    tile.onclick = () => handleTileClick(tile);
    board.appendChild(tile);
  });
}

function handleTileClick(tile) {
  if (!isGameActive) return;
  if (!selectedTile) {
    selectedTile = tile;
    tile.classList.add('selected');
  } else if (selectedTile === tile) {
    selectedTile.classList.remove('selected');
    selectedTile = null;
  } else {
    swapTiles(selectedTile, tile);
    selectedTile.classList.remove('selected');
    selectedTile = null;
    moves++;
    document.getElementById('move-count').textContent = moves;
    checkWin();
  }
}

function swapTiles(tile1, tile2) {
  const bg1 = tile1.style.backgroundPosition;
  tile1.style.backgroundPosition = tile2.style.backgroundPosition;
  tile2.style.backgroundPosition = bg1;

  const original1 = tile1.dataset.original;
  tile1.dataset.original = tile2.dataset.original;
  tile2.dataset.original = original1;
}

function checkWin() {
  const tiles = document.querySelectorAll('.puzzle-tile');
  let correctCount = 0;

  tiles.forEach(tile => {
    if (parseInt(tile.dataset.original) === parseInt(tile.dataset.position)) {
      correctCount++;
    }
  });

  if (correctCount === PUZZLE_SIZE) {
    isGameActive = false;

    const videoOverlay = document.getElementById('video-overlay');
    const puzzleResult = document.getElementById('puzzle-result');
    const videoPlayer = document.getElementById('local-surprise-video');

    puzzleResult.classList.remove('hidden');
    puzzleResult.classList.add('result-correct');
    puzzleResult.innerHTML = '💍 YaaaaY! PUZZLE SOLVED! Loading your surprise...';

    setTimeout(() => {
      videoOverlay.classList.remove('hidden');
      videoOverlay.classList.add('visible');

      // This attempts to play the video now that the overlay is visible
      videoPlayer.play().catch(error => {
        console.log("Autoplay was blocked. User will need to click play.");
      });
    }, 1500);
  }
}

function hideVideo() {
  const videoOverlay = document.getElementById('video-overlay');
  const videoPlayer = document.getElementById('local-surprise-video');

  if (videoPlayer) {
    videoPlayer.pause();
    videoPlayer.currentTime = 0; // Rewind the video
  }

  videoOverlay.classList.add('hidden');
  videoOverlay.classList.remove('visible');
}

function startGame() {
  initializePuzzle();
}

document.addEventListener('DOMContentLoaded', () => {
  loadQuiz();
  startGame();
});
