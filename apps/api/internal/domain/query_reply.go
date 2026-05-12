package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type QueryReply struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	QueryID       uuid.UUID      `gorm:"type:uuid;not null;index" json:"queryId"`
	WorkspaceID   uuid.UUID      `gorm:"type:uuid;not null;index" json:"workspaceId"`
	AuthorID      uuid.UUID      `gorm:"type:uuid;not null;index" json:"authorId"`
	ParentReplyID *uuid.UUID     `gorm:"type:uuid;index" json:"parentReplyId,omitempty"`
	Body          string         `gorm:"type:text;not null" json:"body"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

func (r *QueryReply) BeforeCreate(_ *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}
