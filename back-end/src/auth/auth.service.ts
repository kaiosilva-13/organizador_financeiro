import {ConflictException , Injectable, UnauthorizedException } from '@nestjs/common';
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

    const senhaHash = await bcrypt.hash(dto.password, 10);

    const nomeRandom = email.split('@')[0]; // Nome gerado com base no email enviado

    const usuario = await this.usersService.create({
      nome: nomeRandom.charAt(0).toUpperCase() + nomeRandom.slice(1), // Define a primeira letra como maiúscula
      email,
      senhaHash,
    });

    return this.generateToken(usuario);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const usuario = await this.usersService.findByEmail(email);

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(
      dto.password,
      usuario.senhaHash,
    );

    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.generateToken(usuario);
  }

  generateToken(usuario: {
    id: number;
    nome: string;
    email: string;
  }) {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  }
}