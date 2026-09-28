/** @type {Record<import('core-mapping/presentation/viewModels/NotificationViewModel').NotificationSeverity, string>} */
const notificationSeverityLabels = {
  information: 'Information',
  limitation: 'Limitation',
  warning: 'Warning'
};

/** @param {import('core-mapping/presentation/viewModels/NotificationViewModel').NotificationSeverity} severity */
export const resolveNotificationSeverityLabel = (severity) => notificationSeverityLabels[severity];

export const notificationSeveritySeparator = ': ';
