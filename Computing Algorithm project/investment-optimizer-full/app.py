from flask import Flask, render_template, request, jsonify
from algorithms.dp_solver import solve_dp
from algorithms.greedy_solver import solve_greedy
from algorithms.knapsack_solver import solve_knapsack_multistage
from algorithms.brute_force import solve_bruteforce
from algorithms.sensitivity import sensitivity_analysis

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/optimize", methods=["POST"])
def optimize():
    data = request.json or {}
    budget = int(data.get("budget", 0) or 0)
    stages = data.get("stages", [])

    dp_result = solve_dp(budget, stages)
    greedy_result = solve_greedy(budget, stages)
    brute_force_result = solve_bruteforce(budget, stages)
    knapsack_result = solve_knapsack_multistage(budget, stages)
    sensitivity_result = sensitivity_analysis(budget, stages)

    return jsonify({
        "dp": dp_result,
        "greedy": greedy_result,
        "bruteforce": brute_force_result,
        "knapsack": knapsack_result,
        "sensitivity": sensitivity_result
    })

if __name__ == "__main__":
    app.run(debug=True)
