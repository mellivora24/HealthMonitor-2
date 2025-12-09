package shared

type RealtimeModel struct {
	Topic   string      `json:"topic"`
	Payload interface{} `json:"payload"`
}

const (
	MQTT_DATA_TOPIC = "/health_monitor/+/data/"
)
