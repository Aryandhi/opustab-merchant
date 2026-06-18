import { Page } from '@playwright/test';
import { DashboardLocators } from '../locators/dashboard.locator';

export class DashboardPage {
  private page: Page;
  private locators: DashboardLocators;

  constructor(page: Page) {
    this.page = page;
    this.locators = new DashboardLocators();
  }

  async isDashboardVisible() {
    return await this.page.isVisible(this.locators.titleMainDashboard);
  }
}