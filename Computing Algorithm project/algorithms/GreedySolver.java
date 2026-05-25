package algorithms;

import java.util.*;
import models.*;
public class GreedySolver {
    public Result solve(ArrayList<Stage> stages, int initialBudget) {

        long start = System.currentTimeMillis();

        Result result = new Result();

        int currentBudget = initialBudget;

        for (Stage stage : stages) {

            ArrayList<Investment> investments = stage.getInvestments();

            investments.sort((a, b) -> {
                return Double.compare(b.getROI(), a.getROI());
            });

            for (Investment investment : investments) {

                if (investment.getCost() <= currentBudget) {

                    currentBudget -= investment.getCost();
                    currentBudget += investment.getExpectedReturn();

                    result.addProject(
                            "Stage " + stage.getStageNumber() +
                            " -> " + investment.getName());
                    break;
                }
                }
        }

        long end = System.currentTimeMillis();

        result.setFinalCapital(currentBudget);
        result.setExecutionTime(end - start);

        return result;
    }
}
