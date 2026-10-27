import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>,
  ) {}

  findByEmail(email: string) {
    return this.repository.findOne({
      where: { email },
    });
  }
  async updateResetToken(id: number, resetToken: string, resetTokenExpires: Date) {
    return this.repository.update(id, {
      resetToken,
      resetTokenExpires,
    });
  }


  async findForPasswordReset(email: string) {
    return this.repository.findOne({
      where: { email },
      select: ['id', 'email', 'senhaHash', 'resetToken', 'resetTokenExpires'],
    });
  }


  async updatePasswordAndClearToken(id: number, senhaHash: string) {
    return this.repository.update(id, {
      senhaHash,
      resetToken: null,
      resetTokenExpires: null,
    });
  }

  findById(id: number) {
    return this.repository.findOne({
      where: { id },
    });
  }

  create(data: Partial<Usuario>) {
    const usuario = this.repository.create(data);
    return this.repository.save(usuario);
  }

  async update(id: number, data: Partial<Usuario>) {
    await this.repository.update(id, data);
    return this.findById(id);
  }
}