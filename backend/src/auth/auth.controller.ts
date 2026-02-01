import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = body.email
      ? await this.auth.validateEmailLogin(body.email, body.password ?? '')
      : await this.auth.validatePinLogin(body.name ?? '', body.pin ?? '');

    const tokens = await this.auth.issueTokens(user.id, user.role, user.name);
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/auth/refresh',
    });
    return { accessToken: tokens.accessToken, user: { id: user.id, role: user.role, name: user.name } };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Body() body: RefreshDto, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token ?? body.refreshToken;
    if (!refreshToken || !body.userId) {
      return { accessToken: null };
    }
    const tokens = await this.auth.refreshTokens(body.userId, refreshToken);
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/auth/refresh',
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  async logout(@Body() body: RefreshDto, @Res({ passthrough: true }) res: Response) {
    if (body.userId) {
      await this.auth.revokeRefresh(body.userId);
    }
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return { ok: true };
  }
}
