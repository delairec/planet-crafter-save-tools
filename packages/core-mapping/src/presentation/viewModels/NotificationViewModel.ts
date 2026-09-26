export type NotificationSeverity = 'limitation' | 'warning';

export interface NotificationViewModel {
  severity: NotificationSeverity;
  message: string;
}
