let stageCount = 0;
let returnChart = null;
let finalChart = null;
let sensitivityChart = null;

function addStage(){
    stageCount++;

    const div = document.createElement("div");
    div.className = "stage";
    div.id = `stage-${stageCount}`;

    div.innerHTML = `
        <h2>Stage ${stageCount}</h2>
        <div class="projects"></div>
        <button onclick="addProject(${stageCount})">Add Project</button>
    `;

    document.getElementById("stages").appendChild(div);
}

function addProject(stage, name = "", cost = "", profit = ""){
    const project = document.createElement("div");
    project.className = "project";

    project.innerHTML = `
        <input class="name" placeholder="Project Name" value="${name}">
        <input class="cost" type="number" placeholder="Cost" min="0" value="${cost}">
        <input class="profit" type="number" placeholder="Expected Return" min="0" value="${profit}">
    `;

    document.querySelector(`#stage-${stage} .projects`).appendChild(project);
}

function loadSampleData(){
    document.getElementById("budget").value = 5000;
    document.getElementById("stages").innerHTML = "";
    stageCount = 0;

    // Sample chosen so the greedy strategy can make a visible suboptimal choice.
    const sample = [
        [
            {name:"Solar Upgrade", cost:2000, profit:2800},
            {name:"Inventory Expansion", cost:3000, profit:3900},
            {name:"Marketing Push", cost:1500, profit:2100}
        ],
        [
            {name:"AI Automation", cost:3500, profit:5200},
            {name:"New Branch", cost:4000, profit:5600},
            {name:"Training Program", cost:1200, profit:1700}
        ],
        [
            {name:"Export Deal", cost:4500, profit:7000},
            {name:"Online Platform", cost:2500, profit:3600},
            {name:"Maintenance", cost:1000, profit:1250}
        ]
    ];

    for(let i = 0; i < sample.length; i++){
        addStage();
        for(const project of sample[i]){
            addProject(stageCount, project.name, project.cost, project.profit);
        }
    }
}

function safeNumber(value){
    const number = parseInt(value, 10);
    return Number.isFinite(number) ? number : 0;
}

function collectData(){
    const budget = safeNumber(document.getElementById("budget").value);
    const stages = [];

    for(let i = 1; i <= stageCount; i++){
        const stageProjects = [];

        document.querySelectorAll(`#stage-${i} .project`).forEach((project, index) => {
            const name = project.querySelector(".name").value.trim() || `Stage ${i} Project ${index + 1}`;
            const cost = safeNumber(project.querySelector(".cost").value);
            const profit = safeNumber(project.querySelector(".profit").value);

            if(cost > 0 || profit > 0){
                stageProjects.push({name, cost, profit});
            }
        });

        stages.push(stageProjects);
    }

    return {budget, stages};
}

function money(value){
    return Number(value || 0).toLocaleString();
}

function projectNames(row){
    if(!row || !row.project_names){
        return "No investment";
    }
    return row.project_names.join(", ");
}

