class NotificationData {
    // Class members (properties and methods) go here
    notification_id: number;
    user: number
    notification_title: string;
    notification_message: string;
    timestamp: Date;
    read_status: boolean;

    constructor(notification_id: number, user: number, notification_title: string, notification_message: string, timestamp: Date, read_status: boolean) {
        this.notification_id = notification_id;
        this.user = user;
        this.notification_title = notification_title;
        this.notification_message = notification_message;
        this.timestamp = timestamp;
        this.read_status = read_status;
    }

}

export default NotificationData;