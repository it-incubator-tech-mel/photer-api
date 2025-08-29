export class PaymentOutputDto {
  subscriptionId: string | null;
  userId: string | null;
  dateOfPayment: Date;
  endDateOfSubscription: Date | null;
  price: number;
  subscriptionType: string | null;
  paymentType: string;
}
