import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import {
  SubscriptionOutputDto,
  SubscriptionStatus,
  AccountType,
} from './dto/subscription-output.dto';
import { PaymentOutputDto } from './dto/payment-output.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Создает новую подписку
   */
  async createSubscription(
    createSubscriptionDto: CreateSubscriptionDto,
    userId: string,
  ): Promise<{ url: string }> {
    // Проверяем, есть ли уже активная подписка
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      throw new ConflictException('Subscription already active');
    }

    // Создаем подписку со статусом PENDING
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        status: SubscriptionStatus.PENDING,
        accountType: AccountType.PERSONAL, // По умолчанию PERSONAL
        validUntil: this.calculateValidUntil(
          createSubscriptionDto.subscriptionPeriod,
        ),
        autoRenewal: true, // По умолчанию включено
        paymentProvider: createSubscriptionDto.paymentProvider,
        externalId: this.generateExternalId(),
      },
    });

    // В реальном приложении здесь будет интеграция с провайдерами (Stripe/PayPal/Payme)
    // На время интеграции возвращаем URL-заглушку по провайдеру
    let paymentUrl = `${createSubscriptionDto.baseUrl}/payment/${subscription.id}`;
    if (createSubscriptionDto.paymentProvider === 'PAYME') {
      const paymeBase =
        process.env.PAYME_STAGING_URL || 'https://checkout.test.paycom.uz';
      const merchantId = process.env.PAYME_MERCHANT_ID || 'test-merchant';
      // Заглушка построения URL (в реальной интеграции использовать параметры Payme)
      paymentUrl = `${paymeBase}?m=${merchantId}&return=${encodeURIComponent(createSubscriptionDto.baseUrl + '/payment/callback')}`;
    }

    return { url: paymentUrl };
  }

  /**
   * Получает все подписки с пагинацией
   */
  async getAllSubscriptions(
    pageNumber: number = 1,
    pageSize: number = 8,
    sortDirection: 'asc' | 'desc' = 'desc',
    sortBy: string = 'createdAt',
  ): Promise<{
    items: SubscriptionOutputDto[];
    totalCount: number;
    pagesCount: number;
    page: number;
    pageSize: number;
  }> {
    const skip = (pageNumber - 1) * pageSize;

    // Получаем общее количество подписок
    const totalCount = await this.prisma.subscription.count();

    // Получаем подписки с пагинацией и сортировкой
    const subscriptions = await this.prisma.subscription.findMany({
      skip,
      take: pageSize,
      orderBy: {
        [sortBy]: sortDirection,
      },
    });

    const items = subscriptions.map((subscription) =>
      this.mapToSubscriptionOutputDto(subscription),
    );
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      items,
      totalCount,
      pagesCount,
      page: pageNumber,
      pageSize,
    };
  }

  /**
   * Получает платежи пользователя
   */
  async getUserPayments(
    userId: string,
    pageNumber: number = 1,
    pageSize: number = 8,
    sortDirection: 'asc' | 'desc' = 'desc',
    sortBy: string = 'dateOfPayment',
  ): Promise<{
    items: PaymentOutputDto[];
    totalCount: number;
    pagesCount: number;
    page: number;
    pageSize: number;
  }> {
    const skip = (pageNumber - 1) * pageSize;

    // Получаем общее количество платежей пользователя
    const totalCount = await this.prisma.payment.count({
      where: { userId },
    });

    // Получаем платежи пользователя с пагинацией и сортировкой
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      skip,
      take: pageSize,
      orderBy: {
        [sortBy]: sortDirection,
      },
    });

    const items = payments.map((payment) =>
      this.mapToPaymentOutputDto(payment),
    );
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      items,
      totalCount,
      pagesCount,
      page: pageNumber,
      pageSize,
    };
  }

  /**
   * Отменяет автопродление подписки
   */
  async cancelAutoRenewal(userId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }

    if (!subscription.autoRenewal) {
      throw new ConflictException('Auto-renewal already disabled');
    }

    // В реальном приложении здесь будет интеграция с платежным провайдером
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { autoRenewal: false },
    });
  }

  /**
   * Включает автопродление подписки
   */
  async enableAutoRenewal(userId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }

    if (subscription.autoRenewal) {
      throw new ConflictException('Auto-renewal is already enabled');
    }

    // В реальном приложении здесь будет интеграция с платежным провайдером
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { autoRenewal: true },
    });
  }

  /**
   * Вычисляет дату окончания подписки
   */
  private calculateValidUntil(period: string): Date {
    const now = new Date();

    switch (period) {
      case 'MONTHLY':
        return new Date(now.setMonth(now.getMonth() + 1));
      case 'WEEKLY':
        return new Date(now.setDate(now.getDate() + 7));
      case 'DAILY':
        return new Date(now.setDate(now.getDate() + 1));
      default:
        throw new BadRequestException('Invalid subscription period');
    }
  }

  /**
   * Генерирует внешний ID для подписки
   */
  private generateExternalId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Преобразует данные из Prisma в SubscriptionOutputDto
   */
  private mapToSubscriptionOutputDto(subscription: any): SubscriptionOutputDto {
    return {
      id: subscription.id,
      userId: subscription.userId,
      status: subscription.status,
      accountType: subscription.accountType,
      validUntil: subscription.validUntil.toISOString(),
      autoRenewal: subscription.autoRenewal,
      paymentProvider: subscription.paymentProvider,
      externalId: subscription.externalId,
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  }

  /**
   * Преобразует данные из Prisma в PaymentOutputDto
   */
  private mapToPaymentOutputDto(payment: any): PaymentOutputDto {
    return {
      userId: payment.userId,
      subscriptionId: payment.subscriptionId,
      dateOfPayment: payment.dateOfPayment.toISOString(),
      endDateOfSubscription: payment.endDateOfSubscription.toISOString(),
      price: payment.price,
      subscriptionType: payment.subscriptionType,
      paymentType: payment.paymentType,
    };
  }
}
