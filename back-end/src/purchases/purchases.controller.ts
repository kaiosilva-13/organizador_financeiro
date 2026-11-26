import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  RECEIPT_MAX_SIZE,
  UploadedReceiptFile,
} from '../transactions/receipt';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PayInstallmentDto } from './dto/pay-installment.dto';
import { PurchasesService } from './purchases.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
  };
}

@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  /** Lista as compras do usuário com o cronograma de parcelas. */
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.purchasesService.findAll(req.user.id);
  }

  /** Cadastra a compra em `controle_compras`; o cronograma é calculado. */
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePurchaseDto) {
    return this.purchasesService.create(req.user.id, dto);
  }

  /** Paga a próxima parcela: atualiza a compra, a conta e as movimentações. */
  @Post(':purchaseId/installments/:installmentId/pay')
  @UseInterceptors(
    FileInterceptor('receipt', { limits: { fileSize: RECEIPT_MAX_SIZE } }),
  )
  payInstallment(
    @Req() req: AuthenticatedRequest,
    @Param('purchaseId', ParseIntPipe) purchaseId: number,
    @Param('installmentId', ParseIntPipe) installmentId: number,
    @Body() dto: PayInstallmentDto,
    @UploadedFile() receipt?: UploadedReceiptFile,
  ) {
    return this.purchasesService.payInstallment(
      req.user.id,
      purchaseId,
      installmentId,
      dto,
      receipt,
    );
  }

  @Delete(':id')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.purchasesService.remove(req.user.id, id);
  }
}
