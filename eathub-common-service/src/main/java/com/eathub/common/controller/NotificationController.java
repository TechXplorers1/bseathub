package com.eathub.common.controller;

import com.eathub.common.entity.Notification;
import com.eathub.common.service.NotificationHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/v1/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationHistoryService notificationHistoryService;

    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsForUser(@PathVariable String userId) {
        return notificationHistoryService.getNotificationsForUser(userId);
    }

    @GetMapping("/unread-count/{userId}")
    public long getUnreadCount(@PathVariable String userId) {
        return notificationHistoryService.getUnreadCount(userId);
    }

    @PostMapping("/mark-as-read/{notificationId}")
    public void markAsRead(@PathVariable String notificationId) {
        notificationHistoryService.markAsRead(notificationId);
    }

    @PostMapping("/mark-all-as-read/{userId}")
    public void markAllAsRead(@PathVariable String userId) {
        notificationHistoryService.markAllAsRead(userId);
    }

    @DeleteMapping("/{notificationId}")
    public void deleteNotification(@PathVariable String notificationId) {
        notificationHistoryService.deleteNotification(notificationId);
    }

    @DeleteMapping("/user/{userId}")
    public void deleteAllForUser(@PathVariable String userId) {
        notificationHistoryService.deleteAllForUser(userId);
    }
}
