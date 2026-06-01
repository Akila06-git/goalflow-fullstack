package com.goalflow.dto;
public class WsEvent {
    private String type;
    private Object payload;
    private Long   userId;
    private Long   timestamp;

    public WsEvent() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final WsEvent e = new WsEvent();
        public Builder type(String v)      { e.type = v; return this; }
        public Builder payload(Object v)   { e.payload = v; return this; }
        public Builder userId(Long v)      { e.userId = v; return this; }
        public Builder timestamp(Long v)   { e.timestamp = v; return this; }
        public WsEvent build()             { return e; }
    }

    public String getType()    { return type; }
    public Object getPayload() { return payload; }
    public Long getUserId()    { return userId; }
    public Long getTimestamp() { return timestamp; }
}
