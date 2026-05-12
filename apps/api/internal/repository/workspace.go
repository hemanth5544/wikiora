package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/wikiora/wikiora/apps/api/internal/domain"
	"gorm.io/gorm"
)

var ErrWorkspaceNotFound = errors.New("workspace not found")
var ErrMembershipNotFound = errors.New("workspace membership not found")

type WorkspaceRepository struct {
	db *gorm.DB
}

func NewWorkspaceRepository(db *gorm.DB) *WorkspaceRepository {
	return &WorkspaceRepository{db: db}
}

type WorkspaceWithRole struct {
	domain.Workspace
	Role string `gorm:"column:role"`
}

func (r *WorkspaceRepository) CreateWithOwner(ctx context.Context, workspace *domain.Workspace, ownerID uuid.UUID) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(workspace).Error; err != nil {
			return err
		}

		member := &domain.WorkspaceMember{
			WorkspaceID: workspace.ID,
			UserID:      ownerID,
			Role:        domain.RoleAdmin,
		}
		return tx.Create(member).Error
	})
}

func (r *WorkspaceRepository) ListByUserID(ctx context.Context, userID uuid.UUID) ([]WorkspaceWithRole, error) {
	var rows []WorkspaceWithRole
	err := r.db.WithContext(ctx).
		Table("workspaces").
		Select("workspaces.*, workspace_members.role").
		Joins("JOIN workspace_members ON workspace_members.workspace_id = workspaces.id").
		Where("workspace_members.user_id = ?", userID).
		Where("workspaces.deleted_at IS NULL").
		Order("workspaces.created_at DESC").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	return rows, nil
}

func (r *WorkspaceRepository) FindByID(ctx context.Context, workspaceID uuid.UUID) (*domain.Workspace, error) {
	var workspace domain.Workspace
	err := r.db.WithContext(ctx).Where("id = ?", workspaceID).First(&workspace).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrWorkspaceNotFound
	}
	if err != nil {
		return nil, err
	}
	return &workspace, nil
}

func (r *WorkspaceRepository) Update(ctx context.Context, workspace *domain.Workspace) error {
	return r.db.WithContext(ctx).Save(workspace).Error
}

func (r *WorkspaceRepository) SlugExists(ctx context.Context, slug string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.Workspace{}).Where("slug = ?", slug).Count(&count).Error
	return count > 0, err
}

func (r *WorkspaceRepository) GetMembership(ctx context.Context, workspaceID, userID uuid.UUID) (*domain.WorkspaceMember, error) {
	var member domain.WorkspaceMember
	err := r.db.WithContext(ctx).
		Where("workspace_id = ? AND user_id = ?", workspaceID, userID).
		First(&member).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrMembershipNotFound
	}
	if err != nil {
		return nil, err
	}
	return &member, nil
}

func (r *WorkspaceRepository) ListMembers(ctx context.Context, workspaceID uuid.UUID) ([]domain.WorkspaceMember, error) {
	var members []domain.WorkspaceMember
	err := r.db.WithContext(ctx).
		Where("workspace_id = ?", workspaceID).
		Order("created_at ASC").
		Find(&members).Error
	return members, err
}

func (r *WorkspaceRepository) CreateMember(ctx context.Context, member *domain.WorkspaceMember) error {
	return r.db.WithContext(ctx).Create(member).Error
}

func (r *WorkspaceRepository) UpdateMemberRole(ctx context.Context, workspaceID, userID uuid.UUID, role string) error {
	result := r.db.WithContext(ctx).
		Model(&domain.WorkspaceMember{}).
		Where("workspace_id = ? AND user_id = ?", workspaceID, userID).
		Update("role", role)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrMembershipNotFound
	}
	return nil
}
