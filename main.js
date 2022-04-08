// Array to hold a list of all valid words
const DICTIONNARY = [];
// File containing dictionnary
const WORDS_FILE = 'words-5.txt';
// Number of attempts
const WORDS = 6;
// Number of letters per word
const LETTERS = 5;
// Letter colors and indexes
const COLORS = ['red', 'yellow', 'green'];
const RED_INDEX = 0;
const YELLOW_INDEX = 1;
const GREEN_INDEX = 2;

// Handles a letter button element
// Takes a letter character, button element and optionally a starting color
function handleLetter(letter, element, startColorIndex = null){
    // Object for holding the guess result
    let guessLetter = {
        letter: letter,
        colorIndex: startColorIndex
    }
    
    // Set letter text
    element.innerHTML = letter.toUpperCase()

    // If starting color not set, enable clicking
    if (!startColorIndex){
        element.disabled = false;
        element.onclick = () => {
            // If color already set, cycle to the next in the array
            if (guessLetter.colorIndex !== null){
                // Remove current color class
                element.classList.remove(COLORS[guessLetter.colorIndex]);
                // Rotate color
                guessLetter.colorIndex = (guessLetter.colorIndex + 1) % COLORS.length;
            }
            else{
                // If not set, set to 0
                guessLetter.colorIndex = 0;
            }

            // Add color class to element
            element.classList.add(COLORS[guessLetter.colorIndex]);
        }
    }
    else{
        element.classList.add(COLORS[startColorIndex]);
    }

    return guessLetter
}

// Handle submit button
// Takes the guessed letter results
function handleSubmit(guessWord){
    return new Promise((resolve, reject) => {
        // Get HTML element
        let submit = document.getElementsByClassName('submit')[0];
        // Enable clicking
        submit.disabled = false;

        submit.onclick = () => {
            // Verify all letters were colored
            for (let guessLetter of guessWord){
                if (guessLetter.colorIndex === null){
                    let msg = 'Finish coloring the guess!'
                    console.warn(msg);
                    alert(msg)
                    return;
                }
            }

            // Disable submit button and resolve
            submit.onclick = null;
            submit.disabled = true;
            resolve();
        }
    })
}

// Tries to guess the word
// Takes the current guess word, the word index, and starting colors
function tryWord(word, index, startColors){
    return new Promise((resolve, reject) => {
        // Results for the guess
        let guessWord = [];
        // HTML Element for the word
        let wordElem = document.getElementsByClassName('word')[index];

        // Attach handler to letters in word
        for (let i = 0; i < wordElem.children.length; i++){
            let guessLetter = handleLetter(word[i], wordElem.children[i], startColors[i]);
            guessWord.push(guessLetter);
        }

        // Attach submit handler
        handleSubmit(guessWord).then((res) => {
            // On success disable clicking letters
            for (let letterElem of wordElem.children){
                letterElem.disabled = true;
            }

            // Resolve with guess results
            resolve(guessWord);
        }).catch(err => {
            console.error(err);
        })
    })
}

// Checks if guess was correct
// Takes a guess
function isWinningGuess(guess){
    // Check if all letters are green
    for (let letter of guess){
        if (letter.colorIndex != GREEN_INDEX){
            return false;
        }
    }

    return true;
}

// Gets letters based on previous guess colors
function getGuessedLetters(results){
    let letters = [ [], [], [] ];

    // Loop over each guess
    for (let usedWord in results){
        let result = results[usedWord]
        // Loop over each letter in guessed word
        for (let i = 0; i < result.length; i++){
            let {letter, colorIndex} = result[i];

            // Check if letter has already been added
            let exists = false;
            for (let item of letters[colorIndex]){
                // If red, just check the letter
                if (colorIndex == RED_INDEX){
                    if (item == letter){
                        exists = true;
                        break;
                    }
                }
                // If yellow or green, also compare index
                else{
                    if (item.letter == letter && item.index == i){
                        exists = true;
                        break;
                    }
                }
            }

            // If not added yet, add letter
            if (!exists){
                if (colorIndex == RED_INDEX){
                    // If red, just add letter
                    letters[colorIndex].push(letter);
                }
                else{
                    // If yellow or green, add letter and index
                    letters[colorIndex].push({letter: letter, index: i});
                }
            }
        }
    }

    return letters;
}

// Tests a word against red letters
// Takes a word to test and red letters
function testWordRed(word, reds){
    // Loop over every red letter
    for (let red of reds){
        // check if word contains red letter
        if (word.includes(red)){
            return false
        }
    }

    return true;
}

// Tests a word against yellow letters
// Takes a word to test and yellow letters
function testWordYellow(word, yellows){
    // Loop over every yellow letter
    for (let yellow of yellows){
        // Make sure letter is somewhere in the word, but not at the index
        let i = word.indexOf(yellow.letter);
        if (i < 0 || yellow.index == i){
            return false
        }
    }

    return true;
}