function allocationTable(title, allocation){
    const rows = allocation.map(row => `
        <tr>
            <td>${row.stage}</td>
            <td>${money(row.start_budget)}</td>
            <td>${projectNames(row)}</td>
            <td>${money(row.invested)}</td>
            <td>${money(row.expected_return)}</td>
            <td>${money(row.next_budget)}</td>
        </tr>
    `).join("");

    return `
        <h2>${title}</h2>
        <table>
            <thead>
                <tr>
                    <th>Stage</th>
                    <th>Start Budget</th>
                    <th>Funded Projects</th>
                    <th>Invested</th>
                    <th>Expected Return</th>
                    <th>Next Budget</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function knapsackTable(knapsack){
    const rows = knapsack.allocation.map(row => `
        <tr>
            <td>${row.stage}</td>
            <td>${money(row.start_budget)}</td>
            <td>${row.project_names.join(", ")}</td>
            <td>${money(row.total_cost)}</td>
            <td>${money(row.total_profit)}</td>
            <td>${money(row.next_budget)}</td>
        </tr>
    `).join("");

    return `
        <h2>0/1 Knapsack DP Output by Stage</h2>
        <p>Each stage is solved as a 0/1 knapsack problem using the current budget after previous returns are reinvested.</p>
        <table>
            <thead>
                <tr>
                    <th>Stage</th>
                    <th>Start Budget</th>
                    <th>Selected Projects</th>
                    <th>Total Cost</th>
                    <th>Max Stage Return</th>
                    <th>Budget After Stage</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function sensitivityTable(sensitivity){
    const rows = sensitivity.results.map(row => `
        <tr>
            <td>${row.factor}</td>
            <td>${money(row.budget)}</td>
            <td>${money(row.dp)}</td>
            <td>${money(row.greedy)}</td>
            <td>${money(row.gap)}</td>
            <td>${row.greedy_suboptimal ? '<span class="badge warning">Suboptimal</span>' : '<span class="badge">OK</span>'}</td>
        </tr>
    `).join("");

    const firstGap = sensitivity.first_greedy_suboptimal_budget === null
        ? "Greedy did not become suboptimal in the tested range."
        : `Greedy first becomes suboptimal at budget ${money(sensitivity.first_greedy_suboptimal_budget)}.`;

    return `
        <h2>Sensitivity Analysis</h2>
        <p>${firstGap}</p>
        <table>
            <thead>
                <tr>
                    <th>Budget Factor</th>
                    <th>Initial Budget</th>
                    <th>DP Final</th>
                    <th>Greedy Final</th>
                    <th>DP - Greedy Gap</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function bruteForceLogTable(bruteforce){
    const preview = bruteforce.logs.slice(0, 100);
    const rows = preview.map((row, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${row.sequence.length ? row.sequence.join(" → ") : "No full sequence"}</td>
            <td>${row.valid ? money(row.budget) : row.budget}</td>
            <td>${row.reason || "Evaluated full sequence"}</td>
        </tr>
    `).join("");

    const note = bruteforce.logs.length > preview.length
        ? `<p>Showing first ${preview.length} of ${bruteforce.logs.length} evaluated/pruned sequences.</p>`
        : `<p>Showing all ${bruteforce.logs.length} evaluated/pruned sequences.</p>`;

    return `
        <h2>Brute-Force Search Log</h2>
        <p>Best sequence: ${bruteforce.best_sequence.join(" → ") || "No investment"}</p>
        ${note}
        <div class="log-box">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Decision Sequence</th>
                        <th>Final Budget</th>
                        <th>Status / Pruning Reason</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

function decisionTree(dp){
    const optimalBudgets = new Set((dp.allocation || []).map(row => `${row.stage}:${row.next_budget}`));
    if(dp.allocation && dp.allocation.length){
        optimalBudgets.add(`0:${dp.allocation[0].start_budget}`);
    }

    const grouped = {};
    for(const node of dp.decision_tree.nodes){
        const key = node.stage;
        if(!grouped[key]) grouped[key] = new Set();
        grouped[key].add(node.budget);
    }

    const stagesHtml = Object.keys(grouped).sort((a,b) => Number(a) - Number(b)).map(stage => {
        const nodes = Array.from(grouped[stage]).sort((a,b) => a - b).map(budget => {
            const isOptimal = optimalBudgets.has(`${stage}:${budget}`);
            return `<div class="tree-node ${isOptimal ? "optimal" : ""}">Stage ${stage}<br>Budget: ${money(budget)}</div>`;
        }).join("");

        return `<h3>Level ${stage}</h3><div class="tree-stage">${nodes}</div>`;
    }).join("");

    const optimalIds = new Set(dp.decision_tree.optimal_edge_ids || []);
    const edgeRows = dp.decision_tree.edges.slice(0, 120).map(edge => `
        <tr>
            <td>${edge.from}</td>
            <td>${edge.to}</td>
            <td>${edge.label}</td>
            <td>${money(edge.invested)}</td>
            <td>${money(edge.expected_return)}</td>
            <td>${optimalIds.has(edge.id) ? '<span class="badge">DP optimal edge</span>' : 'Alternative state transition'}</td>
        </tr>
    `).join("");

    const note = dp.decision_tree.edges.length > 120
        ? `<p>Showing first 120 of ${dp.decision_tree.edges.length} decision edges.</p>`
        : `<p>Showing all ${dp.decision_tree.edges.length} decision edges.</p>`;

    return `
        <h2>Investment Decision Tree</h2>
        <p>Stages are shown as levels and budget amounts are states. Green-highlighted nodes and labeled edges show the DP-optimal path, while other nodes/edges show alternative transitions considered by the algorithm.</p>
        ${stagesHtml}
        ${note}
        <div class="log-box">
            <table>
                <thead>
                    <tr>
                        <th>From State</th>
                        <th>To State</th>
                        <th>Decision Edge</th>
                        <th>Invested</th>
                        <th>Return</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>${edgeRows}</tbody>
            </table>
        </div>
    `;
}

function bruteForceTree(bruteforce){
    const tree = bruteforce.search_tree;
    if(!tree || !tree.nodes || !tree.nodes.length){
        return "";
    }

    const optimalNodeIds = new Set(tree.optimal_node_ids || []);
    const grouped = {};
    for(const node of tree.nodes){
        const key = node.stage;
        if(!grouped[key]) grouped[key] = [];
        grouped[key].push(node);
    }

    const stagesHtml = Object.keys(grouped).sort((a,b) => Number(a) - Number(b)).map(stage => {
        const nodes = grouped[stage].slice(0, 40).map(node => {
            const classes = ["tree-node"];
            if(optimalNodeIds.has(node.id)) classes.push("optimal");
            if(node.pruned) classes.push("pruned");
            const reason = node.reason ? `<small>${node.reason}</small>` : "";
            return `<div class="${classes.join(" ")}">Stage ${stage}<br>Budget: ${money(node.budget)}<br>${node.pruned ? '<span class="badge warning">Pruned</span>' : ''}${reason}</div>`;
        }).join("");
        const extra = grouped[stage].length > 40 ? `<p>Showing first 40 of ${grouped[stage].length} nodes at this level.</p>` : "";
        return `<h3>Brute-Force Level ${stage}</h3>${extra}<div class="tree-stage">${nodes}</div>`;
    }).join("");

    const optimalEdgeIds = new Set(tree.optimal_edge_ids || []);
    const edgeRows = tree.edges.slice(0, 140).map(edge => `
        <tr>
            <td>${edge.from}</td>
            <td>${edge.to}</td>
            <td>${edge.label}</td>
            <td>${money(edge.cost)}</td>
            <td>${money(edge.profit)}</td>
            <td>${edge.pruned ? `<span class="badge warning">Pruned</span> ${edge.reason}` : (optimalEdgeIds.has(edge.id) ? '<span class="badge">Best path</span>' : 'Evaluated')}</td>
        </tr>
    `).join("");

    const note = tree.edges.length > 140
        ? `<p>Showing first 140 of ${tree.edges.length} brute-force branches.</p>`
        : `<p>Showing all ${tree.edges.length} brute-force branches.</p>`;

    return `
        <h2>Brute-Force Search Tree with Pruned Branches</h2>
        <p>This tree displays the exhaustive brute-force recursion. Red branches are pruned because the project subset cost is larger than the current budget. Green branches represent the best sequence found.</p>
        ${stagesHtml}
        ${note}
        <div class="log-box">
            <table>
                <thead>
                    <tr>
                        <th>From Node</th>
                        <th>To Node</th>
                        <th>Decision Branch</th>
                        <th>Cost</th>
                        <th>Return</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>${edgeRows}</tbody>
            </table>
        </div>
    `;
}

function renderCharts(result){
    const labels = result.dp.cumulative_values.map((_, index) => `Stage ${index}`);

    if(returnChart) returnChart.destroy();
    if(finalChart) finalChart.destroy();
    if(sensitivityChart) sensitivityChart.destroy();

    returnChart = new Chart(document.getElementById("returnChart"), {
        type:"line",
        data:{
            labels,
            datasets:[
                {label:"DP", data:result.dp.cumulative_values},
                {label:"Greedy", data:result.greedy.cumulative_values},
                {label:"0/1 Knapsack", data:result.knapsack.cumulative_values},
                {label:"Brute Force", data:result.bruteforce.cumulative_values}
            ]
        },
        options:{
            responsive:true,
            plugins:{title:{display:true,text:"Cumulative Return by Stage"}}
        }
    });

    finalChart = new Chart(document.getElementById("finalChart"), {
        type:"bar",
        data:{
            labels:["DP","Greedy","0/1 Knapsack","Brute Force"],
            datasets:[{
                label:"Final Budget",
                data:[result.dp.final_budget, result.greedy.final_budget, result.knapsack.final_budget, result.bruteforce.best_budget]
            }]
        },
        options:{
            responsive:true,
            plugins:{title:{display:true,text:"Final Budget Comparison"}}
        }
    });

    sensitivityChart = new Chart(document.getElementById("sensitivityChart"), {
        type:"line",
        data:{
            labels:result.sensitivity.results.map(row => `${row.factor}x`),
            datasets:[
                {label:"DP", data:result.sensitivity.results.map(row => row.dp)},
                {label:"Greedy", data:result.sensitivity.results.map(row => row.greedy)}
            ]
        },
        options:{
            responsive:true,
            plugins:{title:{display:true,text:"Sensitivity Analysis: DP vs Greedy"}}
        }
    });
}

async function runOptimization(){
    const data = collectData();

    if(data.stages.length === 0){
        alert("Please add at least one stage.");
        return;
    }

    const response = await fetch("/optimize",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data)
    });

    const result = await response.json();

    const dpMatchesBruteForce = result.dp.final_budget === result.bruteforce.best_budget;

    document.getElementById("results").classList.remove("hidden");
    document.getElementById("charts-area").classList.remove("hidden");

    document.getElementById("results").innerHTML = `
        <div class="summary-grid">
            <div class="metric"><span>DP Final Budget</span><strong>${money(result.dp.final_budget)}</strong></div>
            <div class="metric"><span>Greedy Final Budget</span><strong>${money(result.greedy.final_budget)}</strong></div>
            <div class="metric"><span>0/1 Knapsack Final</span><strong>${money(result.knapsack.final_budget)}</strong></div>
            <div class="metric"><span>Brute Force Best</span><strong>${money(result.bruteforce.best_budget)}</strong></div>
        </div>

        <p>${dpMatchesBruteForce
            ? '<span class="badge">Confirmed: DP matches brute-force optimum</span>'
            : '<span class="badge warning">Warning: DP does not match brute force for this input</span>'}
        </p>

        ${decisionTree(result.dp)}
        ${allocationTable("DP Portfolio Allocation Table", result.dp.allocation)}
        ${allocationTable("Greedy Portfolio Allocation Table", result.greedy.allocation)}
        ${knapsackTable(result.knapsack)}
        ${sensitivityTable(result.sensitivity)}
        ${bruteForceTree(result.bruteforce)}
        ${bruteForceLogTable(result.bruteforce)}
    `;

    renderCharts(result);
}

window.onload = loadSampleData;
