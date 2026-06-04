import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('top-books')
  getTopBooks() {
    return this.dashboardService.getTopBooks();
  }

  @Get('top-categories')
  getTopCategories() {
    return this.dashboardService.getTopCategories();
  }

  @Get('recent-borrows')
  getRecentBorrows() {
    return this.dashboardService.getRecentBorrows();
  }
}
