package models;

import java.util.ArrayList;
public class Stage {

    private int stageNumber;
    private ArrayList<Investment> investments;

    public Stage(int stageNumber) {
        this.stageNumber = stageNumber;
        investments = new ArrayList<>();
    }

    public void addInvestment(Investment investment) {
        investments.add(investment);
    }

    public ArrayList<Investment> getInvestments() {
        return investments;
    }
    public int getStageNumber() {
        return stageNumber;
    }
}
