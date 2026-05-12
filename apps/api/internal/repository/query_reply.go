package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/wikiora/wikiora/apps/api/internal/domain"
	"gorm.io/gorm"
)

var ErrQueryReplyNotFound = errors.New("query reply not found")

type QueryReplyRepository struct {
	db *gorm.DB
}

func NewQueryReplyRepository(db *gorm.DB) *QueryReplyRepository {
	return &QueryReplyRepository{db: db}
}

func (r *QueryReplyRepository) Create(ctx context.Context, reply *domain.QueryReply) error {
	return r.db.WithContext(ctx).Create(reply).Error
}

func (r *QueryReplyRepository) FindByID(ctx context.Context, queryID, replyID uuid.UUID) (*domain.QueryReply, error) {
	var reply domain.QueryReply
	err := r.db.WithContext(ctx).
		Where("id = ? AND query_id = ?", replyID, queryID).
		First(&reply).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrQueryReplyNotFound
	}
	if err != nil {
		return nil, err
	}
	return &reply, nil
}

func (r *QueryReplyRepository) ListByQueryID(ctx context.Context, queryID uuid.UUID) ([]domain.QueryReply, error) {
	var replies []domain.QueryReply
	err := r.db.WithContext(ctx).
		Where("query_id = ?", queryID).
		Order("created_at ASC").
		Find(&replies).Error
	return replies, err
}

func (r *QueryReplyRepository) CountByQueryIDs(ctx context.Context, queryIDs []uuid.UUID) (map[uuid.UUID]int, error) {
	counts := make(map[uuid.UUID]int, len(queryIDs))
	if len(queryIDs) == 0 {
		return counts, nil
	}

	type row struct {
		QueryID uuid.UUID
		Count   int
	}
	var rows []row
	err := r.db.WithContext(ctx).
		Model(&domain.QueryReply{}).
		Select("query_id, COUNT(*) as count").
		Where("query_id IN ?", queryIDs).
		Group("query_id").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	for _, entry := range rows {
		counts[entry.QueryID] = entry.Count
	}
	return counts, nil
}
