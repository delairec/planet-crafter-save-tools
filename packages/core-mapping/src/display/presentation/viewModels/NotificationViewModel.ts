export type NotificationSeverity = 'information' | 'limitation' | 'warning';

export interface NotificationViewModel {
  severity: NotificationSeverity;
  message: string;
}
