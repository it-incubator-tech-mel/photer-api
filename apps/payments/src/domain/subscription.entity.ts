import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentEntity } from './payment.entity';

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gatewaySubscriptionId: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'canceled'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  currentPeriodEnd: Date;

  @Column({ default: true })
  autoRenewal: boolean;

  @Column({
    type: 'enum',
    enum: ['STRIPE', 'PAYPAL'],
  })
  paymentProvider: string;

  @Column({ nullable: true })
  externalSubscriptionId: string;

  @Column({
    type: 'enum',
    enum: ['MONTHLY', 'WEEKLY', 'DAILY'],
  })
  subscriptionPeriod: string;

  @OneToMany(() => PaymentEntity, (payment) => payment.subscription)
  payments: PaymentEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
