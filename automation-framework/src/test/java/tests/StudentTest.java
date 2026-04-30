package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.StudentPage;

public class StudentTest extends BaseTest {

    @Test
    public void studentReceivesBroadcastMessage() {

        StudentPage studentPage = new StudentPage(driver);

        Assert.assertTrue(studentPage.isMessageDisplayed());
    }
}