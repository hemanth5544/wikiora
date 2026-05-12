package service

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"github.com/wikiora/wikiora/apps/api/internal/domain"
	"github.com/wikiora/wikiora/apps/api/internal/repository"
)

var slugSanitizer = regexp.MustCompile(`[^a-z0-9]+`)

type WorkspaceService struct {
	workspaces *repository.WorkspaceRepository
	users      *repository.UserRepository
}

func NewWorkspaceService(workspaces *repository.WorkspaceRepository, users *repository.UserRepository) *WorkspaceService {
	return &WorkspaceService{workspaces: workspaces, users: users}
}

type CreateWorkspaceInput struct {
	Name        string
	Description string
	Visibility  string
	LogoURL     string
}

type UpdateWorkspaceInput struct {
	Name        *string
	Description *string
	Visibility  *string
	LogoURL     *string
}

type WorkspaceListItem struct {
	Workspace domain.Workspace
	Role      string
}

type WorkspaceMemberView struct {
	ID          uuid.UUID
	WorkspaceID uuid.UUID
	UserID      uuid.UUID
	Role        string
	Email       string
	FirstName   string
	LastName    string
}

func (s *WorkspaceService) resolveUser(ctx context.Context, clerkUserID string) (*domain.User, error) {
	user, err := s.users.FindByClerkID(ctx, clerkUserID)
	if err == nil {
		return user, nil
	}
	if err != repository.ErrUserNotFound {
		return nil, err
	}
	return nil, repository.ErrUserNotFound
}

func (s *WorkspaceService) Create(ctx context.Context, clerkUserID string, input CreateWorkspaceInput) (*WorkspaceListItem, error) {
	user, err := s.resolveUser(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, fmt.Errorf("workspace name is required")
	}

	visibility := strings.TrimSpace(input.Visibility)
	if visibility == "" {
		visibility = "private"
	}
	if visibility != "private" && visibility != "public" {
		return nil, fmt.Errorf("visibility must be private or public")
	}

	slug, err := s.uniqueSlug(ctx, name)
	if err != nil {
		return nil, err
	}

	workspace := &domain.Workspace{
		Name:        name,
		Slug:        slug,
		Description: strings.TrimSpace(input.Description),
		Visibility:  visibility,
		LogoURL:     strings.TrimSpace(input.LogoURL),
		OwnerID:     user.ID,
	}

	if err := s.workspaces.CreateWithOwner(ctx, workspace, user.ID); err != nil {
		return nil, err
	}

	return &WorkspaceListItem{Workspace: *workspace, Role: domain.RoleAdmin}, nil
}

func (s *WorkspaceService) List(ctx context.Context, clerkUserID string) ([]WorkspaceListItem, error) {
	user, err := s.resolveUser(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	rows, err := s.workspaces.ListByUserID(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	items := make([]WorkspaceListItem, 0, len(rows))
	for _, row := range rows {
		items = append(items, WorkspaceListItem{Workspace: row.Workspace, Role: row.Role})
	}
	return items, nil
}

func (s *WorkspaceService) Get(ctx context.Context, clerkUserID string, workspaceID uuid.UUID) (*WorkspaceListItem, error) {
	user, err := s.resolveUser(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	workspace, err := s.workspaces.FindByID(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	member, err := s.workspaces.GetMembership(ctx, workspaceID, user.ID)
	if err != nil {
		return nil, err
	}

	return &WorkspaceListItem{Workspace: *workspace, Role: member.Role}, nil
}

func (s *WorkspaceService) Update(ctx context.Context, clerkUserID string, workspaceID uuid.UUID, input UpdateWorkspaceInput) (*WorkspaceListItem, error) {
	user, err := s.resolveUser(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	member, err := s.workspaces.GetMembership(ctx, workspaceID, user.ID)
	if err != nil {
		return nil, err
	}
	if member.Role != domain.RoleAdmin {
		return nil, fmt.Errorf("only workspace admins can update workspace settings")
	}

	workspace, err := s.workspaces.FindByID(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	if input.Name != nil {
		name := strings.TrimSpace(*input.Name)
		if name == "" {
			return nil, fmt.Errorf("workspace name is required")
		}
		workspace.Name = name
	}
	if input.Description != nil {
		workspace.Description = strings.TrimSpace(*input.Description)
	}
	if input.Visibility != nil {
		visibility := strings.TrimSpace(*input.Visibility)
		if visibility != "private" && visibility != "public" {
			return nil, fmt.Errorf("visibility must be private or public")
		}
		workspace.Visibility = visibility
	}
	if input.LogoURL != nil {
		workspace.LogoURL = strings.TrimSpace(*input.LogoURL)
	}

	if err := s.workspaces.Update(ctx, workspace); err != nil {
		return nil, err
	}

	return &WorkspaceListItem{Workspace: *workspace, Role: member.Role}, nil
}

func (s *WorkspaceService) ListMembers(ctx context.Context, clerkUserID string, workspaceID uuid.UUID) ([]WorkspaceMemberView, error) {
	user, err := s.resolveUser(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	if _, err := s.workspaces.GetMembership(ctx, workspaceID, user.ID); err != nil {
		return nil, err
	}

	members, err := s.workspaces.ListMembers(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	views := make([]WorkspaceMemberView, 0, len(members))
	for _, member := range members {
		memberUser, err := s.users.FindByID(ctx, member.UserID)
		if err != nil {
			return nil, err
		}
		views = append(views, WorkspaceMemberView{
			ID:          member.ID,
			WorkspaceID: member.WorkspaceID,
			UserID:      member.UserID,
			Role:        member.Role,
			Email:       memberUser.Email,
			FirstName:   memberUser.FirstName,
			LastName:    memberUser.LastName,
		})
	}

	return views, nil
}

func (s *WorkspaceService) UpdateMemberRole(ctx context.Context, clerkUserID string, workspaceID, targetUserID uuid.UUID, role string) error {
	if !domain.IsValidWorkspaceRole(role) {
		return fmt.Errorf("invalid workspace role")
	}

	user, err := s.resolveUser(ctx, clerkUserID)
	if err != nil {
		return err
	}

	member, err := s.workspaces.GetMembership(ctx, workspaceID, user.ID)
	if err != nil {
		return err
	}
	if member.Role != domain.RoleAdmin {
		return fmt.Errorf("only workspace admins can update member roles")
	}

	return s.workspaces.UpdateMemberRole(ctx, workspaceID, targetUserID, role)
}

func (s *WorkspaceService) uniqueSlug(ctx context.Context, name string) (string, error) {
	base := slugSanitizer.ReplaceAllString(strings.ToLower(strings.TrimSpace(name)), "-")
	base = strings.Trim(base, "-")
	if base == "" {
		base = "workspace"
	}

	candidate := base
	for i := 0; i < 20; i++ {
		exists, err := s.workspaces.SlugExists(ctx, candidate)
		if err != nil {
			return "", err
		}
		if !exists {
			return candidate, nil
		}
		candidate = fmt.Sprintf("%s-%d", base, i+2)
	}

	return "", fmt.Errorf("unable to generate unique workspace slug")
}
