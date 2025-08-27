<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios';

const imageUrl = ref('')
const correctBreed = ref('')
const score = ref(0)
const feedback = ref('')
const options = ref([])
const timer = ref(300)
const gameOver = ref(false)
const playerName = ref('')
const highscores = ref([])
const highscoreSaved = ref(false)
let allBreeds = []
let intervalId = null
const buttonsDisabled = ref(false)
const API_URL = '/.netlify/functions/highscores';

async function fetchAllBreeds() {
  const res = await fetch('https://dog.ceo/api/breeds/list/all')
  const data = await res.json()
  allBreeds = Object.keys(data.message)
}

function getRandomOptions(correct) {
  const breeds = allBreeds.filter(b => b !== correct)
  const randomBreeds = []
  while (randomBreeds.length < 3 && breeds.length > 0) {
    const idx = Math.floor(Math.random() * breeds.length)
    randomBreeds.push(breeds.splice(idx, 1)[0])
  }
  const choices = [...randomBreeds, correct]
  // Shuffle
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[choices[i], choices[j]] = [choices[j], choices[i]]
  }
  return choices
}

async function fetchDog() {
  feedback.value = ''
  buttonsDisabled.value = true;
  const res = await fetch('https://dog.ceo/api/breeds/image/random')
  const data = await res.json()
  imageUrl.value = data.message
  // Extract breed from URL
  const match = imageUrl.value.match(/breeds\/([a-zA-Z0-9-]+)\//)
  correctBreed.value = match ? match[1].replace('-', ' ') : ''
  // Set options
  options.value = getRandomOptions(correctBreed.value.replace(' ', '-'))
  buttonsDisabled.value = false;
}

function startTimer() {
  timer.value = 300
  gameOver.value = false
  intervalId = setInterval(() => {
    timer.value--
    if (timer.value <= 0) {
      gameOver.value = true
      clearInterval(intervalId)
    }
  }, 1000)
}

async function startGame() {
  await fetchAllBreeds()
  await fetchDog()
  startTimer()
}

function checkGuess(selected) {
  if (gameOver.value || buttonsDisabled.value) return
  buttonsDisabled.value = true;
  if (selected === correctBreed.value.replace(' ', '-')) {
    score.value++
    feedback.value = 'Correct!'
    setTimeout(fetchDog, 1200)
  } else {
    feedback.value = `Wrong! The correct answer was: ${correctBreed.value}`
    setTimeout(fetchDog, 3000)
  }
}

async function loadHighscores() {
  try {
    const res = await axios.get(API_URL);
    highscores.value = res.data;
  } catch (err) {
    highscores.value = [];
  }
}

async function saveHighscore() {
  if (!playerName.value.trim()) return;
  try {
    await axios.post(API_URL, {
      name: playerName.value.trim(),
      score: score.value
    });
    highscoreSaved.value = true;
    await loadHighscores();
  } catch (err) {
    // handle error
  }
}

onMounted(() => {
  startGame();
  loadHighscores();
})
onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="game-container">
    <h1 class="dog-title">🐾 Name The Dog Breed! 🐾</h1>
    <div class="timer">Time Left: {{ timer }}s</div>
    <div v-if="gameOver">
      <div class="game-over">Game Over!</div>
      <div class="final-score">Final Score: {{ score }}</div>
      <form v-if="!highscoreSaved" class="highscore-form" @submit.prevent="saveHighscore">
        <label for="name">Your Name:</label>
        <input id="name" v-model="playerName" placeholder="Dog lover name" />
        <button type="submit" class="save-btn">Save Score</button>
      </form>
      <div v-if="highscoreSaved" class="highscore-list">
        <h2>Highscores</h2>
        <ul>
          <li v-for="hs in highscores" :key="hs.name + hs.score">
            <span class="dog-icon">🐶</span> {{ hs.name }}: {{ hs.score }}
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <div v-if="imageUrl">
        <img :src="imageUrl" alt="Random dog" class="dog-img" />
      </div>
      <div v-if="options.length">
        <div class="options-row">
          <button v-for="opt in options" :key="opt" @click="checkGuess(opt)" :disabled="gameOver || buttonsDisabled" class="dog-btn">
            {{ opt.replace('-', ' ') }}
          </button>
        </div>
      </div>
      <div class="feedback">{{ feedback }}</div>
      <div class="score">Score: {{ score }}</div>
    </div>
  </div>
</template>

<style scoped>
body {
  background: repeating-linear-gradient(135deg, #f7e9d7 0px, #f7e9d7 40px, #ffe4b5 40px, #ffe4b5 80px);
}
.game-container {
  max-width: 420px;
  margin: 2rem auto;
  text-align: center;
  background: rgba(255, 245, 230, 0.95);
  border-radius: 24px;
  box-shadow: 0 0 24px #e2c9a5;
  padding: 2rem 1rem 2rem 1rem;
  position: relative;
}
.dog-title {
  font-family: 'Comic Sans MS', 'Comic Sans', cursive;
  color: #a0522d;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
}
.dog-img {
  max-width: 100%;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 12px #d2b48c;
}
.options-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.dog-btn {
  background: linear-gradient(90deg, #ffda9e 0%, #ffe4b5 100%);
  color: #6b4226;
  border: 2px solid #d2b48c;
  border-radius: 32px;
  font-size: 1.1rem;
  font-family: 'Comic Sans MS', 'Comic Sans', cursive;
  padding: 0.75rem 2.5rem;
  box-shadow: 0 2px 8px #e2c9a5;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.dog-btn:hover:not(:disabled) {
  background: #ffe4b5;
  transform: scale(1.07);
}
.dog-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.feedback {
  margin: 1rem 0;
  font-weight: bold;
  color: #a0522d;
  font-size: 1.1rem;
}
.score {
  font-size: 1.2rem;
  margin-top: 1rem;
  color: #6b4226;
}
.timer {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: bold;
  color: #a0522d;
}
.game-over {
  font-size: 1.5rem;
  color: #c00;
  margin-bottom: 1rem;
}
.final-score {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #6b4226;
}
.highscore-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.highscore-form input {
  padding: 0.5rem;
  border-radius: 16px;
  border: 1px solid #d2b48c;
  font-size: 1rem;
  font-family: 'Comic Sans MS', 'Comic Sans', cursive;
}
.save-btn {
  background: #ffda9e;
  color: #6b4226;
  border: 2px solid #d2b48c;
  border-radius: 24px;
  font-size: 1rem;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  font-family: 'Comic Sans MS', 'Comic Sans', cursive;
  margin-top: 0.5rem;
 	box-shadow: 0 2px 8px #e2c9a5;
  transition: background 0.2s, transform 0.2s;
}
.save-btn:hover {
  background: #ffe4b5;
  transform: scale(1.07);
}
.highscore-list {
  margin-top: 1rem;
  text-align: left;
}
.highscore-list h2 {
  color: #a0522d;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
.highscore-list ul {
  list-style: none;
  padding: 0;
}
.highscore-list li {
  font-size: 1rem;
  color: #6b4226;
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
}
.dog-icon {
  margin-right: 0.5rem;
}
</style>
