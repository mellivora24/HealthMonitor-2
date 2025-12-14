package main

import (
	"backend/infra/database"
	"backend/infra/network"
	"backend/internal/feature/alert"
	"backend/internal/feature/device"
	"backend/internal/feature/health_data"
	"backend/internal/feature/threshold"
	"backend/internal/feature/user"
	mqttHandler "backend/internal/realtime/mqtt"
	mqttService "backend/internal/realtime/mqtt"
	wsHandler "backend/internal/realtime/websocket"
	wsService "backend/internal/realtime/websocket"
	sharedPkg "backend/internal/shared"
	"backend/internal/shared/utils"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Application struct {
	config      *sharedPkg.Config
	db          *database.PostgresDB
	mqttClient  *network.MQTTClient
	wsHub       *network.WebSocketHub
	router      *gin.Engine
	validator   sharedPkg.Validator
	mqttHandler *mqttHandler.Handler
	wsHandler   *wsHandler.Handler
}

func main() {
	app, err := initializeApplication()
	if err != nil {
		log.Fatalf("Failed to initialize application: %v", err)
	}

	if err := app.start(); err != nil {
		log.Fatalf("Failed to start application: %v", err)
	}
}

func initializeApplication() (*Application, error) {
	config, err := sharedPkg.LoadConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to load config: %w", err)
	}

	validate := sharedPkg.NewValidator()

	db, err := database.NewPostgresDB(&config.Database)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	mqttClient, err := network.NewMQTTClient(&config.MQTT)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MQTT: %w", err)
	}

	wsHub := network.NewWebSocketHub(&config.WebSocket)

	if config.Server.Mode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	app := &Application{
		config:     config,
		db:         db,
		mqttClient: mqttClient,
		wsHub:      wsHub,
		router:     router,
		validator:  validate,
	}

	if err := app.setupHandlers(); err != nil {
		return nil, fmt.Errorf("failed to setup handlers: %w", err)
	}

	app.setupRoutes()

	if err := app.mqttHandler.Init(); err != nil {
		return nil, fmt.Errorf("failed to initialize MQTT handler: %w", err)
	}

	fmt.Println("Backend is running at", fmt.Sprintf("%s:%d", config.Server.Host, config.Server.Port))

	return app, nil
}

func (app *Application) setupHandlers() error {
	userRepo := user.NewRepository(app.db.DB)
	userService := user.NewService(
		userRepo,
		utils.HashPassword,
		utils.ComparePassword,
		utils.GenerateToken,
	)
	userHandler := user.NewHandler(userService, app.validator)

	deviceRepo := device.NewRepository(app.db.DB)
	deviceService := device.NewService(deviceRepo)
	deviceHandler := device.NewHandler(deviceService, app.validator)

	healthDataRepo := health_data.NewRepository(app.db.DB)
	healthDataService := health_data.NewService(healthDataRepo)
	healthDataHandler := health_data.NewHandler(healthDataService, app.validator)

	thresholdRepo := threshold.NewRepository(app.db.DB)
	thresholdService := threshold.NewService(thresholdRepo)
	thresholdHandler := threshold.NewHandler(thresholdService, app.validator)

	alertRepo := alert.NewRepository(app.db.DB)
	alertService := alert.NewService(alertRepo)
	alertHandler := alert.NewHandler(alertService, app.validator)

	wsServiceImpl := wsService.NewService(app.wsHub)
	mqttServiceImpl := mqttService.NewService(app.mqttClient)

	app.mqttHandler = mqttHandler.NewHandler(
		mqttServiceImpl,
		wsServiceImpl,
		healthDataService,
		deviceService,
		alertService,
		thresholdService,
	)

	app.wsHandler = wsHandler.NewHandler(wsServiceImpl)

	app.router.Use(func(c *gin.Context) {
		c.Set("userHandler", userHandler)
		c.Set("deviceHandler", deviceHandler)
		c.Set("healthDataHandler", healthDataHandler)
		c.Set("thresholdHandler", thresholdHandler)
		c.Set("alertHandler", alertHandler)
		c.Set("wsHandler", app.wsHandler)
		c.Next()
	})

	return nil
}

