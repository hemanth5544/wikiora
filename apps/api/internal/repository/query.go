package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/wikiora/wikiora/apps/api/internal/domain"
	"gorm.io/gorm"
)

var ErrQueryNotFound = errors.New("query not found")

type QueryRepository struct {
	db *gorm.DB
}

func NewQueryRepository(db *gorm.DB) *QueryRepository {
	return &QueryRepository{db: db}
}

func (r *QueryRepository) Create(ctx context.Context, query *domain.Query) error {
	return r.db.WithContext(ctx).Create(query).Error
}

func (r *QueryRepository) FindByID(ctx context.Context, workspaceID, queryID uuid.UUID) (*domain.Query, error) {
	var query domain.Query
	err := r.db.WithContext(ctx).
		Where("id = ? AND workspace_id = ?", queryID, workspaceID).
		First(&query).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrQueryNotFound
	}
	if err != nil {
		return nil, err
	}
	return &query, nil
}

func (r *QueryRepository) ListByWorkspaceID(ctx context.Context, workspaceID uuid.UUID) ([]domain.Query, error) {
	var queries []domain.Query
	err := r.db.WithContext(ctx).
		Where("workspace_id = ?", workspaceID).
		Order("created_at DESC").
		Find(&queries).Error
	return queries, err
}

type AccessibleQuery struct {
	domain.Query
	WorkspaceName string `gorm:"column:workspace_name"`
}

func (r *QueryRepository) ListAccessibleByUserID(ctx context.Context, userID uuid.UUID) ([]AccessibleQuery, error) {
	var rows []AccessibleQuery
	err := r.db.WithContext(ctx).
		Table("queries").
		Select("queries.*, workspaces.name as workspace_name").
		Joins("JOIN workspaces ON workspaces.id = queries.workspace_id").
		Joins("JOIN workspace_members ON workspace_members.workspace_id = queries.workspace_id").
		Where("workspace_members.user_id = ?", userID).
		Where("queries.deleted_at IS NULL").
		Where("workspaces.deleted_at IS NULL").
		Order("queries.created_at DESC").
		Scan(&rows).Error
	return rows, err
}

func (r *QueryRepository) ListCreatedByUserID(ctx context.Context, userID uuid.UUID) ([]AccessibleQuery, error) {
	var rows []AccessibleQuery
	err := r.db.WithContext(ctx).
		Table("queries").
		Select("queries.*, workspaces.name as workspace_name").
		Joins("JOIN workspaces ON workspaces.id = queries.workspace_id").
		Joins("JOIN workspace_members ON workspace_members.workspace_id = queries.workspace_id").
		Where("workspace_members.user_id = ?", userID).
		Where("queries.author_id = ?", userID).
		Where("queries.deleted_at IS NULL").
		Where("workspaces.deleted_at IS NULL").
		Order("queries.created_at DESC").
		Scan(&rows).Error
	return rows, err
}

func (r *QueryRepository) ListRepliedByUserID(ctx context.Context, userID uuid.UUID) ([]AccessibleQuery, error) {
	repliedQueryIDs := r.db.WithContext(ctx).
		Model(&domain.QueryReply{}).
		Select("DISTINCT query_id").
		Where("author_id = ?", userID)

	var rows []AccessibleQuery
	err := r.db.WithContext(ctx).
		Table("queries").
		Select("queries.*, workspaces.name as workspace_name").
		Joins("JOIN workspaces ON workspaces.id = queries.workspace_id").
		Joins("JOIN workspace_members ON workspace_members.workspace_id = queries.workspace_id").
		Where("workspace_members.user_id = ?", userID).
		Where("queries.id IN (?)", repliedQueryIDs).
		Where("queries.deleted_at IS NULL").
		Where("workspaces.deleted_at IS NULL").
		Order("queries.updated_at DESC").
		Scan(&rows).Error
	return rows, err
}

func (r *QueryRepository) Save(ctx context.Context, query *domain.Query) error {
	return r.db.WithContext(ctx).Save(query).Error
}
