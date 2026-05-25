package algorithms;

import java.util.*;
import models.*;

public class KnapsackSolver {
    public ArrayList<Investment> solve(ArrayList<Investment> investments, int budget) {

        int n = investments.size();

        int[][] dp = new int[n + 1][budget + 1];

        for (int i = 1; i <= n; i++) {

            Investment current = investments.get(i - 1);

            for (int w = 0; w <= budget; w++) {

                if (current.getCost() <= w) {

                    dp[i][w] = Math.max(
                            dp[i - 1][w],
                            current.getExpectedReturn() +
                                    dp[i - 1][w - current.getCost()]
                    );

                } else {
                                    dp[i][w] = dp[i - 1][w];
                }
            }
        }

        ArrayList<Investment> selected = new ArrayList<>();

        int w = budget;

        for (int i = n; i > 0; i--) {

            if (dp[i][w] != dp[i - 1][w]) {

                Investment investment = investments.get(i - 1);

                selected.add(investment);

                w -= investment.getCost();
            }
        }

        return selected;
    }
}
