package com.eathub.common.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class FirebaseService {

    public void sendNotification(String token, String title, String body, Map<String, String> data) {
        if (token == null || token.isEmpty()) {
            return;
        }

        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message.Builder builder = Message.builder()
                    .setToken(token)
                    .setNotification(notification);

            if (data != null) {
                builder.putAllData(data);
            }

            FirebaseMessaging.getInstance().send(builder.build());

        } catch (FirebaseMessagingException e) {

            if ("registration-token-not-registered".equals(e.getErrorCode())) {
                // TODO: remove token from database
                System.out.println("Invalid token. Should delete from DB.");
            }
        } catch (Exception e) {
            System.err.println("Firebase notification error: " + e.getMessage());
        }
    }
}
