from algorithms.knapsack_solver import all_stage_allocations


def _option_label(allocation):
    return ", ".join(allocation["names"]) if allocation["names"] else "No investment"


def _safe_upper_budget(initial_budget, stages):
    """A conservative budget cap used only to list possible subsets for pruning.

    The budget can never grow by more than the sum of all positive returns.
    """

    total_positive_profit = 0
    for stage in stages:
        for project in stage:
            total_positive_profit += max(0, int(project.get("profit", 0) or 0))
    return int(initial_budget) + total_positive_profit


def solve_bruteforce(initial_budget, stages):
    """Brute-force recursion for small inputs.

    It explores every stage decision sequence, records the best final budget, and
    also records pruned branches where a project subset is impossible because it
    costs more than the current budget.
    """

    initial_budget = max(0, int(initial_budget))
    cap_budget = _safe_upper_budget(initial_budget, stages)
    stage_options = [all_stage_allocations(stage, cap_budget) for stage in stages]

    best_budget = initial_budget
    best_sequence = []
    best_cumulative_values = [initial_budget]
    logs = []
    tree_nodes = [{"id": "bf_0_0", "stage": 0, "budget": initial_budget, "label": f"Start: {initial_budget}"}]
    tree_edges = []
    optimal_node_ids = []
    optimal_edge_ids = []
    node_counter = 1
    edge_counter = 1

    def search(stage_index, budget, sequence, cumulative_values, parent_id):
        nonlocal best_budget, best_sequence, best_cumulative_values
        nonlocal node_counter, edge_counter

        if stage_index == len(stages):
            logs.append({
                "sequence": sequence[:],
                "budget": budget,
                "valid": True
            })

            if budget > best_budget:
                best_budget = budget
                best_sequence = sequence[:]
                best_cumulative_values = cumulative_values[:]
            return

        for allocation in stage_options[stage_index]:
            label = _option_label(allocation)
            next_node_id = f"bf_{stage_index + 1}_{node_counter}"
            node_counter += 1

            if allocation["cost"] > budget:
                tree_nodes.append({
                    "id": next_node_id,
                    "stage": stage_index + 1,
                    "budget": budget,
                    "label": f"Pruned: {label}",
                    "pruned": True,
                    "reason": f"Cost {allocation['cost']} exceeds current budget {budget}"
                })
                tree_edges.append({
                    "id": f"bfe_{edge_counter}",
                    "from": parent_id,
                    "to": next_node_id,
                    "label": label,
                    "cost": allocation["cost"],
                    "profit": allocation["profit"],
                    "pruned": True,
                    "reason": f"Cost {allocation['cost']} exceeds current budget {budget}"
                })
                edge_counter += 1
                logs.append({
                    "sequence": sequence + [label],
                    "budget": "PRUNED",
                    "valid": False,
                    "reason": f"Cost {allocation['cost']} exceeds current budget {budget}"
                })
                continue

            next_budget = budget - allocation["cost"] + allocation["profit"]
            tree_nodes.append({
                "id": next_node_id,
                "stage": stage_index + 1,
                "budget": next_budget,
                "label": f"{next_budget}"
            })
            tree_edges.append({
                "id": f"bfe_{edge_counter}",
                "from": parent_id,
                "to": next_node_id,
                "label": label,
                "cost": allocation["cost"],
                "profit": allocation["profit"],
                "next_budget": next_budget,
                "pruned": False
            })
            edge_counter += 1

            search(
                stage_index + 1,
                next_budget,
                sequence + [label],
                cumulative_values + [next_budget],
                next_node_id
            )

    search(0, initial_budget, [], [initial_budget], "bf_0_0")

    # Mark the first matching optimal path in the tree so the UI can highlight it.
    current_parent = "bf_0_0"
    optimal_node_ids.append(current_parent)
    for stage_index, decision in enumerate(best_sequence):
        matching_edge = None
        for edge in tree_edges:
            if edge["from"] == current_parent and edge["label"] == decision and not edge.get("pruned"):
                matching_edge = edge
                break
        if matching_edge is None:
            break
        optimal_edge_ids.append(matching_edge["id"])
        current_parent = matching_edge["to"]
        optimal_node_ids.append(current_parent)

    return {
        "best_budget": best_budget,
        "best_sequence": best_sequence,
        "logs": logs,
        "cumulative_values": best_cumulative_values,
        "search_tree": {
            "nodes": tree_nodes,
            "edges": tree_edges,
            "optimal_node_ids": optimal_node_ids,
            "optimal_edge_ids": optimal_edge_ids
        }
    }
