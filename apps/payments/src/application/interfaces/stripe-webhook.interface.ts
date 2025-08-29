// Удалите эти интерфейсы:
export interface StripeSubscription {
  id: string;
  current_period_end: number;
  [key: string]: any;
}

export interface StripeSession {
  id: string;
  subscription: string;
  payment_intent?: string;
  metadata: {
    userId: string;
    subscriptionId: string;
  };
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}
