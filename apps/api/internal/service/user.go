package service

import (
	"context"
	"fmt"
	"strings"

	clerk "github.com/clerk/clerk-sdk-go/v2"
	clerkuser "github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/wikiora/wikiora/apps/api/internal/domain"
	"github.com/wikiora/wikiora/apps/api/internal/repository"
)

type ClerkUserPayload struct {
	ClerkUserID string
	Email       string
	FirstName   string
	LastName    string
	AvatarURL   string
}

type UserService struct {
	users *repository.UserRepository
}

func NewUserService(users *repository.UserRepository) *UserService {
	return &UserService{users: users}
}

func (s *UserService) SyncFromClerk(ctx context.Context, payload ClerkUserPayload) (*domain.User, error) {
	if strings.TrimSpace(payload.ClerkUserID) == "" {
		return nil, fmt.Errorf("clerk user id is required")
	}
	if strings.TrimSpace(payload.Email) == "" {
		return nil, fmt.Errorf("email is required")
	}

	user := &domain.User{
		ClerkUserID: payload.ClerkUserID,
		Email:       strings.ToLower(strings.TrimSpace(payload.Email)),
		FirstName:   strings.TrimSpace(payload.FirstName),
		LastName:    strings.TrimSpace(payload.LastName),
		AvatarURL:   strings.TrimSpace(payload.AvatarURL),
	}

	return s.users.UpsertByClerkID(ctx, user)
}

func (s *UserService) GetByClerkID(ctx context.Context, clerkUserID string) (*domain.User, error) {
	return s.users.FindByClerkID(ctx, clerkUserID)
}

func (s *UserService) EnsureFromClerkAPI(ctx context.Context, clerkUserID string) (*domain.User, error) {
	clerkUser, err := clerkuser.Get(ctx, clerkUserID)
	if err != nil {
		return nil, fmt.Errorf("fetch clerk user: %w", err)
	}

	email := primaryEmailFromClerkUser(clerkUser)
	if email == "" {
		return nil, fmt.Errorf("clerk user has no email")
	}

	return s.SyncFromClerk(ctx, ClerkUserPayload{
		ClerkUserID: clerkUserID,
		Email:       email,
		FirstName:   stringValue(clerkUser.FirstName),
		LastName:    stringValue(clerkUser.LastName),
		AvatarURL:   stringValue(clerkUser.ImageURL),
	})
}

func primaryEmailFromClerkUser(clerkUser *clerk.User) string {
	if clerkUser == nil {
		return ""
	}

	primaryID := ""
	if clerkUser.PrimaryEmailAddressID != nil {
		primaryID = *clerkUser.PrimaryEmailAddressID
	}

	for _, address := range clerkUser.EmailAddresses {
		if primaryID != "" && address.ID == primaryID {
			return address.EmailAddress
		}
	}

	for _, address := range clerkUser.EmailAddresses {
		if address.EmailAddress != "" {
			return address.EmailAddress
		}
	}

	return ""
}

func stringValue(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