func (app *Application) setupRoutes() {
	app.router.GET("/health", app.healthCheck)

	v1 := app.router.Group("/api/v1")

	public := v1.Group("")
	{
		public.POST("/auth/register", func(c *gin.Context) {
			c.MustGet("userHandler").(*user.Handler).Register(c)
		})
		public.POST("/auth/login", func(c *gin.Context) {
			c.MustGet("userHandler").(*user.Handler).Login(c)
		})
	}

	protected := v1.Group("")
	protected.Use(authMiddleware())
	{
		users := protected.Group("/users")
		{
			users.GET("/profile", func(c *gin.Context) {
				c.MustGet("userHandler").(*user.Handler).GetProfile(c)
			})
			users.PUT("/profile", func(c *gin.Context) {
				c.MustGet("userHandler").(*user.Handler).UpdateProfile(c)
			})
			users.POST("/change-password", func(c *gin.Context) {
				c.MustGet("userHandler").(*user.Handler).ChangePassword(c)
			})
		}

		devices := protected.Group("/devices")
		{
			devices.POST("", func(c *gin.Context) {
				c.MustGet("deviceHandler").(*device.Handler).CreateDevice(c)
			})
			devices.GET("", func(c *gin.Context) {
				c.MustGet("deviceHandler").(*device.Handler).GetUserDevices(c)
			})
			devices.GET("/:id", func(c *gin.Context) {
				c.MustGet("deviceHandler").(*device.Handler).GetDeviceByID(c)
			})
			devices.PUT("/:id", func(c *gin.Context) {
				c.MustGet("deviceHandler").(*device.Handler).UpdateDevice(c)
			})
			devices.POST("/assign", func(c *gin.Context) {
				c.MustGet("deviceHandler").(*device.Handler).AssignDevice(c)
			})
			devices.DELETE("/unassign/:device_code", func(c *gin.Context) {
				c.MustGet("deviceHandler").(*device.Handler).UnassignDevice(c)
			})
			devices.DELETE("/:id", func(c *gin.Context) {
				c.MustGet("deviceHandler").(*device.Handler).DeleteDevice(c)
			})
		}

		healthData := protected.Group("/health-data")
		{
			healthData.GET("/latest", func(c *gin.Context) {
				c.MustGet("healthDataHandler").(*health_data.Handler).GetLatestData(c)
			})
			healthData.GET("", func(c *gin.Context) {
				c.MustGet("healthDataHandler").(*health_data.Handler).GetPaginatedData(c)
			})
			healthData.GET("/stats", func(c *gin.Context) {
				c.MustGet("healthDataHandler").(*health_data.Handler).GetStats(c)
			})
			healthData.GET("/chart", func(c *gin.Context) {
				c.MustGet("healthDataHandler").(*health_data.Handler).GetChartData(c)
			})
		}

		thresholds := protected.Group("/thresholds")
		{
			thresholds.GET("", func(c *gin.Context) {
				c.MustGet("thresholdHandler").(*threshold.Handler).GetThreshold(c)
			})
			thresholds.PUT("", func(c *gin.Context) {
				c.MustGet("thresholdHandler").(*threshold.Handler).UpdateThreshold(c)
			})
		}

		alerts := protected.Group("/alerts")
		{
			alerts.POST("", func(c *gin.Context) {
				c.MustGet("alertHandler").(*alert.Handler).CreateAlert(c)
			})
			alerts.GET("", func(c *gin.Context) {
				c.MustGet("alertHandler").(*alert.Handler).GetAlerts(c)
			})
			alerts.GET("/stats", func(c *gin.Context) {
				c.MustGet("alertHandler").(*alert.Handler).GetStats(c)
			})
			alerts.POST("/mark-read", func(c *gin.Context) {
				c.MustGet("alertHandler").(*alert.Handler).MarkAsRead(c)
			})
			alerts.DELETE("/:id", func(c *gin.Context) {
				c.MustGet("alertHandler").(*alert.Handler).DeleteAlert(c)
			})
			alerts.POST("/delete-multiple", func(c *gin.Context) {
				c.MustGet("alertHandler").(*alert.Handler).DeleteMultiple(c)
			})
		}

		protected.GET("/ws", func(c *gin.Context) {
			c.MustGet("wsHandler").(*wsHandler.Handler).HandleConnection(c)
		})
	}
}

func (app *Application) healthCheck(c *gin.Context) {
	status := map[string]interface{}{
		"status":    "ok",
		"timestamp": time.Now().Unix(),
		"services": map[string]interface{}{
			"database":  "ok",
			"mqtt":      "ok",
			"websocket": "ok",
		},
	}

	if err := app.db.HealthCheck(); err != nil {
		status["services"].(map[string]interface{})["database"] = "error"
		status["status"] = "degraded"
	}

	if !app.mqttClient.IsConnected() {
		status["services"].(map[string]interface{})["mqtt"] = "error"
		status["status"] = "degraded"
	}

	if err := app.wsHub.HealthCheck(); err != nil {
		status["services"].(map[string]interface{})["websocket"] = "error"
		status["status"] = "degraded"
	}

	c.JSON(http.StatusOK, status)
}

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}

		if len(token) > 7 && token[:7] == "Bearer " {
			token = token[7:]
		}

		userID, err := utils.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Next()
	}
}

func (app *Application) start() error {
	srv := &http.Server{
		Addr:         fmt.Sprintf("%s:%d", app.config.Server.Host, app.config.Server.Port),
		Handler:      app.router,
		ReadTimeout:  app.config.Server.ReadTimeout,
		WriteTimeout: app.config.Server.WriteTimeout,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	app.mqttClient.Disconnect(250)

	if err := app.db.Close(); err != nil {
		log.Printf("Error closing database: %v", err)
	}

	return nil
}
