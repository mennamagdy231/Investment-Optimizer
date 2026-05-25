package algorithms;

import java.util.*;
import models.*;

public class MultiStageDP {
    private KnapsackSolver knapsackSolver;

    public MultiStageDP() {
        knapsackSolver = new KnapsackSolver();
    }

    public Result solve(ArrayList<Stage> stages, int initialBudget) {

        long start = System.currentTimeMillis();

        Result result = new Result();

        int currentBudget = initialBudget;

        for (Stage stage : stages) {

            ArrayList<Investment> selected = knapsackSolver.solve(
                    stage.getInvestments(),
                    currentBudget
            );

            for (Investment investment : selected) {

                currentBudget -= investment.getCost();
                currentBudget += investment.getExpectedReturn();

                result.addProject(
                        "Stage " + stage.getStageNumber() +
                        " -> " + investment.getName()
                );
            }
        }

        long end = System.currentTimeMillis();

        result.setFinalCapital(currentBudget);
        result.setExecutionTime(end - start);

        return result;
    }
}
