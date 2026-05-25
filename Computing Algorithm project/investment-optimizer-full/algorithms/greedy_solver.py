def solve_greedy(initial_budget, stages):
    """Greedy highest-return-per-cost strategy.

    At each stage, projects are sorted by ROI. The algorithm funds projects in
    that order while the stage budget allows it.
    """

    budget = int(initial_budget)
    path = []
    allocation = []
    cumulative_values = [budget]

    for stage_index, stage in enumerate(stages):
        projects = []

        for project in stage:
            cost = int(project.get("cost", 0) or 0)
            profit = int(project.get("profit", 0) or 0)
            name = project.get("name") or "Unnamed Project"
            if cost >= 0 and profit >= 0:
                projects.append({"name": name, "cost": cost, "profit": profit})

        projects.sort(key=lambda item: item["profit"] / item["cost"] if item["cost"] else 0, reverse=True)

        start_budget = budget
        invested = 0
        expected_return = 0
        selected = []

        for project in projects:
            if project["cost"] <= budget:
                budget -= project["cost"]
                invested += project["cost"]
                expected_return += project["profit"]
                selected.append(project)
                path.append(project["name"])

        budget += expected_return

        allocation.append({
            "stage": stage_index + 1,
            "projects": selected,
            "project_names": [project["name"] for project in selected] if selected else ["No investment"],
            "start_budget": start_budget,
            "invested": invested,
            "expected_return": expected_return,
            "next_budget": budget
        })
        cumulative_values.append(budget)

    return {
        "final_budget": budget,
        "path": path,
        "allocation": allocation,
        "cumulative_values": cumulative_values
    }
