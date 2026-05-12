package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Workspace struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string         `gorm:"size:160;not null" json:"name"`
	Slug        string         `gorm:"size:160;uniqueIndex;not null" json:"slug"`
	Description string         `gorm:"type:text" json:"description,omitempty"`
	Visibility  string         `gorm:"size:32;not null;default:private" json:"visibility"`
	LogoURL     string         `gorm:"size:2048" json:"logoUrl,omitempty"`
	OwnerID     uuid.UUID      `gorm:"type:uuid;not null;index" json:"ownerId"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (w *Workspace) BeforeCreate(_ *gorm.DB) error {
	if w.ID == uuid.Nil {
		w.ID = uuid.New()
	}
	if w.Visibility == "" {
		w.Visibility = "private"
	}
	return nil
}

type WorkspaceMember struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	WorkspaceID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_workspace_member" json:"workspaceId"`
	UserID      uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_workspace_member" json:"userId"`
	Role        string    `gorm:"size:32;not null;default:user" json:"role"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (m *WorkspaceMember) BeforeCreate(_ *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	if m.Role == "" {
		m.Role = "user"
	}
	return nil
}
