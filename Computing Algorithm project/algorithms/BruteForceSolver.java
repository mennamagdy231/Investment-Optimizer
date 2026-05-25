package algorithms;

import java.util.*;
import models.*;

public class BruteForceSolver {
     private int bestCapital;

    public Result solve(ArrayList<Stage> stages, int initialBudget) {

        long start = System.currentTimeMillis();

        Result result = new Result();

        bestCapital = initialBudget;

        bruteForce(stages, 0, initialBudget);

        long end = System.currentTimeMillis();

        result.setFinalCapital(bestCapital);
        result.setExecutionTime(end - start);

        return result;
    }

    private void bruteForce(ArrayList<Stage> stages,
                            int stageIndex,
                            int currentBudget) {
    if (stageIndex >= stages.size()) {

            bestCapital = Math.max(bestCapital, currentBudget);
            return;
        }

        Stage stage = stages.get(stageIndex);

        for (Investment investment : stage.getInvestments()) {

            if (investment.getCost() <= currentBudget) {

                int newBudget = currentBudget
                        - investment.getCost()
                        + investment.getExpectedReturn();

                bruteForce(stages, stageIndex + 1, newBudget);
            }
        }

        bruteForce(stages, stageIndex + 1, currentBudget);
    }
}
