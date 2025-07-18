// src/infrastructure/entities/payment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { SubscriptionEntity } from './subscription.entity';

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  amount: number; // В центах

  @Column({ length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'succeeded', 'failed'],
    default: 'pending',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['STRIPE', 'PAYPAL'],
  })
  paymentProvider: string;

  @Column({ nullable: true })
  externalPaymentId: string;

  @ManyToOne(() => SubscriptionEntity, (subscription) => subscription.payments)
  subscription: SubscriptionEntity;

  @CreateDateColumn()
  createdAt: Date;
}
