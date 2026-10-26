
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContaFinanceira } from './account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Usuario } from '../users/user.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(ContaFinanceira)
    private readonly accountsRepository: Repository<ContaFinanceira>,
  ) {}

  async create(userId: number, dto: CreateAccountDto) {
    const account = this.accountsRepository.create({
      usuario: { id: userId } as Usuario,
      nomeConta: dto.name.trim(),
      tipoConta: dto.type.trim(),
      saldoAtual: dto.balance.toFixed(2),
    });

    const savedAccount = await this.accountsRepository.save(account);

    return this.toResponse(savedAccount);
  }

  async findAllByUser(userId: number) {
    const accounts = await this.accountsRepository.find({
      where: { usuario: { id: userId } },
      order: { id: 'ASC' },
    });

    return accounts.map((account) => this.toResponse(account));
  }

  async update(
    userId: number,
    accountId: number,
    dto: UpdateAccountDto,
  ) {
    const account = await this.accountsRepository.findOne({
      where: {
        id: accountId,
        usuario: { id: userId },
      },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada.');
    }

    if (dto.name !== undefined) {
      account.nomeConta = dto.name.trim();
    }

    if (dto.type !== undefined) {
      account.tipoConta = dto.type.trim();
    }

    if (dto.balance !== undefined) {
      account.saldoAtual = dto.balance.toFixed(2);
    }

    const updatedAccount = await this.accountsRepository.save(account);

    return this.toResponse(updatedAccount);
  }

  async remove(userId: number, accountId: number) {
    const account = await this.accountsRepository.findOne({
      where: {
        id: accountId,
        usuario: { id: userId },
      },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada.');
    }

    await this.accountsRepository.remove(account);

    return { message: 'Conta removida com sucesso.' };
  }

  private toResponse(account: ContaFinanceira) {
    return {
      id: account.id,
      name: account.nomeConta,
      type: account.tipoConta,
      balance: Number(account.saldoAtual),
    };
  }
}
