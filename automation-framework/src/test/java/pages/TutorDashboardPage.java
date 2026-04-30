package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class TutorDashboardPage {

    WebDriver driver;

    By broadcastButton =     By.xpath("//button[contains(.,'Broadcast')]");

    By lockButton =    By.xpath("//button[contains(.,'Lock')]");

    By chatTab = By.xpath("//button[contains(.,'Chat')]");

    public TutorDashboardPage(WebDriver driver) {
        this.driver = driver;
    }

    public void clickBroadcast() {
        driver.findElement(broadcastButton).click();
    }

    public void clickLockStudents() {
        driver.findElement(lockButton).click();
    }

    public void openChat() {
        driver.findElement(chatTab).click();
    }
}