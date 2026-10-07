import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  findById(id: number) {
    return this.repository.findOne({
      where: { id },
    });
  }

  findByGoogleId(googleId: string) {
    return this.repository.findOne({
      where: { googleId },
    });
  }

  create(data: Partial<User>) {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async update(id: number, data: Partial<User>) {
    await this.repository.update(id, data);
    return this.findById(id);
  }
}