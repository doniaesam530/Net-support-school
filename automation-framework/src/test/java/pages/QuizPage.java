package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class QuizPage {

    WebDriver driver;

    By submitButton = By.xpath("//button[contains(text(),'Submit')]");

    public QuizPage(WebDriver driver) {
        this.driver = driver;
    }

    public void submitQuiz() {
        driver.findElement(submitButton).click();
    }
}