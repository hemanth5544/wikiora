package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/wikiora/wikiora/apps/api/internal/domain"
	"github.com/wikiora/wikiora/apps/api/internal/repository"
)

const inviteTTL = 7 * 24 * time.Hour

type InviteService struct {
	invites    *repository.InviteRepository
	workspaces *repository.WorkspaceRepository
	users      *repository.UserRepository
}

func NewInviteService(
	invites *repository.InviteRepository,
	workspaces *repository.WorkspaceRepository,
	users *repository.UserRepository,
) *InviteService {
	return &InviteService{invites: invites, workspaces: workspaces, users: users}
}

type InviteView struct {
	Invite          domain.WorkspaceInvite
	WorkspaceName   string
	WorkspaceSlug   string
	InvitedByEmail  string
	InvitedByName   string
}

func (s *InviteService) Create(ctx context.Context, clerkUserID string, workspaceID uuid.UUID, email, role string) (*domain.WorkspaceInvite, error) {
	inviter, err := s.users.FindByClerkID(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	member, err := s.workspaces.GetMembership(ctx, workspaceID, inviter.ID)
	if err != nil {
		return nil, err
	}
	if member.Role != domain.RoleAdmin {
		return nil, fmt.Errorf("only workspace admins can invite members")
	}

	normalizedEmail := strings.ToLower(strings.TrimSpace(email))
	if normalizedEmail == "" {
		return nil, fmt.Errorf("email is required")
	}
	if role != domain.RoleMember && role != domain.RoleUser {
		return nil, fmt.Errorf("invite role must be member or user")
	}

	if existingUser, err := s.users.FindByEmail(ctx, normalizedEmail); err == nil {
		if _, memberErr := s.workspaces.GetMembership(ctx, workspaceID, existingUser.ID); memberErr == nil {
			return nil, fmt.Errorf("user is already a workspace member")
		} else if !errors.Is(memberErr, repository.ErrMembershipNotFound) {
			return nil, memberErr
		}
	} else if !errors.Is(err, repository.ErrUserNotFound) {
		return nil, err
	}

	if pending, pendingErr := s.invites.FindPendingByWorkspaceAndEmail(ctx, workspaceID, normalizedEmail); pendingErr == nil {
		return s.refreshInvite(ctx, pending)
	} else if !errors.Is(pendingErr, repository.ErrInviteNotFound) {
		return nil, pendingErr
	}

	token, err := newInviteToken()
	if err != nil {
		return nil, err
	}

	invite := &domain.WorkspaceInvite{
		WorkspaceID: workspaceID,
		Email:       normalizedEmail,
		Role:        role,
		Token:       token,
		InvitedByID: inviter.ID,
		Status:      domain.InviteStatusPending,
		ExpiresAt:   time.Now().UTC().Add(inviteTTL),
	}
	if err := s.invites.Create(ctx, invite); err != nil {
		return nil, err
	}
	return invite, nil
}

func (s *InviteService) ListForWorkspace(ctx context.Context, clerkUserID string, workspaceID uuid.UUID) ([]domain.WorkspaceInvite, error) {
	if err := s.requireWorkspaceAdmin(ctx, clerkUserID, workspaceID); err != nil {
		return nil, err
	}
	return s.invites.ListByWorkspace(ctx, workspaceID)
}

func (s *InviteService) ListForCurrentUser(ctx context.Context, clerkUserID string) ([]InviteView, error) {
	user, err := s.users.FindByClerkID(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	invites, err := s.invites.ListPendingByEmail(ctx, user.Email)
	if err != nil {
		return nil, err
	}

	views := make([]InviteView, 0, len(invites))
	for _, invite := range invites {
		view, err := s.toInviteView(ctx, invite)
		if err != nil {
			return nil, err
		}
		views = append(views, view)
	}
	return views, nil
}

func (s *InviteService) Accept(ctx context.Context, clerkUserID, token string) (*WorkspaceListItem, error) {
	user, err := s.users.FindByClerkID(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	invite, err := s.invites.FindByToken(ctx, strings.TrimSpace(token))
	if err != nil {
		return nil, err
	}
	if invite.Status != domain.InviteStatusPending {
		return nil, fmt.Errorf("invite is no longer active")
	}
	if invite.IsExpired(time.Now().UTC()) {
		return nil, fmt.Errorf("invite has expired")
	}
	if !strings.EqualFold(user.Email, invite.Email) {
		return nil, fmt.Errorf("invite email does not match signed-in account")
	}

	if _, memberErr := s.workspaces.GetMembership(ctx, invite.WorkspaceID, user.ID); memberErr == nil {
		invite.Status = domain.InviteStatusAccepted
		_ = s.invites.Save(ctx, invite)
		return s.workspaceItem(ctx, invite.WorkspaceID, user.ID)
	} else if !errors.Is(memberErr, repository.ErrMembershipNotFound) {
		return nil, memberErr
	}

	member := &domain.WorkspaceMember{
		WorkspaceID: invite.WorkspaceID,
		UserID:      user.ID,
		Role:        invite.Role,
	}
	if err := s.workspaces.CreateMember(ctx, member); err != nil {
		return nil, err
	}

	invite.Status = domain.InviteStatusAccepted
	if err := s.invites.Save(ctx, invite); err != nil {
		return nil, err
	}

	return s.workspaceItem(ctx, invite.WorkspaceID, user.ID)
}

func (s *InviteService) Revoke(ctx context.Context, clerkUserID string, workspaceID, inviteID uuid.UUID) error {
	if err := s.requireWorkspaceAdmin(ctx, clerkUserID, workspaceID); err != nil {
		return err
	}

	invite, err := s.invites.FindByID(ctx, inviteID)
	if err != nil {
		return err
	}
	if invite.WorkspaceID != workspaceID {
		return repository.ErrInviteNotFound
	}
	if invite.Status != domain.InviteStatusPending {
		return fmt.Errorf("only pending invites can be revoked")
	}

	invite.Status = domain.InviteStatusRevoked
	return s.invites.Save(ctx, invite)
}

func (s *InviteService) Resend(ctx context.Context, clerkUserID string, workspaceID, inviteID uuid.UUID) (*domain.WorkspaceInvite, error) {
	if err := s.requireWorkspaceAdmin(ctx, clerkUserID, workspaceID); err != nil {
		return nil, err
	}

	invite, err := s.invites.FindByID(ctx, inviteID)
	if err != nil {
		return nil, err
	}
	if invite.WorkspaceID != workspaceID {
		return nil, repository.ErrInviteNotFound
	}
	if invite.Status != domain.InviteStatusPending {
		return nil, fmt.Errorf("only pending invites can be resent")
	}

	return s.refreshInvite(ctx, invite)
}

func (s *InviteService) refreshInvite(ctx context.Context, invite *domain.WorkspaceInvite) (*domain.WorkspaceInvite, error) {
	token, err := newInviteToken()
	if err != nil {
		return nil, err
	}
	invite.Token = token
	invite.ExpiresAt = time.Now().UTC().Add(inviteTTL)
	invite.Status = domain.InviteStatusPending
	if err := s.invites.Save(ctx, invite); err != nil {
		return nil, err
	}
	return invite, nil
}

func (s *InviteService) requireWorkspaceAdmin(ctx context.Context, clerkUserID string, workspaceID uuid.UUID) error {
	user, err := s.users.FindByClerkID(ctx, clerkUserID)
	if err != nil {
		return err
	}
	member, err := s.workspaces.GetMembership(ctx, workspaceID, user.ID)
	if err != nil {
		return err
	}
	if member.Role != domain.RoleAdmin {
		return fmt.Errorf("only workspace admins can manage invites")
	}
	return nil
}

func (s *InviteService) workspaceItem(ctx context.Context, workspaceID, userID uuid.UUID) (*WorkspaceListItem, error) {
	workspace, err := s.workspaces.FindByID(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	member, err := s.workspaces.GetMembership(ctx, workspaceID, userID)
	if err != nil {
		return nil, err
	}
	return &WorkspaceListItem{Workspace: *workspace, Role: member.Role}, nil
}

func (s *InviteService) toInviteView(ctx context.Context, invite domain.WorkspaceInvite) (InviteView, error) {
	workspace, err := s.workspaces.FindByID(ctx, invite.WorkspaceID)
	if err != nil {
		return InviteView{}, err
	}

	inviter, err := s.users.FindByID(ctx, invite.InvitedByID)
	if err != nil {
		return InviteView{}, err
	}

	return InviteView{
		Invite:         invite,
		WorkspaceName:  workspace.Name,
		WorkspaceSlug:  workspace.Slug,
		InvitedByEmail: inviter.Email,
		InvitedByName:  strings.TrimSpace(inviter.FirstName + " " + inviter.LastName),
	}, nil
}

func newInviteToken() (string, error) {
	buf := make([]byte, 24)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}
