package shared

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Server    ServerConfig
	Database  DatabaseConfig
	MQTT      MQTTConfig
	WebSocket WebSocketConfig
	JWT       JWTConfig
}

type ServerConfig struct {
	Host         string
	Port         int
	Mode         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

type DatabaseConfig struct {
	Host            string
	Port            int
	User            string
	Password        string
	Database        string
	SSLMode         string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

type MQTTConfig struct {
	Broker               string
	Port                 int
	ClientID             string
	Username             string
	Password             string
	QoS                  byte
	KeepAlive            int
	CleanSession         bool
	AutoReconnect        bool
	MaxReconnectInterval time.Duration
	ConnectTimeout       time.Duration
}

type WebSocketConfig struct {
	ReadBufferSize  int
	WriteBufferSize int
	PongWait        time.Duration
	PingPeriod      time.Duration
	WriteTimeout    time.Duration
	MaxMessageSize  int64
}

type JWTConfig struct {
	Secret     string
	Expiration time.Duration
}

func LoadConfig() (*Config, error) {
	return &Config{
		Server: ServerConfig{
			Host:         getEnv("SERVER_HOST", "0.0.0.0"),
			Port:         getEnvInt("SERVER_PORT", 8080),
			Mode:         getEnv("GIN_MODE", "debug"),
			ReadTimeout:  getDuration("SERVER_READ_TIMEOUT", 15*time.Second),
			WriteTimeout: getDuration("SERVER_WRITE_TIMEOUT", 15*time.Second),
		},
		Database: DatabaseConfig{
			Host:            getEnv("DB_HOST", "localhost"),
			Port:            getEnvInt("DB_PORT", 5436),
			User:            getEnv("DB_USER", "admin"),
			Password:        getEnv("DB_PASSWORD", "admin123456"),
			Database:        getEnv("DB_NAME", "hm_database"),
			SSLMode:         getEnv("DB_SSLMODE", "disable"),
			MaxOpenConns:    getEnvInt("DB_MAX_OPEN_CONNS", 25),
			MaxIdleConns:    getEnvInt("DB_MAX_IDLE_CONNS", 5),
			ConnMaxLifetime: getDuration("DB_CONN_MAX_LIFETIME", 5*time.Minute),
		},
		MQTT: MQTTConfig{
			Broker:               getEnv("MQTT_BROKER", "localhost"),
			Port:                 getEnvInt("MQTT_PORT", 1883),
			ClientID:             getEnv("MQTT_CLIENT_ID", "health-monitoring-backend"),
			Username:             getEnv("MQTT_USERNAME", ""),
			Password:             getEnv("MQTT_PASSWORD", ""),
			QoS:                  byte(getEnvInt("MQTT_QOS", 1)),
			KeepAlive:            getEnvInt("MQTT_KEEPALIVE", 60),
			CleanSession:         getEnvBool("MQTT_CLEAN_SESSION", true),
			AutoReconnect:        getEnvBool("MQTT_AUTO_RECONNECT", true),
			MaxReconnectInterval: getDuration("MQTT_MAX_RECONNECT_INTERVAL", 1*time.Minute),
			ConnectTimeout:       getDuration("MQTT_CONNECT_TIMEOUT", 30*time.Second),
		},
		WebSocket: WebSocketConfig{
			ReadBufferSize:  getEnvInt("WS_READ_BUFFER_SIZE", 1024),
			WriteBufferSize: getEnvInt("WS_WRITE_BUFFER_SIZE", 1024),
			PongWait:        getDuration("WS_PONG_WAIT", 60*time.Second),
			PingPeriod:      getDuration("WS_PING_PERIOD", 54*time.Second),
			WriteTimeout:    getDuration("WS_WRITE_TIMEOUT", 10*time.Second),
			MaxMessageSize:  int64(getEnvInt("WS_MAX_MESSAGE_SIZE", 512*1024)),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET", "your-secret-key"),
			Expiration: getDuration("JWT_EXPIRATION", 24*time.Hour),
		},
	}, nil
}

func (d *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		d.Host, d.Port, d.User, d.Password, d.Database, d.SSLMode)
}

func (m *MQTTConfig) GetBrokerURL() string {
	return fmt.Sprintf("tcp://%s:%d", m.Broker, m.Port)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

func getDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}
