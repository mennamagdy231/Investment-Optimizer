# Multi-Stage Investment Optimizer

A Flask web app for **Project 13: Multi-Stage Investment Optimizer**.

## Requirement coverage

This version is built to match the full project brief:

- **Multi-Stage Dynamic Programming**
  - Treats stages as time periods and budget values as states.
  - Evaluates all feasible project subsets at every stage.
  - Builds a solution table and extracts the DP-optimal allocation path.
  - Displays the investment decision tree with state levels, decision edges, and the optimal path highlighted.

- **Greedy Highest Return Strategy**
  - Sorts projects by expected return per cost.
  - Funds projects greedily while the current stage budget allows it.
  - Shows why greedy can become suboptimal compared with DP.

- **0/1 Knapsack DP**
  - Solves each stage as a 0/1 knapsack problem.
  - Uses the current budget after previous-stage reinvestment.
  - Displays selected projects, total cost, maximum stage return, and next-stage budget.

- **Brute Force Enumeration**
  - Recursively evaluates all possible investment decision sequences for small cases.
  - Confirms that the DP result matches the brute-force optimum.
  - Displays a brute-force search tree with pruned branches annotated.
  - Shows a brute-force search log with evaluated and pruned sequences.

- **Expected Outputs**
  - Investment decision tree.
  - Portfolio allocation tables for DP and greedy.
  - Cumulative return chart comparing DP, greedy, knapsack, and brute force.
  - Sensitivity analysis from 50% to 200% of the base budget.
  - Brute-force tree and search log.

## How to run

```bash
pip install -r requirements.txt
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

## Notes

Brute force grows exponentially, so it is intended for small cases as required by the project brief.
