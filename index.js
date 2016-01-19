/**
 * This program is a timed word game.
 * The objective of the game, is to correctly guess 
 * the jumbled words that appear on the screen. 
 */

var time = 180;       // Time (in seconds) of each round
var correct = 0;      // Number of correct answers
var highscore = 0;    // High score

var answerArr = [];   // Random word (array)
var answer = "";      // Random word
var guess = "";       // User's guess
var mapArr = [];      // Index map of the jumbled word
var jumbledArr = [];  // Jumbled word (array)
var jumbled = [];     // Jumbled word

var hintState = 0;    // Determines which hint you are on
var prev = 0;         // Keeps track of the previous wrong message

var timer = setInterval();  // Timer object

/**
 * The following method is shorthand for
 * returning a reference to an element by its ID.
 * The 4 methods following it are for showing/hiding elements. 
 * These were created based on their frequent usage in this code.
 */
function getEl(elid) {
  return document.getElementById(elid);
}

function showDiv(aDiv) {
  getEl(aDiv).style.display = "block";
}

function hideDiv(aDiv) {
  getEl(aDiv).style.display = "none";
}

function divVis(aDiv) {
  getEl(aDiv).style.visibility = "visible";
}

function divHide(aDiv) {
  getEl(aDiv).style.visibility = "hidden";
}

// Performs a countdown to the start of the game
function goToCount() {
  // Hides the front page
  hideDiv('tagline');
  hideDiv('startbtn');
  hideDiv('maintext');
  // Hides the results screen (if played through at least once)
  hideDiv('results');
  // Shows the countdown
  showDiv('countbox');
  getEl('countbox').innerHTML='Ready?';
  // Counts down 3 seconds, then calls 'loadMain'
  countDown(3,'countbox',loadMain);
}

// Countdown method (higher order function) 
// that invokes a callback after the count runs out
function countDown(remaining, box, callback) {
  timer = setInterval(function(){
    getEl(box).innerHTML=remaining;
    if (remaining==10) {
      getEl(box).style.color="yellow";
    }
    if (remaining<1) {
      clearInterval(timer);
      callback();
    }
    remaining--;
  },1000);    // 1000 millisecond interval
}

// Loads the beginning of the game
function loadMain() {
  hideDiv('countbox');
  // Initializes the score from previous round
  getEl('correctbox').innerHTML=0;
  getEl('highscorebox').innerHTML=highscore;
  showDiv('inforow');
  showDiv('gamebox');
  showDiv('inputbox');
  divVis('bottombtns');
  // Game timer counts down
  getEl('timerbox').innerHTML="GO!";
  countDown(time,'timerbox',endRound);
  // Retrieves a new word
  getWord();
}

// Method to initialize a new word retrieval
function getWord() {
  divHide('wrongmsg');
  hideDiv('defbox');
  // Calls a new word
  newWord();
  // Resets the "hint state" for the new word
  hintState = 0;
  needHint(hintState);
  // Displays new word
  getEl('gamebox').innerHTML=jumbled;
  getEl('user_id').value = '';
  getEl('user_id').focus();
}

// Generates a new random word
function newWord() {
  // Stores the random word
  answer = randomWord();
  // Stores each letter of "answer" to an element of an array
  answerArr = answer.split("");
  // Generates a jumbled "map" of the word
  mapArr = jumbleMap(answerArr);
  // Maps the word to their jumbled indices
  jumbledArr = jumbleWord(answerArr, mapArr);
  // Makes a string out of the "jumbledArr" to log to screen
  jumbled = jumbledArr.join("");
}

// Loads end of round screen when the time runs down
function endRound(){
  hideDiv('inforow');
  hideDiv('gamebox');
  hideDiv('inputbox');
  divHide('wrongmsg');
  divHide('bottombtns');
  hideDiv('defbox');
  getEl('timerbox').style.color="white";
  // Displays the last answer and your score for the round
  showDiv('results');
  showDiv('startbtn');
  getEl('lastanswer').innerHTML=answer;
  getEl('lastscore').innerHTML=correct;
  // Reset the score
  correct = 0;
}

// Quits the round after clicking on the "Quit" button
function quitRound() {
  clearInterval(timer);
  endRound();
}

/**
 * Checks the user's guess against the correct "answer".
 * If correct, it updates the score (for the round), 
 * as well as the high score if you match it. 
 * If guessed incorrectly, it will prompt the user 
 * 
 */
