import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const password = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name.trim(),
      email,
      password,
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.generateToken(user);
  }

  async loginWithGoogle(profile: {
    googleId: string;
    email?: string;
    name: string;
    avatar?: string | null;
  }) {
    if (!profile.email) {
      throw new UnauthorizedException(
        'O Google não retornou um e-mail válido',
      );
    }

    const email = profile.email.toLowerCase();
    let user = await this.usersService.findByGoogleId(profile.googleId);

    if (!user) {
      user = await this.usersService.findByEmail(email);

      if (user) {
        user = await this.usersService.update(user.id, {
          googleId: profile.googleId,
          avatar: profile.avatar || null,
        });
      } else {
        user = await this.usersService.create({
          name: profile.name,
          email,
          googleId: profile.googleId,
          avatar: profile.avatar || null,
          password: null,
        });
      }
    }

    return this.generateToken(user);
  }

  generateToken(user: {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
      },
    };
  }
}