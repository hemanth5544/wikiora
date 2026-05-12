package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	ClerkUserID  string         `gorm:"size:255;uniqueIndex;not null" json:"clerkUserId"`
	Email        string         `gorm:"size:320;uniqueIndex;not null" json:"email"`
	FirstName    string         `gorm:"size:120" json:"firstName"`
	LastName     string         `gorm:"size:120" json:"lastName"`
	AvatarURL    string         `gorm:"size:2048" json:"avatarUrl,omitempty"`
	GlobalRole   string         `gorm:"size:32;not null;default:user" json:"globalRole"`
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(_ *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	if u.GlobalRole == "" {
		u.GlobalRole = "user"
	}
	return nil
}
