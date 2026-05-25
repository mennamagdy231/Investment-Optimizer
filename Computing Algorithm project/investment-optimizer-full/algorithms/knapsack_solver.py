def _clean_projects(projects):
    clean_projects = []

    for project in projects:
        cost = int(project.get("cost", 0) or 0)
        profit = int(project.get("profit", 0) or 0)
        name = project.get("name") or "Unnamed Project"
        if cost >= 0 and profit >= 0:
            clean_projects.append({"name": name, "cost": cost, "profit": profit})

    return clean_projects


def knapsack_stage(budget, projects):
    """Solve one investment stage as a 0/1 knapsack problem.

    Weight = investment cost.
    Value = expected return/profit.
    Every project can be selected at most once.
    """

    budget = max(0, int(budget))
    clean_projects = _clean_projects(projects)

    n = len(clean_projects)
    dp = [[0 for _ in range(budget + 1)] for _ in range(n + 1)]

    for i in range(1, n + 1):
        cost = clean_projects[i - 1]["cost"]
        profit = clean_projects[i - 1]["profit"]

        for w in range(budget + 1):
            without_item = dp[i - 1][w]
            with_item = -1

            if cost <= w:
                with_item = profit + dp[i - 1][w - cost]

            dp[i][w] = max(without_item, with_item)

    selected = []
    remaining = budget

    for i in range(n, 0, -1):
        if dp[i][remaining] != dp[i - 1][remaining]:
            project = clean_projects[i - 1]
            selected.append(project)
            remaining -= project["cost"]

    selected.reverse()

    total_cost = sum(project["cost"] for project in selected)
    total_profit = sum(project["profit"] for project in selected)

    return {
        "start_budget": budget,
        "max_profit": dp[n][budget],
        "selected_projects": selected,
        "project_names": [project["name"] for project in selected] if selected else ["No investment"],
        "total_cost": total_cost,
        "total_profit": total_profit,
        "next_budget": budget - total_cost + total_profit,
        "dp_table": dp
    }


def solve_knapsack_multistage(initial_budget, stages):
    """Run 0/1 knapsack sequentially across all stages.

    This satisfies the project requirement that each stage is a knapsack problem
    using the current budget available after previous-stage returns are reinvested.
    """

    budget = max(0, int(initial_budget))
    allocation = []
    cumulative_values = [budget]

    for stage_index, stage in enumerate(stages):
        result = knapsack_stage(budget, stage)
        budget = result["next_budget"]

        allocation.append({
            "stage": stage_index + 1,
            "start_budget": result["start_budget"],
            "selected_projects": result["selected_projects"],
            "project_names": result["project_names"],
            "total_cost": result["total_cost"],
            "total_profit": result["total_profit"],
            "next_budget": result["next_budget"],
            "max_profit": result["max_profit"]
        })
        cumulative_values.append(budget)

    return {
        "final_budget": budget,
        "allocation": allocation,
        "cumulative_values": cumulative_values
    }


def all_stage_allocations(projects, budget):
    """Return every feasible 0/1 project subset for a single stage."""

    budget = max(0, int(budget))
    clean_projects = _clean_projects(projects)

    allocations = [{
        "projects": [],
        "names": ["No investment"],
        "cost": 0,
        "profit": 0,
        "roi": 0
    }]

    n = len(clean_projects)

    for mask in range(1, 1 << n):
        chosen = []
        total_cost = 0
        total_profit = 0

        for i in range(n):
            if mask & (1 << i):
                project = clean_projects[i]
                chosen.append(project)
                total_cost += project["cost"]
                total_profit += project["profit"]

        if total_cost <= budget:
            allocations.append({
                "projects": chosen,
                "names": [project["name"] for project in chosen],
                "cost": total_cost,
                "profit": total_profit,
                "roi": round(total_profit / total_cost, 4) if total_cost else 0
            })

    return allocations
