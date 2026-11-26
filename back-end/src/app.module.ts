import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { FixedExpensesModule } from './fixed-expenses/fixed-expenses.module';
import { AdminModule } from './admin/admin.module';
import { PurchasesModule } from './purchases/purchases.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST || 'postgres', 
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'organizador_financeiro',
    autoLoadEntities: true,
    synchronize: true,
    }),
    AuthModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    FixedExpensesModule,
    AdminModule,
    PurchasesModule,
  ],
})
export class AppModule {}