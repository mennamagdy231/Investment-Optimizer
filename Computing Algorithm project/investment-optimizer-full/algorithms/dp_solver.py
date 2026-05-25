from algorithms.knapsack_solver import all_stage_allocations


def solve_dp(initial_budget, stages):
    """Multi-stage dynamic programming solver.

    State: available budget at the start of a stage.
    Transition: choose a feasible project subset for that stage.
    Objective: maximize final budget after all stages.
    """

    initial_budget = int(initial_budget)
    states = {initial_budget: {
        "final_budget": initial_budget,
        "allocation": [],
        "cumulative_values": [initial_budget],
        "path_budgets": [initial_budget]
    }}

    solution_table = []
    tree_nodes = [{"id": "s0_b%s" % initial_budget, "stage": 0, "budget": initial_budget}]
    tree_edges = []
    optimal_edge_ids = []

    for stage_index, stage_projects in enumerate(stages):
        next_states = {}
        table_rows = []

        for budget, state in states.items():
            allocations = all_stage_allocations(stage_projects, budget)

            for allocation in allocations:
                next_budget = budget - allocation["cost"] + allocation["profit"]
                edge_id = "s%s_b%s_to_s%s_b%s_%s" % (
                    stage_index,
                    budget,
                    stage_index + 1,
                    next_budget,
                    len(tree_edges)
                )

                table_rows.append({
                    "stage": stage_index + 1,
                    "current_budget": budget,
                    "decision": ", ".join(allocation["names"]),
                    "invested": allocation["cost"],
                    "expected_return": allocation["profit"],
                    "next_budget": next_budget
                })

                tree_nodes.append({
                    "id": "s%s_b%s" % (stage_index + 1, next_budget),
                    "stage": stage_index + 1,
                    "budget": next_budget
                })
                tree_edges.append({
                    "id": edge_id,
                    "from": "s%s_b%s" % (stage_index, budget),
                    "to": "s%s_b%s" % (stage_index + 1, next_budget),
                    "label": ", ".join(allocation["names"]),
                    "invested": allocation["cost"],
                    "expected_return": allocation["profit"]
                })

                candidate = {
                    "final_budget": next_budget,
                    "allocation": state["allocation"] + [{
                        "stage": stage_index + 1,
                        "projects": allocation["projects"],
                        "project_names": allocation["names"],
                        "start_budget": budget,
                        "invested": allocation["cost"],
                        "expected_return": allocation["profit"],
                        "next_budget": next_budget
                    }],
                    "cumulative_values": state["cumulative_values"] + [next_budget],
                    "path_budgets": state["path_budgets"] + [next_budget]
                }

                if (
                    next_budget not in next_states or
                    candidate["final_budget"] > next_states[next_budget]["final_budget"]
                ):
                    next_states[next_budget] = candidate

        solution_table.append({
            "stage": stage_index + 1,
            "rows": table_rows
        })
        states = next_states

    if not states:
        return {
            "final_budget": initial_budget,
            "path": [],
            "allocation": [],
            "cumulative_values": [initial_budget],
            "solution_table": solution_table,
            "decision_tree": {"nodes": tree_nodes, "edges": tree_edges, "optimal_edge_ids": []}
        }

    best_state = max(states.values(), key=lambda item: item["final_budget"])
    path = []

    for allocation in best_state["allocation"]:
        path.extend(allocation["project_names"])

    for i in range(len(best_state["path_budgets"]) - 1):
        start_budget = best_state["path_budgets"][i]
        end_budget = best_state["path_budgets"][i + 1]
        stage = i
        for edge in tree_edges:
            if edge["from"] == "s%s_b%s" % (stage, start_budget) and edge["to"] == "s%s_b%s" % (stage + 1, end_budget):
                optimal_edge_ids.append(edge["id"])
                break

    return {
        "final_budget": best_state["final_budget"],
        "path": path,
        "allocation": best_state["allocation"],
        "cumulative_values": best_state["cumulative_values"],
        "solution_table": solution_table,
        "decision_tree": {
            "nodes": tree_nodes,
            "edges": tree_edges,
            "optimal_edge_ids": optimal_edge_ids
        }
    }
