import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { RECEIPT_MAX_SIZE, UploadedReceiptFile } from './receipt';
import { TransactionsService } from './transactions.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
  };
}

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListTransactionsQueryDto,
  ) {
    return this.transactionsService.findAll(req.user.id, query);
  }

  /** Devolve o arquivo do comprovante salvo no banco (exige o token JWT). */
  @Get(':id/receipt')
  async downloadReceipt(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const receipt = await this.transactionsService.getReceipt(req.user.id, id);

    return new StreamableFile(receipt.dados, {
      type: receipt.tipo,
      disposition: 'inline',
      length: receipt.dados.length,
    });
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('receipt', { limits: { fileSize: RECEIPT_MAX_SIZE } }),
  )
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTransactionDto,
    @UploadedFile() receipt?: UploadedReceiptFile,
  ) {
    return this.transactionsService.create(req.user.id, dto, receipt);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('receipt', { limits: { fileSize: RECEIPT_MAX_SIZE } }),
  )
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransactionDto,
    @UploadedFile() receipt?: UploadedReceiptFile,
  ) {
    return this.transactionsService.update(req.user.id, id, dto, receipt);
  }

  @Delete(':id')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transactionsService.remove(req.user.id, id);
  }
}
