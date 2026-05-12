package repository

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/wikiora/wikiora/apps/api/internal/domain"
	"gorm.io/gorm"
)

var ErrInviteNotFound = errors.New("workspace invite not found")

type InviteRepository struct {
	db *gorm.DB
}

func NewInviteRepository(db *gorm.DB) *InviteRepository {
	return &InviteRepository{db: db}
}

func (r *InviteRepository) Create(ctx context.Context, invite *domain.WorkspaceInvite) error {
	return r.db.WithContext(ctx).Create(invite).Error
}

func (r *InviteRepository) Save(ctx context.Context, invite *domain.WorkspaceInvite) error {
	return r.db.WithContext(ctx).Save(invite).Error
}

func (r *InviteRepository) FindByID(ctx context.Context, inviteID uuid.UUID) (*domain.WorkspaceInvite, error) {
	var invite domain.WorkspaceInvite
	err := r.db.WithContext(ctx).Where("id = ?", inviteID).First(&invite).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrInviteNotFound
	}
	if err != nil {
		return nil, err
	}
	return &invite, nil
}

func (r *InviteRepository) FindByToken(ctx context.Context, token string) (*domain.WorkspaceInvite, error) {
	var invite domain.WorkspaceInvite
	err := r.db.WithContext(ctx).Where("token = ?", token).First(&invite).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrInviteNotFound
	}
	if err != nil {
		return nil, err
	}
	return &invite, nil
}

func (r *InviteRepository) FindPendingByWorkspaceAndEmail(ctx context.Context, workspaceID uuid.UUID, email string) (*domain.WorkspaceInvite, error) {
	var invite domain.WorkspaceInvite
	err := r.db.WithContext(ctx).
		Where("workspace_id = ? AND email = ? AND status = ?", workspaceID, strings.ToLower(strings.TrimSpace(email)), domain.InviteStatusPending).
		First(&invite).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrInviteNotFound
	}
	if err != nil {
		return nil, err
	}
	return &invite, nil
}

func (r *InviteRepository) ListByWorkspace(ctx context.Context, workspaceID uuid.UUID) ([]domain.WorkspaceInvite, error) {
	var invites []domain.WorkspaceInvite
	err := r.db.WithContext(ctx).
		Where("workspace_id = ?", workspaceID).
		Order("created_at DESC").
		Find(&invites).Error
	return invites, err
}

func (r *InviteRepository) ListPendingByEmail(ctx context.Context, email string) ([]domain.WorkspaceInvite, error) {
	var invites []domain.WorkspaceInvite
	err := r.db.WithContext(ctx).
		Where("email = ? AND status = ?", strings.ToLower(strings.TrimSpace(email)), domain.InviteStatusPending).
		Where("expires_at > ?", time.Now().UTC()).
		Order("created_at DESC").
		Find(&invites).Error
	return invites, err
}
