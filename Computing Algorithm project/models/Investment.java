package models;
public class Investment {
    private String name;
    private int cost;
    private int expectedReturn;

    public Investment(String name, int cost, int expectedReturn) {
        this.name = name;
        this.cost = cost;
        this.expectedReturn = expectedReturn;
    }

    public String getName() {
        return name;
    }

    public int getCost() {
        return cost;
    }

    public int getExpectedReturn() {
        return expectedReturn;
    }

    public double getROI() {
        return (double) expectedReturn / cost;
    }
}