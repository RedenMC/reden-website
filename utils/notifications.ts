export type NotificationDto = {
  id: number;
  subject: string;
  message: string;
  language: string;
  sent: boolean;
  recalled: boolean;
  read: boolean;
  createdAt: number;
  readAt: number | null;
};

export type NotificationListDto = {
  notifications: NotificationDto[];
  total: number;
};
