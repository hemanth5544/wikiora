package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/wikiora/wikiora/apps/api/internal/domain"
	"github.com/wikiora/wikiora/apps/api/internal/repository"
)

type QueryService struct {
	queries    *repository.QueryRepository
	replies    *repository.QueryReplyRepository
	workspaces *repository.WorkspaceRepository
	users      *repository.UserRepository
}

func NewQueryService(
	queries *repository.QueryRepository,
	replies *repository.QueryReplyRepository,
	workspaces *repository.WorkspaceRepository,
	users *repository.UserRepository,
) *QueryService {
	return &QueryService{queries: queries, replies: replies, workspaces: workspaces, users: users}
}

type CreateQueryInput struct {
	Title string
	Body  string
}

type CreateQueryReplyInput struct {
	Body          string
	ParentReplyID *uuid.UUID
}

type QueryView struct {
	Query           domain.Query
	WorkspaceName   string
	AuthorEmail     string
	AuthorFirstName string
	AuthorLastName  string
	AuthorAvatarURL string
	AuthorRole      string
	ReplyCount      int
}

type QueryReplyView struct {
	Reply           domain.QueryReply
	AuthorEmail     string
	AuthorFirstName string
	AuthorLastName  string
	AuthorAvatarURL string
	AuthorRole      string
}

type QueryDetailView struct {
	Query   QueryView
	Replies []QueryReplyView
}