function checkGuess() {
  // Stores the user's guess to "guess"
  guess = getEl('form1').elements['userguess'].value;
  // If the "guess" matches the "answer"
  if (guess === answer) {
    // Increment "correct" score by 1 and display on screen
    correct++;
    getEl('correctbox').innerHTML = correct;
    // Updates highest score if score is higher
    if (correct > highscore) {
      highscore = correct;
      getEl('highscorebox').innerHTML = highscore;
    }
    // Gets another word
    getWord();
  }
  // If the "guess" does NOT match the "answer"
  else {
    // Tells user that the "guess" was incorrect
    if (getEl('wrongmsg').style.visibility === "hidden") {
      divVis('wrongmsg');
    }
    getEl('wrongmsg').innerHTML = randWrong();
  }
  // Clears the textbox after each guess
  getEl('user_id').value = '';
  return false;
}

// Pulls random "wrong" prompts. Non-repeated
function randWrong() {
  var wrong = [
    "Wrong guess!",
    "Nope, that wasn't it!",
    "Want to try a hint?",
    "Sorry, that's not the correct word!",
    "Try again!",
    "Did you leave your CAPSLOCK key on?"
  ];
  do {
    var i = Math.floor(Math.random()*wrong.length);
  }  
  while (i==prev);
  prev = i;
  return wrong[i];
}

// Makes an API request to Wordnik's Random Word API
function queryDict(req) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET",req,false);
  xhr.send();
  var wordObj = JSON.parse(xhr.responseText);
  return wordObj;
}

// Queries random words
function randomWord() {
  var request = "http://api.wordnik.com:80/v4/words.json/randomWord?minCorpusCount=1000&minDictionaryCount=20&minLength=4&maxLength=8&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";
  return queryDict(request).word.toLowerCase();
}

// Gets the definition of "word"
function getDef(word) {
  var request = "http://api.wordnik.com:80/v4/word.json/"+word+"/definitions?limit=1&sourceDictionaries=ahd&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";
  return queryDict(request)[0].text;
}

// Uses the "jumbleMap" method (below) to jumble the answer
function jumbleWord(wordArr, mapArray) {
  var textArr = [];
  for (var i in wordArr) {
    textArr[i] = wordArr[mapArray[i]];
  }
  return textArr;
}

// Creates a mapping array (index mapping array) 
function jumbleMap(wordArr) {
  var jumbArr = seqArr(wordArr);
  jumbArr = jumbleIndex(jumbArr);
  return jumbArr;
}

// Creates a sequential number array
// with the same length as the argument array, "anArr"
function seqArr(anArr) {
  var someArr = [];
  var i = 0;
  while (i<anArr.length) {
    someArr[i] = i;
    i++;
  }
  return someArr;
}

/**
 * Jumbles the indices of the answer "anArr",
 * and returns an array that maps the jumbled word 
 * to the correct answer.
 * 
 * For example, if the answer is "fumbled", 
 * and the jumbled answer is "lbudemf",
 * the returned array would be [4,3,1,6,5,2,0].
 */
function jumbleIndex(anArr) {
  for (var i = anArr.length-1; i >=0; i--) {
    var randIndex = Math.floor(Math.random()*(i+1)); 
    // Shuffle indices of answer
    var temp = anArr[randIndex]; 
    anArr[randIndex] = anArr[i]; 
    anArr[i] = temp;
  }
  return anArr;
}

/**
 * When the player gets stuck and needs a hint, 
 * this will capitalize the first letter of the answer
 * within the jumbled word. 
 */
function capital(wordToCap, capArr) {
  var top = capArr.indexOf(0);
  wordToCap[top] = wordToCap[top].toUpperCase();
  return wordToCap;
}

// Checks the state of hints (how many hints have been used
// for the current word), and calls one of the hints
function needHint(hint) {
  switch (hint) {
    case 0:
      zeroHint();
      break;
    case 1:
      firstHint();
      break;
    case 2:
      secondHint();
      break;
  }
}

// Initial state (no hints)
function zeroHint() {
  changeHint('hint_btn0','Hint #1','firstHint()');
}

// First hint state: capitalizes first letter of correct answer
function firstHint() {
  hintState = 1;
  divHide('wrongmsg');
  changeHint('hint_btn1','Hint #2','secondHint()');
  jumbled = capital(jumbledArr, mapArr).join("");
  getEl('gamebox').innerHTML = jumbled;
  getEl('user_id').focus();
}

// Second hint state: shows definition of the word
function secondHint() {
  hintState = 2;
  divHide('wrongmsg');
  changeHint('hint_btn2','No more hints!','');
  showDiv('defbox');
  var def = getDef(answer);
  // Some definitions have usage examples, which contain
  // the actual word in it. This removes the example portion.
  var indexColon = def.indexOf(":");
  getEl('defbox').innerHTML = def.slice(0,indexColon);
  getEl('user_id').focus();
}

// Dynamicaly changes the hint button's interface 
// and onclick functionality
function changeHint(classChange, innerText, callback) {
  getEl('hintbtn').className = classChange;
  getEl('hintbtn').innerHTML = innerText;
  getEl('hintbtn').setAttribute('onclick',callback);
}
