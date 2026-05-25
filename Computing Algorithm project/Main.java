import algorithms.*;
import java.util.*;
import models.*;

public class Main {
     public static void main(String[] args) {

        ArrayList<Stage> stages = new ArrayList<>();

        Stage stage1 = new Stage(1);
        stage1.addInvestment(new Investment("Startup A", 400, 700));
        stage1.addInvestment(new Investment("Startup B", 600, 900));

        Stage stage2 = new Stage(2);
        stage2.addInvestment(new Investment("Project C", 500, 1200));
        stage2.addInvestment(new Investment("Project D", 700, 1500));

        stages.add(stage1);
        stages.add(stage2);

        int initialBudget = 1000;

        GreedySolver greedySolver = new GreedySolver();
        MultiStageDP dpSolver = new MultiStageDP();
        BruteForceSolver bruteForceSolver = new BruteForceSolver();

        Result greedyResult = greedySolver.solve(stages, initialBudget);
        Result dpResult = dpSolver.solve(stages, initialBudget);
        Result bruteForceResult = bruteForceSolver.solve(stages, initialBudget);

        System.out.println("===== GREEDY =====");
        printResult(greedyResult);

        System.out.println("\n===== DP =====");
        printResult(dpResult);

        System.out.println("\n===== BRUTE FORCE =====");
        printResult(bruteForceResult);
    }

    public static void printResult(Result result) {

        System.out.println("Final Capital: " + result.getFinalCapital());
        System.out.println("Execution Time: " + result.getExecutionTime() + " ms");

        for (String project : result.getSelectedProjects()) {
            System.out.println(project);
        }
    }
}