func (s *QueryService) List(ctx context.Context, clerkUserID string, workspaceID uuid.UUID) ([]QueryView, error) {
	user, err := s.users.FindByClerkID(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	if _, err := s.workspaces.GetMembership(ctx, workspaceID, user.ID); err != nil {
		return nil, err
	}

	queries, err := s.queries.ListByWorkspaceID(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	queryIDs := make([]uuid.UUID, 0, len(queries))
	for _, query := range queries {
		queryIDs = append(queryIDs, query.ID)
	}
	replyCounts, err := s.replies.CountByQueryIDs(ctx, queryIDs)
	if err != nil {
		return nil, err
	}

	views := make([]QueryView, 0, len(queries))
	for _, query := range queries {
		view, err := s.toQueryView(ctx, workspaceID, query, replyCounts[query.ID])
		if err != nil {
			return nil, err
		}
		views = append(views, view)
	}
	return views, nil
}

func (s *QueryService) ListFeed(ctx context.Context, clerkUserID string) ([]QueryView, error) {
	user, err := s.users.FindByClerkID(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	queries, err := s.queries.ListAccessibleByUserID(ctx, user.ID)
	if err != nil {
		return nil, err
	}

	queryIDs := make([]uuid.UUID, 0, len(queries))
	for _, query := range queries {
		queryIDs = append(queryIDs, query.ID)
	}
	replyCounts, err := s.replies.CountByQueryIDs(ctx, queryIDs)
	if err != nil {
		return nil, err
	}

	views := make([]QueryView, 0, len(queries))
	for _, query := range queries {
		view, err := s.toQueryView(ctx, query.WorkspaceID, query.Query, replyCounts[query.ID])
		if err != nil {
			return nil, err
		}
		view.WorkspaceName = query.WorkspaceName
		views = append(views, view)
	}
	return views, nil
}

func (s *QueryService) Create(ctx context.Context, clerkUserID string, workspaceID uuid.UUID, input CreateQueryInput) (*QueryView, error) {
	user, err := s.users.FindByClerkID(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	if _, err := s.workspaces.GetMembership(ctx, workspaceID, user.ID); err != nil {
		return nil, err
	}

	title := strings.TrimSpace(input.Title)
	if title == "" {
		return nil, fmt.Errorf("title is required")
	}
	body := strings.TrimSpace(input.Body)
	if body == "" {
		return nil, fmt.Errorf("body is required")
	}

	query := &domain.Query{
		WorkspaceID: workspaceID,
		AuthorID:    user.ID,
		Title:       title,
		Body:        body,
		Status:      domain.QueryStatusOpen,
	}
	if err := s.queries.Create(ctx, query); err != nil {
		return nil, err
	}

	view, err := s.toQueryView(ctx, workspaceID, *query, 0)
	if err != nil {
		return nil, err
	}
	return &view, nil
}

func (s *QueryService) Get(ctx context.Context, clerkUserID string, workspaceID, queryID uuid.UUID) (*QueryView, error) {
	user, err := s.users.FindByClerkID(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	if _, err := s.workspaces.GetMembership(ctx, workspaceID, user.ID); err != nil {
		return nil, err
	}

	query, err := s.queries.FindByID(ctx, workspaceID, queryID)
	if err != nil {
		return nil, err
	}

	replyCounts, err := s.replies.CountByQueryIDs(ctx, []uuid.UUID{query.ID})
	if err != nil {
		return nil, err
	}

	view, err := s.toQueryView(ctx, workspaceID, *query, replyCounts[query.ID])
	if err != nil {
		return nil, err
	}
	return &view, nil
}

func (s *QueryService) GetDetail(ctx context.Context, clerkUserID string, workspaceID, queryID uuid.UUID) (*QueryDetailView, error) {
	queryView, err := s.Get(ctx, clerkUserID, workspaceID, queryID)
	if err != nil {
		return nil, err
	}

	replies, err := s.ListReplies(ctx, clerkUserID, workspaceID, queryID)
	if err != nil {
		return nil, err
	}

	return &QueryDetailView{Query: *queryView, Replies: replies}, nil
}

func (s *QueryService) ListReplies(ctx context.Context, clerkUserID string, workspaceID, queryID uuid.UUID) ([]QueryReplyView, error) {
	user, err := s.users.FindByClerkID(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	if _, err := s.workspaces.GetMembership(ctx, workspaceID, user.ID); err != nil {
		return nil, err
	}

	if _, err := s.queries.FindByID(ctx, workspaceID, queryID); err != nil {
		return nil, err
	}

	replies, err := s.replies.ListByQueryID(ctx, queryID)
	if err != nil {
		return nil, err
	}

	views := make([]QueryReplyView, 0, len(replies))
	for _, reply := range replies {
		view, err := s.toReplyView(ctx, workspaceID, reply)
		if err != nil {
			return nil, err
		}
		views = append(views, view)
	}
	return views, nil
}

func (s *QueryService) CreateReply(ctx context.Context, clerkUserID string, workspaceID, queryID uuid.UUID, input CreateQueryReplyInput) (*QueryReplyView, error) {
	user, err := s.users.FindByClerkID(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	if _, err := s.workspaces.GetMembership(ctx, workspaceID, user.ID); err != nil {
		return nil, err
	}

	if _, err := s.queries.FindByID(ctx, workspaceID, queryID); err != nil {
		return nil, err
	}

	body := strings.TrimSpace(input.Body)
	if body == "" {
		return nil, fmt.Errorf("body is required")
	}

	if input.ParentReplyID != nil {
		parent, err := s.replies.FindByID(ctx, queryID, *input.ParentReplyID)
		if err != nil {
			return nil, err
		}
		if parent.QueryID != queryID {
			return nil, repository.ErrQueryReplyNotFound
		}
	}

	reply := &domain.QueryReply{
		QueryID:       queryID,
		WorkspaceID:   workspaceID,
		AuthorID:      user.ID,
		ParentReplyID: input.ParentReplyID,
		Body:          body,
	}
	if err := s.replies.Create(ctx, reply); err != nil {
		return nil, err
	}

	view, err := s.toReplyView(ctx, workspaceID, *reply)
	if err != nil {
		return nil, err
	}
	return &view, nil
}

func (s *QueryService) UpdateStatus(ctx context.Context, clerkUserID string, workspaceID, queryID uuid.UUID, status string) (*QueryView, error) {
	if !domain.IsValidQueryStatus(status) {
		return nil, fmt.Errorf("invalid query status")
	}

	user, err := s.users.FindByClerkID(ctx, clerkUserID)
	if err != nil {
		return nil, err
	}

	if _, err := s.workspaces.GetMembership(ctx, workspaceID, user.ID); err != nil {
		return nil, err
	}

	query, err := s.queries.FindByID(ctx, workspaceID, queryID)
	if err != nil {
		return nil, err
	}

	query.Status = status
	if err := s.queries.Save(ctx, query); err != nil {
		return nil, err
	}

	replyCounts, err := s.replies.CountByQueryIDs(ctx, []uuid.UUID{query.ID})
	if err != nil {
		return nil, err
	}

	view, err := s.toQueryView(ctx, workspaceID, *query, replyCounts[query.ID])
	if err != nil {
		return nil, err
	}
	return &view, nil
}

func (s *QueryService) toQueryView(ctx context.Context, workspaceID uuid.UUID, query domain.Query, replyCount int) (QueryView, error) {
	author, err := s.users.FindByID(ctx, query.AuthorID)
	if err != nil {
		return QueryView{}, err
	}

	role, err := s.authorRole(ctx, workspaceID, query.AuthorID)
	if err != nil {
		return QueryView{}, err
	}

	return QueryView{
		Query:           query,
		AuthorEmail:     author.Email,
		AuthorFirstName: author.FirstName,
		AuthorLastName:  author.LastName,
		AuthorAvatarURL: author.AvatarURL,
		AuthorRole:      role,
		ReplyCount:      replyCount,
	}, nil
}

func (s *QueryService) toReplyView(ctx context.Context, workspaceID uuid.UUID, reply domain.QueryReply) (QueryReplyView, error) {
	author, err := s.users.FindByID(ctx, reply.AuthorID)
	if err != nil {
		return QueryReplyView{}, err
	}

	role, err := s.authorRole(ctx, workspaceID, reply.AuthorID)
	if err != nil {
		return QueryReplyView{}, err
	}

	return QueryReplyView{
		Reply:           reply,
		AuthorEmail:     author.Email,
		AuthorFirstName: author.FirstName,
		AuthorLastName:  author.LastName,
		AuthorAvatarURL: author.AvatarURL,
		AuthorRole:      role,
	}, nil
}

func (s *QueryService) authorRole(ctx context.Context, workspaceID, userID uuid.UUID) (string, error) {
	member, err := s.workspaces.GetMembership(ctx, workspaceID, userID)
	if err != nil {
		return "", err
	}
	return member.Role, nil
}
