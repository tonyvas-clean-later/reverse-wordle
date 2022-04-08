const DICTIONNARY = [];
const WORDS_FILE = 'words-5.txt';
const WORDS = 6;
const LETTERS = 5;
const COLORS = ['red', 'yellow', 'green'];
const RED_INDEX = 0;
const YELLOW_INDEX = 1;
const GREEN_INDEX = 2;

function handleLetter(letter, element){
    let guessLetter = {
        letter: letter,
        colorIndex: null
    }
    
    element.disabled = false;
    element.innerHTML = letter.toUpperCase()
    element.onclick = () => {
        if (guessLetter.colorIndex !== null){
            element.classList.remove(COLORS[guessLetter.colorIndex]);
            guessLetter.colorIndex = (guessLetter.colorIndex + 1) % COLORS.length;
        }
        else{
            guessLetter.colorIndex = 0;
        }

        element.classList.add(COLORS[guessLetter.colorIndex]);
    }

    return guessLetter
}

function handleSubmit(guessWord){
    return new Promise((resolve, reject) => {
        let submit = document.getElementsByClassName('submit')[0];
        submit.disabled = false;
        submit.onclick = () => {
            for (let guessLetter of guessWord){
                if (guessLetter.colorIndex === null){
                    let msg = 'Finish coloring the guess!'
                    console.warn(msg);
                    alert(msg)
                    return;
                }
            }

            submit.onclick = null;
            submit.disabled = true;
            resolve();
        }
    })
}

function tryWord(word, index){
    return new Promise((resolve, reject) => {
        let guessWord = [];
        let wordElem = document.getElementsByClassName('word')[index];

        for (let i = 0; i < wordElem.children.length; i++){
            let guessLetter = handleLetter(word[i], wordElem.children[i]);
            guessWord.push(guessLetter);
        }

        handleSubmit(guessWord).then((res) => {
            for (let letterElem of wordElem.children){
                letterElem.disabled = true;
            }

            resolve(guessWord);
        }).catch(err => {
            console.error(err);
        })
    })
}

function isWinningGuess(guess){
    for (let letter of guess){
        if (letter.colorIndex != GREEN_INDEX){
            return false;
        }
    }

    return true;
}

function getGuessedLetters(results){
    let letters = [ [], [], [] ];

    for (let usedWord in results){
        let result = results[usedWord]
        for (let i = 0; i < result.length; i++){
            let {letter, colorIndex} = result[i];

            let exists = false;
            for (let item of letters[colorIndex]){
                if (colorIndex == RED_INDEX){
                    if (item == letter){
                        exists = true;
                        break;
                    }
                }
                else{
                    if (item.letter == letter && item.index == i){
                        exists = true;
                        break;
                    }
                }
            }

            if (!exists){
                if (colorIndex == RED_INDEX){
                    letters[colorIndex].push(letter);
                }
                else{
                    letters[colorIndex].push({letter: letter, index: i});
                }
            }
        }
    }

    return letters;
}

function testWordRed(word, reds){
    for (let red of reds){
        if (word.includes(red)){
            return false
        }
    }

    return true;
}

function testWordYellow(word, yellows){
    for (let yellow of yellows){
        let i = word.indexOf(yellow.letter);
        if (i < 0 || yellow.index == i){
            return false
        }
    }

    return true;
}

function testWordGreen(word, greens){
    for (let green of greens){
        if (word[green.index] != green.letter){
            return false;
        }
    }
    return true;
}

function getNextWord(results){
    let usedWords = Object.keys(results);

    if (usedWords.length > 0){
        let guessedLetters = getGuessedLetters(results);
        let reds = guessedLetters[RED_INDEX];
        let yellows = guessedLetters[YELLOW_INDEX];
        let greens = guessedLetters[GREEN_INDEX];

        let availableWords = [];
        for (let word of DICTIONNARY){
            if (!usedWords.includes(word)){
                if (testWordGreen(word, greens)){
                    if (testWordYellow(word, yellows)){
                        if (testWordRed(word, reds)){
                            availableWords.push(word);
                        }
                    }
                }
            }
        }

        if (availableWords.length > 0){
            return availableWords[Math.floor(Math.random() * availableWords.length)]
        }
        else{
            return null;
        }

    }
    else{
        return DICTIONNARY[Math.floor(Math.random() * DICTIONNARY.length)];
    }
}

async function play(){
    let results = {};

    for (let i = 0; i < WORDS; i++){
        showLoading();
        let word = getNextWord(results)
        hideLoading();
        
        if (word){
            let result = await tryWord(word, i);
            if (isWinningGuess(result)){
                return alert('Victory!')
            }
            else{
                results[word] = result;
            }
        }
        else{
            let correct = prompt('Defeat!\nWhat was your word?');
            if (correct){
                if (DICTIONNARY.indexOf(correct) < 0){
                    alert('I do not know this word!');
                }
                else{
                    alert('I somehow missed this word!')
                }
            }

            return;
        }
    }
}

function setup(){
    let main = document.getElementsByTagName('main')[0];
    for (let w = 0; w < WORDS; w++){
        let word = document.createElement('div');
        word.classList.add('word');

        for (let l = 0; l < LETTERS; l++){
            let letter = document.createElement('button');
            letter.classList.add('letter')
            letter.disabled = true

            word.appendChild(letter)
        }

        main.appendChild(word)
    }

    let submit = document.createElement('button');
    submit.classList.add('submit')
    submit.disabled = true;
    submit.innerHTML = 'Submit';
    main.appendChild(submit)
}

function getDictionnary(){
    return new Promise((resolve, reject) => {
        const URL = `/${WORDS_FILE}`;
        fetch(URL).then(res => res.text()).then(words => {
            resolve(words.trim().split('\n'));
        }).catch(reject);
    })
}

function showLoading(){
    document.getElementById('loading_screen').style.display = 'block';
    document.getElementById('game_screen').style.opacity = 0.3
}

function hideLoading(){
    document.getElementById('loading_screen').style.display = 'none';
    document.getElementById('game_screen').style.opacity = 1
}

document.body.onload = () => {
    showLoading();

    Promise.all([
        setup(),
        getDictionnary().then(dict => {
            for (let word of dict){
                DICTIONNARY.push(word);
            }
        })
    ]).then(() => {
        hideLoading();
        play();
    }).catch(err => {
        console.error(err);
    })
}