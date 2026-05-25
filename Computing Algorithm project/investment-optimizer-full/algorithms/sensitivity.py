from algorithms.dp_solver import solve_dp
from algorithms.greedy_solver import solve_greedy


def sensitivity_analysis(initial_budget, stages):
    results = []
    first_greedy_gap_budget = None

    for factor in [0.5, 0.75, 1, 1.25, 1.5, 2]:
        budget = max(0, int(initial_budget * factor))

        dp = solve_dp(budget, stages)
        greedy = solve_greedy(budget, stages)
        gap = dp["final_budget"] - greedy["final_budget"]

        if gap > 0 and first_greedy_gap_budget is None:
            first_greedy_gap_budget = budget

        results.append({
            "factor": factor,
            "budget": budget,
            "dp": dp["final_budget"],
            "greedy": greedy["final_budget"],
            "gap": gap,
            "greedy_suboptimal": gap > 0
        })

    return {
        "results": results,
        "first_greedy_suboptimal_budget": first_greedy_gap_budget
    }
