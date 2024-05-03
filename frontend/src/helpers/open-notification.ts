import { NotificationInstance } from "antd/es/notification/interface";
import { ReactNode } from "react";

export const openNotification = (description: ReactNode, api: NotificationInstance) => {
    api.open({
        message: 'Успешно',
        description,
        placement: 'top'
    });
}