package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class StudentPage {

    WebDriver driver;

    By messageBox = By.className("message-box");

    public StudentPage(WebDriver driver) {
        this.driver = driver;
    }

    public boolean isMessageDisplayed() {
        return driver.findElement(messageBox).isDisplayed();
    }
}