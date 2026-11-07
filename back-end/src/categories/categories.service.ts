import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Categoria } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

const FALLBACK_COLOR = '#475569';

/** Categorias padrão do sistema (`id_usuario` nulo). */
const DEFAULT_CATEGORIES = [
  { nome: 'Salário', cor: '#16A34A' },
  { nome: 'Freelance', cor: '#0891B2' },
  { nome: 'Moradia', cor: '#2563EB' },
  { nome: 'Alimentação', cor: '#EA580C' },
  { nome: 'Transporte', cor: '#7C3AED' },
  { nome: 'Saúde', cor: '#0D9488' },
  { nome: 'Lazer', cor: '#DB2777' },
  { nome: 'Educação', cor: '#CA8A04' },
  { nome: 'Outros', cor: '#475569' },
];

@Injectable()
export class CategoriesService implements OnModuleInit {
  private readonly logger = new Logger(CategoriesService.name);

  /** Indica que as categorias padrão já estão no banco (evita consultas repetidas). */
  private defaultsReady = false;
  private ensuring: Promise<void> | null = null;

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriesRepository: Repository<Categoria>,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultCategories();
  }

  /**
   * As categorias padrão precisam existir como linhas em `categoria`
   * (`id_usuario` nulo), pois `movimentacao.id_categoria` é uma chave
   * estrangeira. Elas são criadas aqui automaticamente, sem cadastro manual.
   * É chamado na inicialização e também antes de listar, caso a primeira
   * tentativa tenha falhado.
   */
  private ensureDefaultCategories(): Promise<void> {
    if (!this.ensuring) {
      this.ensuring = this.createMissingDefaults().finally(() => {
        this.ensuring = null;
      });
    }

    return this.ensuring;
  }

  private async createMissingDefaults(): Promise<void> {
    let existingNames: Set<string>;

    try {
      const rows = await this.categoriesRepository.find({
        select: { nome: true },
        where: { idUsuario: IsNull() },
      });

      existingNames = new Set(
        rows.map((row) => row.nome.toLocaleLowerCase('pt-BR')),
      );
    } catch (error) {
      this.logger.error(
        `Não foi possível consultar as categorias padrão: ${this.errorMessage(error)}`,
      );

      return;
    }

    let allReady = true;

    for (const defaultCategory of DEFAULT_CATEGORIES) {
      if (existingNames.has(defaultCategory.nome.toLocaleLowerCase('pt-BR'))) {
        continue;
      }

      try {
        await this.insertDefaultCategory(defaultCategory);
      } catch (error) {
        allReady = false;
        this.logger.error(
          `Não foi possível criar a categoria padrão "${defaultCategory.nome}": ${this.errorMessage(error)}`,
        );
      }
    }

    this.defaultsReady = allReady;
  }

  private async insertDefaultCategory(defaultCategory: {
    nome: string;
    cor: string;
  }) {
    const build = () =>
      this.categoriesRepository.create({
        idUsuario: null,
        nome: defaultCategory.nome,
        cor: defaultCategory.cor,
      });

    try {
      await this.categoriesRepository.save(build());
    } catch (error) {
      const code = (error as { driverError?: { code?: string } }).driverError
        ?.code;

      // 23505 = chave duplicada: a sequência do `id` ficou atrás dos dados
      // (comum quando registros foram inseridos com id manual). Reajusta e repete.
      if (code !== '23505') {
        throw error;
      }

      await this.categoriesRepository.query(
        `SELECT setval(pg_get_serial_sequence('categoria', 'id'), COALESCE((SELECT MAX(id) FROM categoria), 0) + 1, false)`,
      );
      await this.categoriesRepository.save(build());
    }
  }

  async findAllByUser(userId: number) {
    if (!this.defaultsReady) {
      await this.ensureDefaultCategories();
    }

    const categories = await this.categoriesRepository.find({
      where: [{ idUsuario: userId }, { idUsuario: IsNull() }],
      order: { id: 'ASC' },
    });

    return categories.map((category) => this.toResponse(category));
  }

  async create(userId: number, dto: CreateCategoryDto) {
    const existing = await this.categoriesRepository
      .createQueryBuilder('c')
      .where('(c.idUsuario = :userId OR c.idUsuario IS NULL)', { userId })
      .andWhere('LOWER(c.nome) = LOWER(:nome)', { nome: dto.name })
      .orderBy('c.id', 'ASC')
      .getOne();

    // Mesma regra usada pelo front-end: nome repetido reaproveita a categoria.
    if (existing) {
      return this.toResponse(existing);
    }

    const saved = await this.categoriesRepository.save(
      this.categoriesRepository.create({
        idUsuario: userId,
        nome: dto.name,
        cor: dto.color,
      }),
    );

    return this.toResponse(saved);
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
  }

  private toResponse(category: Categoria) {
    return {
      id: String(category.id),
      name: category.nome,
      color: category.cor ?? FALLBACK_COLOR,
    };
  }
}
