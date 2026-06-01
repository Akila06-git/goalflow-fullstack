package com.goalflow.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.goalflow.dto.WsEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.logging.Logger;

@Service
public class RealTimePublisher {

    private static final Logger log = Logger.getLogger(RealTimePublisher.class.getName());

    private final SimpMessagingTemplate messaging;
    private final ObjectMapper          mapper;

    public RealTimePublisher(SimpMessagingTemplate messaging, ObjectMapper mapper) {
        this.messaging = messaging;
        this.mapper    = mapper;
    }

    public void publishGoalEvent(Long userId, String type, Object payload) {
        WsEvent event = WsEvent.builder()
                .type(type).payload(payload).userId(userId)
                .timestamp(System.currentTimeMillis()).build();
        messaging.convertAndSend("/topic/goals/" + userId, event);
        log.fine("WS → /topic/goals/" + userId + " : " + type);
    }

    public void publishTaskEvent(Long userId, String type, Object payload) {
        WsEvent event = WsEvent.builder()
                .type(type).payload(payload).userId(userId)
                .timestamp(System.currentTimeMillis()).build();
        messaging.convertAndSend("/topic/tasks/" + userId, event);
    }

    public void publishActivity(String message, Long userId) {
        WsEvent event = WsEvent.builder()
                .type("ACTIVITY").payload(message).userId(userId)
                .timestamp(System.currentTimeMillis()).build();
        messaging.convertAndSend("/topic/activity", event);
    }
}
