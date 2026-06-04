import { Body, Controller, Get, Post } from '@nestjs/common';

import { LoginDto } from './dto/login.dto';
import { Public } from './guards/jwt.guard';
import { AuthService } from './auth.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
