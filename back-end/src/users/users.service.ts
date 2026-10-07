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