import javafx.application.Application;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.chart.LineChart;
import javafx.scene.chart.XYChart;
import javafx.scene.control.*;
import javafx.stage.Stage;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.SimpleIntegerProperty;
import javafx.beans.property.SimpleLongProperty;
import algorithms.*;
import models.*;

import java.util.ArrayList;

import javax.swing.table.TableColumn;
import javax.swing.text.TableView;

public class InvestmentGUI extends Application {
    
    @FXML
    private TextField budgetField;
    
    @FXML
    private LineChart<String, Number> profitChart;
    
    @FXML
    private TableView<ResultRow> resultTable;
    
    @FXML
    private TableColumn<ResultRow, String> algorithmColumn;
    
    @FXML
    private TableColumn<ResultRow, Integer> capitalColumn;
    
    @FXML
    private TableColumn<ResultRow, Long> timeColumn;
    
    @Override
    public void start(Stage primaryStage) throws Exception {
        // Load FXML
        FXMLLoader loader = new FXMLLoader(getClass().getResource("dashboard.fxml"));
        loader.setController(this);
        Parent root = loader.load();
        
        // Apply CSS
        Scene scene = new Scene(root);
        String css = getClass().getResource("styles.css").toExternalForm();
        if (css != null) {
            scene.getStylesheets().add(css);
        }
        
        primaryStage.setTitle("Multi-Stage Investment Optimizer - Project 13");
        primaryStage.setScene(scene);
        primaryStage.show();
    }
    
    @FXML
    public void initialize() {
        // Setup table columns
        algorithmColumn.setCellValueFactory(cellData -> 
            new SimpleStringProperty(cellData.getValue().getAlgorithm()));
        capitalColumn.setCellValueFactory(cellData -> 
            new SimpleObjectProperty<>(cellData.getValue().getFinalCapital()));
        timeColumn.setCellValueFactory(cellData -> 
            new SimpleObjectProperty<>(cellData.getValue().getExecutionTime()));
        // Set default budget
        budgetField.setText("1000");
    }
    
    @FXML
    public void runAlgorithms() {
        try {
            int initialBudget = Integer.parseInt(budgetField.getText());
            
            // Create test data
            ArrayList<models.Stage> stages = createTestStages();
            
            // Run algorithms
            GreedySolver greedySolver = new GreedySolver();
            MultiStageDP dpSolver = new MultiStageDP();
            BruteForceSolver bruteForceSolver = new BruteForceSolver();
            
            Result greedyResult = greedySolver.solve(stages, initialBudget);
            Result dpResult = dpSolver.solve(stages, initialBudget);
            Result bruteForceResult = bruteForceSolver.solve(stages, initialBudget);
            
            // Update table
            ObservableList<ResultRow> rows = FXCollections.observableArrayList();
            rows.add(new ResultRow("GREEDY", greedyResult.getFinalCapital(), greedyResult.getExecutionTime()));
            rows.add(new ResultRow("DP OPTIMAL", dpResult.getFinalCapital(), dpResult.getExecutionTime()));
            rows.add(new ResultRow("BRUTE FORCE", bruteForceResult.getFinalCapital(), bruteForceResult.getExecutionTime()));
            resultTable.setItems(rows);
            
            // Update chart
            updateChart(greedyResult, dpResult, bruteForceResult);
            
            // Show details in console
            System.out.println("===== GREEDY =====");
            printDetails(greedyResult);
            System.out.println("\n===== DP =====");
            printDetails(dpResult);
            System.out.println("\n===== BRUTE FORCE =====");
            printDetails(bruteForceResult);
            
        } catch (NumberFormatException e) {
            showAlert("Invalid Input", "Please enter a valid number for budget.");
        }
    }
    
    private ArrayList<models.Stage> createTestStages() {
        ArrayList<models.Stage> stages = new ArrayList<>();
        
        models.Stage stage1 = new models.Stage(1);
        stage1.addInvestment(new Investment("Startup A", 400, 700));
        stage1.addInvestment(new Investment("Startup B", 600, 900));
        
        models.Stage stage2 = new models.Stage(2);
        stage2.addInvestment(new Investment("Project C", 500, 1200));
        stage2.addInvestment(new Investment("Project D", 700, 1500));
        
        stages.add(stage1);
        stages.add(stage2);
        
        return stages;
    }
    
    private void updateChart(Result greedy, Result dp, Result bruteForce) {
        profitChart.getData().clear();
        
        // Greedy series
        XYChart.Series<String, Number> greedySeries = new XYChart.Series<>();
        greedySeries.setName("Greedy");
        greedySeries.getData().add(new XYChart.Data<>("Stage 0", 1000));
        greedySeries.getData().add(new XYChart.Data<>("Stage 1", 1500));
        greedySeries.getData().add(new XYChart.Data<>("Stage 2", greedy.getFinalCapital()));
        
        // DP series
        XYChart.Series<String, Number> dpSeries = new XYChart.Series<>();
        dpSeries.setName("DP Optimal");
        dpSeries.getData().add(new XYChart.Data<>("Stage 0", 1000));
        dpSeries.getData().add(new XYChart.Data<>("Stage 1", 1900));
        dpSeries.getData().add(new XYChart.Data<>("Stage 2", dp.getFinalCapital()));
        
        // Brute Force series
        XYChart.Series<String, Number> bruteSeries = new XYChart.Series<>();
        bruteSeries.setName("Brute Force");
        bruteSeries.getData().add(new XYChart.Data<>("Stage 0", 1000));
        bruteSeries.getData().add(new XYChart.Data<>("Stage 1", 1500));
        bruteSeries.getData().add(new XYChart.Data<>("Stage 2", bruteForce.getFinalCapital()));
        
        profitChart.getData().addAll(greedySeries, dpSeries, bruteSeries);
    }
    
    private void printDetails(Result result) {
        System.out.println("Final Capital: " + result.getFinalCapital());
        System.out.println("Execution Time: " + result.getExecutionTime() + " ms");
        for (String project : result.getSelectedProjects()) {
            System.out.println(project);
        }
    }
    
    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setContentText(message);
        alert.showAndWait();
    }
    
    public static void main(String[] args) {
        launch(args);
    }
    
    // Helper class for table data
    public static class ResultRow {
        private final String algorithm;
        private final int finalCapital;
        private final long executionTime;
        
        public ResultRow(String algorithm, int finalCapital, long executionTime) {
            this.algorithm = algorithm;
            this.finalCapital = finalCapital;
            this.executionTime = executionTime;
        }
        
        public String getAlgorithm() { return algorithm; }
        public int getFinalCapital() { return finalCapital; }
        public long getExecutionTime() { return executionTime; }
    }
}