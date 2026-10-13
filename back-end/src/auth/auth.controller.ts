import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:5173';

    const token = await this.authService.validateGoogleUser(req.user);

    return res.redirect(
      `${frontendUrl}/auth/callback?token=${encodeURIComponent(
        token.access_token,
      )}`,
    );
  }


  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) {
    return {
      id: req.user.id,
      name: req.user.nome,
      email: req.user.email,
    };
  }

  @Post('logout')
  logout() {
    return {
      message: 'Logout realizado com sucesso',
    };
  }
}