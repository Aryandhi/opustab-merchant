import {Page} from "@playwright/test";
import {LoginLocators} from "../locators/login.locator";
import testData from "../data/users.json";

export class LoginPage {
    private page: Page;
    private locators: LoginLocators;

    constructor(page: Page) {
        this.page = page;
        this.locators = new LoginLocators();
    }

    async gotoLoginPage(path: string = '/') {
        await this.page.goto(path);
    }

    async login(email: string, password: string) {
        await this.page.fill(this.locators.inputEmail, email);
        await this.page.fill(this.locators.inputPassword, password);
        await this.page.click(this.locators.buttonLogin);
    }

    async loginWithValidCredentials() {
        const { validUser } = testData;
        await this.login(validUser.email, validUser.password);
    }

    async isDashboardDisplayed() {
        return await this.page.isVisible(this.locators.titleMainDashboard);
    }
}

