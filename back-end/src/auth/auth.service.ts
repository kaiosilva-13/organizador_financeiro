import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.password, 10);
    const nomeRandom = email.split('@')[0];

    const usuario = await this.usersService.create({
      nome: nomeRandom.charAt(0).toUpperCase() + nomeRandom.slice(1),
      email,
      senhaHash,
    });

    return this.generateToken(usuario);
  }

  async forgotPassword(email: string) {
    const usuario = await this.usersService.findByEmail(email);
    if (!usuario) {
      return { message: 'Se o e-mail existir, enviaremos um código de recuperação.' };
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    await this.usersService.updateResetToken(usuario.id, code, expires);
    await this.mailService.sendPasswordResetCode(usuario.email, code);

    return { message: 'Código enviado com sucesso.' };
  }

  async verifyCode(email: string, code: string) {
    const usuario = await this.usersService.findByEmail(email);
    this.validarResetToken(usuario, code);

    return { message: 'Código válido com sucesso.' };
  }

  async resetPassword(email: string, code: string, novaSenha: string) {
    const usuario = await this.usersService.findForPasswordReset(email);

    if (!usuario) {
      throw new BadRequestException('Utilizador não encontrado.');
    }

    this.validarResetToken(usuario, code);

    if (usuario.senhaHash) {
      const isSamePassword = await bcrypt.compare(novaSenha, usuario.senhaHash);
      if (isSamePassword) {
        throw new BadRequestException('A nova senha não pode ser igual à senha anterior.');
      }
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await this.usersService.updatePasswordAndClearToken(usuario.id, senhaHash);

    return { message: 'Senha redefinida com sucesso!' };
  }

  private validarResetToken(usuario: any, code: string) {
    if (!usuario || usuario.resetToken !== code) {
      throw new BadRequestException('Código inválido.');
    }
    if (usuario.resetTokenExpires && new Date() > usuario.resetTokenExpires) {
      throw new BadRequestException('Este código expirou.');
    }
  }

  async validateGoogleUser(googleUser: { googleId: string; email: string; name: string; avatar: string | null }) {
    const email = googleUser.email.trim().toLowerCase();
    let usuario = await this.usersService.findByEmail(email);

    if (!usuario) {
      usuario = await this.usersService.create({
        nome: googleUser.name,
        email: email,
        senhaHash: '',
      });
    }

    return this.generateToken(usuario);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const usuario = await this.usersService.findByEmail(email);

    if (!usuario || !(await bcrypt.compare(dto.password, usuario.senhaHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.generateToken(usuario);
  }

  generateToken(usuario: { id: number; nome: string; email: string }) {
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