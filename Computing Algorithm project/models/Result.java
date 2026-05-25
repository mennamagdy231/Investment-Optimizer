package models;
import java.util.ArrayList;

public class Result {
    private int finalCapital;
    private long executionTime;
    private ArrayList<String> selectedProjects;

    public Result() {
        selectedProjects = new ArrayList<>();
    }

    public int getFinalCapital() {
        return finalCapital;
    }

    public void setFinalCapital(int finalCapital) {
        this.finalCapital = finalCapital;
    }

    public long getExecutionTime() {
        return executionTime;
    }

    public void setExecutionTime(long executionTime) {
        this.executionTime = executionTime;
    }
    public ArrayList<String> getSelectedProjects() {
        return selectedProjects;
    }

    public void addProject(String project) {
        selectedProjects.add(project);
    }
}
