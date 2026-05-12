package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	InviteStatusPending  = "pending"
	InviteStatusAccepted = "accepted"
	InviteStatusRevoked  = "revoked"
)

type WorkspaceInvite struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	WorkspaceID uuid.UUID      `gorm:"type:uuid;not null;index" json:"workspaceId"`
	Email       string         `gorm:"size:320;not null;index" json:"email"`
	Role        string         `gorm:"size:32;not null" json:"role"`
	Token       string         `gorm:"size:64;uniqueIndex;not null" json:"token"`
	InvitedByID uuid.UUID      `gorm:"type:uuid;not null;index" json:"invitedById"`
	Status      string         `gorm:"size:32;not null;default:pending;index" json:"status"`
	ExpiresAt   time.Time      `gorm:"not null;index" json:"expiresAt"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (i *WorkspaceInvite) BeforeCreate(_ *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	if i.Status == "" {
		i.Status = InviteStatusPending
	}
	return nil
}

func (i *WorkspaceInvite) IsExpired(now time.Time) bool {
	return now.After(i.ExpiresAt)
}
