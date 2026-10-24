let currentPuzzle = 1;
let waitingForAI = false;


const puzzles = {

    1: {
        title: "Emergency Terminal",

        text: `
        There are three terminals in front of you.
        Only one of them is telling the truth.

        <div class="clues">
            <p><b>Terminal A:</b> "The exit is controlled by Terminal B."</p>
            <p><b>Terminal B:</b> "Terminal A is lying."</p>
            <p><b>Terminal C:</b> "I do not control the exit."</p>
        </div>

        Which terminal controls the exit?
        Explain your reasoning to EVA.
        `
    },

    2: {
        title: "Chemical Storage",

        text: `
        The next door leads into the chemical storage room.

        <div class="clues">
            <p>🔴 RED cannot be used with GREEN.</p>
            <p>🔵 BLUE is safe only when RED is not selected.</p>
            <p>🟢 The emergency system needs one safe container.</p>
        </div>

        Which container should you select?
        Explain your decision.
        `
    },

    3: {
        title: "Final Security Code",

        text: `
        You reach the final security terminal.

        <div class="clues">
            <p class="sequence">2 &nbsp; 6 &nbsp; 12 &nbsp; 20 &nbsp; 30 &nbsp; ?</p>
        </div>

        Find the next number and explain the pattern.
        `
    }
};


async function checkAnswer() {

    if (waitingForAI) {
        return;
    }

    let answer = document.getElementById("answer").value;
    let eva = document.getElementById("eva");

    if (answer.trim() === "") {
        eva.innerHTML = "EVA: Give me an answer first.";
        return;
    }

    waitingForAI = true;

    let submitButton = document.querySelector(
        'button[onclick="checkAnswer()"]'
    );

    submitButton.disabled = true;
    submitButton.innerText = "EVA IS THINKING...";

    eva.innerHTML = "EVA: Analysing your reasoning...";


    try {

        let response = await fetch(
            "http://127.0.0.1:5000/check-answer",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    answer: answer,
                    puzzle: currentPuzzle
                })
            }
        );


        let data = await response.json();

        eva.innerHTML = "EVA: " + data.response;


        if (data.correct) {

            if (currentPuzzle < 3) {

                setTimeout(function () {

                    currentPuzzle++;
                    loadPuzzle();

                }, 1800);

            }

            else {

                setTimeout(function () {

                    showEscapeScreen();

                }, 1800);
            }
        }

    }

    catch (error) {

        eva.innerHTML =
            "EVA: Connection error. Check the AI server.";
    }


    waitingForAI = false;

    submitButton.disabled = false;
    submitButton.innerText = "Submit Answer";
}


function loadPuzzle() {

    let puzzle = puzzles[currentPuzzle];

    document.querySelector(".puzzle-number").innerText =
        "Puzzle " + currentPuzzle + " of 3";

    document.querySelector(".puzzle h2").innerText =
        puzzle.title;

    let paragraphs = document.querySelectorAll(".puzzle > p");

    paragraphs[1].innerHTML = puzzle.text;

    document.getElementById("answer").value = "";

    document.getElementById("eva").innerHTML =
        "EVA: New security challenge loaded.";

    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
}


function showHint() {

    let eva = document.getElementById("eva");

    let hints = {

        1: "Test each statement and check whether only one remains true.",

        2: "Look for the choice that does not create a conflict with the safety rules.",

        3: "Look at the difference between each pair of numbers."
    };

    eva.innerHTML =
        "EVA: " + hints[currentPuzzle];
}


function showEscapeScreen() {

    document.querySelector(".puzzle").innerHTML = `

        <div class="escape-screen">

            <p class="puzzle-number">
                SECURITY OVERRIDE COMPLETE
            </p>

            <h2>LAB UNLOCKED </h2>

            <p>
                All security challenges have been solved.
            </p>

            <h1>YOU ESCAPED.</h1>

            <p>
                EVA: Human reasoning verified.
                Exit authorization granted.
            </p>

        </div>
    `;

    document.querySelector(".header p").innerText =
        "Room 01 - Unlocked ";
}