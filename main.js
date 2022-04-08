const WORDS = 6;
const LETTERS = 5;
const COLORS = ['red', 'yellow', 'green'];
const WINNING_INDEX = COLORS.indexOf('green');

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
        if (letter.colorIndex != WINNING_INDEX){
            return false;
        }
    }
    
    return true;
}

function getNextWord(previousGuesses){
    const TEST_ORDER = ['cargo', 'brown', 'index', 'style', 'horse', 'mouse'];
    return TEST_ORDER[previousGuesses.length];
}

async function play(){
    let guesses = [];

    for (let i = 0; i < WORDS; i++){
        let guess = await tryWord(getNextWord(guesses), i);
        if (isWinningGuess(guess)){
            return alert('Victory!')
        }
        else{
            guesses.push(guess);
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

document.body.onload = () => {
    setup();
    play();
}