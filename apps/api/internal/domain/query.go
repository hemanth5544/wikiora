package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	QueryStatusOpen     = "open"
	QueryStatusResolved = "resolved"
)

type Query struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	WorkspaceID uuid.UUID      `gorm:"type:uuid;not null;index" json:"workspaceId"`
	AuthorID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"authorId"`
	Title       string         `gorm:"size:200;not null" json:"title"`
	Body        string         `gorm:"type:text;not null" json:"body"`
	Status      string         `gorm:"size:32;not null;default:open;index" json:"status"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (q *Query) BeforeCreate(_ *gorm.DB) error {
	if q.ID == uuid.Nil {
		q.ID = uuid.New()
	}
	if q.Status == "" {
		q.Status = QueryStatusOpen
	}
	return nil
}

func IsValidQueryStatus(status string) bool {
	return status == QueryStatusOpen || status == QueryStatusResolved
}