// Tests a word against green letters
// Takes a word to test and green letters
function testWordGreen(word, greens){
    // Loop over every green letter
    for (let green of greens){
        // Check if green letter is in word at the index
        if (word[green.index] != green.letter){
            return false;
        }
    }
    return true;
}

// Gets next guess word based on previous guesses
// Takes the results of previous guessed
function getNextWord(results){
    // Get the previous used words
    let usedWords = Object.keys(results);

    if (usedWords.length > 0){
        // If previous guesses were made, get letters based on color from guesses
        let guessedLetters = getGuessedLetters(results);
        let reds = guessedLetters[RED_INDEX];
        let yellows = guessedLetters[YELLOW_INDEX];
        let greens = guessedLetters[GREEN_INDEX];

        let availableWords = [];
        // Loop over every word in dictionnary and check if it works with results from previous guesses
        for (let word of DICTIONNARY){
            // Make sure same word wasnt used before
            if (!usedWords.includes(word)){
                // Test green, yellow and then red
                if (testWordGreen(word, greens)){
                    if (testWordYellow(word, yellows)){
                        if (testWordRed(word, reds)){
                            // If all works, word is available
                            availableWords.push(word);
                        }
                    }
                }
            }
        }

        // If there are available words
        if (availableWords.length > 0){
            // Return random word
            return availableWords[Math.floor(Math.random() * availableWords.length)]
        }
        else{
            return null;
        }

    }
    else{
        // Return random letter if no guessed were made
        return DICTIONNARY[Math.floor(Math.random() * DICTIONNARY.length)];
    }
}

function getWordStartingColorsIndexes(word, results){
    let greens = getGuessedLetters(results)[GREEN_INDEX];

    let colorIndexes = [];
    for (let i = 0; i < word.length; i++){
        let colorIndex = null;
        let letter = word[i];

        for (let green of greens){
            if (letter == green.letter){
                colorIndex = GREEN_INDEX;
            }
        }

        colorIndexes.push(colorIndex);
    }

    return colorIndexes;
}

// Plays game
// Guesses a word and waits for user to color it
async function play(){
    // Results from previous guesses
    let results = {};

    // Loop for however many attempts are available
    for (let i = 0; i < WORDS; i++){
        showLoading();
        // Get next word based on previous results
        let word = getNextWord(results)
        hideLoading();

        // Check if a word to guess is available
        if (word){
            // If so, try the word and await results
            let colors = getWordStartingColorsIndexes(word, results);
            let result = await tryWord(word, i, colors);

            if (isWinningGuess(result)){
                // If guess was correct, declare victory
                return alert('Victory!')
            }
            else{
                // If not, save results and try next attempt
                results[word] = result;
            }
        }
        else{
            // If no available word to guess, break out of the loop
            break;
        }
    }

    // If broken out, ask user what was the correct word
    let correct = prompt('Defeat!\nWhat was your word?');
    if (correct){
        // Check if word is in dictionnary
        if (DICTIONNARY.indexOf(correct) < 0){
            alert('I do not know this word!');
        }
        else{
            alert('I somehow missed this word!')
        }
    }

    return;
}

// Setup the game screen
// Sets up the words and letter buttons
function setup(){
    let main = document.getElementsByTagName('main')[0];
    // Loop for however many word attempts there are
    for (let w = 0; w < WORDS; w++){
        // Create word div
        let word = document.createElement('div');
        word.classList.add('word');

        // Loop over however many letters in each word
        for (let l = 0; l < LETTERS; l++){
            // Create letter button
            let letter = document.createElement('button');
            letter.classList.add('letter')
            letter.disabled = true

            word.appendChild(letter)
        }

        main.appendChild(word)
    }

    // Create submit button
    let submit = document.createElement('button');
    submit.classList.add('submit')
    submit.disabled = true;
    submit.innerHTML = 'Submit';
    main.appendChild(submit)
}

// Get list of words from file
function getDictionnary(){
    return new Promise((resolve, reject) => {
        const URL = `/${WORDS_FILE}`;
        // Fetch word file
        fetch(URL).then(res => res.text()).then(words => {
            // Split text into array
            resolve(words.trim().split('\n'));
        }).catch(reject);
    })
}

// Shows loading screen
function showLoading(){
    document.getElementById('loading_screen').style.display = 'block';
    document.getElementById('game_screen').style.opacity = 0.3
}

// Hides loading screen
function hideLoading(){
    document.getElementById('loading_screen').style.display = 'none';
    document.getElementById('game_screen').style.opacity = 1
}

document.body.onload = () => {
    showLoading();

    // Starts setups
    Promise.all([
        setup(),
        getDictionnary().then(dict => {
            for (let word of dict){
                DICTIONNARY.push(word);
            }
        })
    ]).then(() => {
        hideLoading();
        // When done, start game
        play();
    }).catch(err => {
        console.error(err);
    })
}