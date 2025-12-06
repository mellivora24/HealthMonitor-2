package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/mellivora24/yourproject/config"
	"github.com/yourorg/yourproject/infra/database"
	"github.com/yourorg/yourproject/infra/network"
	"github.com/yourorg/yourproject/internal/feature/alert"
	"github.com/yourorg/yourproject/internal/feature/device"
	"github.com/yourorg/yourproject/internal/feature/health_data"
	"github.com/yourorg/yourproject/internal/feature/threshold"
	"github.com/yourorg/yourproject/internal/feature/user"
	"github.com/yourorg/yourproject/internal/realtime/mqtt"
	"github.com/yourorg/yourproject/internal/realtime/websocket"
)

func main() {
	cfg, err := config.Load("./config/config.yaml")
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.NewPostgres(cfg.Database)
	if err != nil {
		log.Fatal(err)
	}

	mqttClient := network.NewMQTTClient(cfg.MQTT)
	mqttService := mqtt.NewMQTTService(mqttClient, db)
	wsManager := websocket.NewManager()

	userRepo := user.NewRepository(db)
	deviceRepo := device.NewRepository(db)
	hdRepo := health_data.NewRepository(db)
	thRepo := threshold.NewRepository(db)
	alertRepo := alert.NewRepository(db)

	userSvc := user.NewService(userRepo)
	deviceSvc := device.NewService(deviceRepo, userRepo)
	hdSvc := health_data.NewService(hdRepo, deviceRepo, userRepo, thRepo, alertRepo)
	thSvc := threshold.NewService(thRepo)
	alertSvc := alert.NewService(alertRepo)

	mqttService.Start(hdSvc)
	wsManager.Start()

	r := gin.Default()

	v1 := r.Group("/api/v1")

	user.RegisterRoutes(v1, userSvc)
	device.RegisterRoutes(v1, deviceSvc)
	health_data.RegisterRoutes(v1, hdSvc)
	threshold.RegisterRoutes(v1, thSvc)
	alert.RegisterRoutes(v1, alertSvc)
	websocket.RegisterRoutes(r, wsManager)

	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.Server.Port
	}

	r.Run(":" + port)
}
