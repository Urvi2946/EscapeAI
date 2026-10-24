from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)


puzzles = {
    1: {
        "question": """
Terminal A says: The exit is controlled by Terminal B.
Terminal B says: Terminal A is lying.
Terminal C says: I do not control the exit.

Only ONE terminal is telling the truth.
Which terminal controls the exit?
""",
        "solution": """
Terminal C controls the exit.
The player's reasoning should be logically consistent
with the condition that only one statement is true.
"""
    },

    2: {
        "question": """
Three chemical containers are labelled RED, BLUE and GREEN.

A warning on the wall says:

RED cannot be used with GREEN.
BLUE is safe only when RED is not selected.
The emergency system requires the container that can
be safely selected without creating a conflict.

Which container should be selected?
""",
        "solution": """
GREEN should be selected.
The player should explain why their choice avoids
the conflicts described by the rules.
"""
    },

    3: {
        "question": """
The final security terminal displays this sequence:

2, 6, 12, 20, 30, ?

Find the next number and explain the pattern.
""",
        "solution": """
The answer is 42.

The differences are:
4, 6, 8, 10 and then 12.

It can also be understood as:
1x2, 2x3, 3x4, 4x5, 5x6, therefore 6x7 = 42.
"""
    }
}


@app.route("/check-answer", methods=["POST"])
def check_answer():

    data = request.get_json()

    player_answer = data.get("answer", "")
    puzzle_number = data.get("puzzle", 1)

    if puzzle_number not in puzzles:
        return jsonify({
            "response": "Unknown puzzle.",
            "correct": False
        })

    puzzle = puzzles[puzzle_number]

    prompt = f"""
You are EVA, the AI security system of an escape room.

PUZZLE:
{puzzle["question"]}

EXPECTED SOLUTION:
{puzzle["solution"]}

PLAYER ANSWER:
{player_answer}

Evaluate whether the player's answer and reasoning
show that they understand the puzzle.

Rules:

1. Judge the meaning, not exact wording.
2. Accept different valid explanations.
3. Do not reveal the complete solution if they are wrong.
4. If correct, begin exactly with CORRECT:
5. If incorrect, begin exactly with INCORRECT:
6. Give a short contextual hint when incorrect.
7. Keep the response below 50 words.
8. Speak like EVA, an AI security system.
"""

    try:

        interaction = client.interactions.create(
            model="gemma-4-26b-a4b-it",
            input=prompt
        )

        ai_response = interaction.output_text

        is_correct = ai_response.strip().upper().startswith("CORRECT:")

        return jsonify({
            "response": ai_response,
            "correct": is_correct
        })

    except Exception as error:

        print("Gemma error:", error)

        return jsonify({
            "response": "AI connection failed.",
            "correct": False
        }), 500


if __name__ == "__main__":
    app.run(debug=True)