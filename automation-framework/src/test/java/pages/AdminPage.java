package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class AdminPage {

    WebDriver driver;

    By addStudentButton = By.xpath("//button[contains(text(),'Add Student')]");

    public AdminPage(WebDriver driver) {
        this.driver = driver;
    }

    public void clickAddStudent() {
        driver.findElement(addStudentButton).click();
    }
}