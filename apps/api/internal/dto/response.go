package dto

import (
	"time"

	"github.com/wikiora/wikiora/apps/api/internal/domain"
	"github.com/wikiora/wikiora/apps/api/internal/service"
)

type WorkspaceResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description,omitempty"`
	Visibility  string `json:"visibility"`
	LogoURL     string `json:"logoUrl,omitempty"`
	OwnerID     string `json:"ownerId"`
	Role        string `json:"role,omitempty"`
}

func NewWorkspaceResponse(item service.WorkspaceListItem) WorkspaceResponse {
	return WorkspaceResponse{
		ID:          item.Workspace.ID.String(),
		Name:        item.Workspace.Name,
		Slug:        item.Workspace.Slug,
		Description: item.Workspace.Description,
		Visibility:  item.Workspace.Visibility,
		LogoURL:     item.Workspace.LogoURL,
		OwnerID:     item.Workspace.OwnerID.String(),
		Role:        item.Role,
	}
}

type WorkspaceMemberResponse struct {
	ID          string `json:"id"`
	WorkspaceID string `json:"workspaceId"`
	UserID      string `json:"userId"`
	Role        string `json:"role"`
	Email       string `json:"email"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
}

func NewWorkspaceMemberResponse(member service.WorkspaceMemberView) WorkspaceMemberResponse {
	return WorkspaceMemberResponse{
		ID:          member.ID.String(),
		WorkspaceID: member.WorkspaceID.String(),
		UserID:      member.UserID.String(),
		Role:        member.Role,
		Email:       member.Email,
		FirstName:   member.FirstName,
		LastName:    member.LastName,
	}
}

type WorkspaceInviteResponse struct {
	ID          string `json:"id"`
	WorkspaceID string `json:"workspaceId"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	Token       string `json:"token,omitempty"`
	Status      string `json:"status"`
	ExpiresAt   string `json:"expiresAt"`
	InvitedByID string `json:"invitedById"`
	CreatedAt   string `json:"createdAt"`
}

func NewWorkspaceInviteResponse(invite domain.WorkspaceInvite, includeToken bool) WorkspaceInviteResponse {
	response := WorkspaceInviteResponse{
		ID:          invite.ID.String(),
		WorkspaceID: invite.WorkspaceID.String(),
		Email:       invite.Email,
		Role:        invite.Role,
		Status:      invite.Status,
		ExpiresAt:   invite.ExpiresAt.UTC().Format(time.RFC3339),
		InvitedByID: invite.InvitedByID.String(),
		CreatedAt:   invite.CreatedAt.UTC().Format(time.RFC3339),
	}
	if includeToken {
		response.Token = invite.Token
	}
	return response
}

type PendingInviteResponse struct {
	ID             string `json:"id"`
	WorkspaceID    string `json:"workspaceId"`
	WorkspaceName  string `json:"workspaceName"`
	WorkspaceSlug  string `json:"workspaceSlug"`
	Email          string `json:"email"`
	Role           string `json:"role"`
	Token          string `json:"token"`
	Status         string `json:"status"`
	ExpiresAt      string `json:"expiresAt"`
	InvitedByID    string `json:"invitedById"`
	InvitedByEmail string `json:"invitedByEmail"`
	InvitedByName  string `json:"invitedByName"`
	CreatedAt      string `json:"createdAt"`
}

func NewPendingInviteResponse(view service.InviteView) PendingInviteResponse {
	return PendingInviteResponse{
		ID:             view.Invite.ID.String(),
		WorkspaceID:    view.Invite.WorkspaceID.String(),
		WorkspaceName:  view.WorkspaceName,
		WorkspaceSlug:  view.WorkspaceSlug,
		Email:          view.Invite.Email,
		Role:           view.Invite.Role,
		Token:          view.Invite.Token,
		Status:         view.Invite.Status,
		ExpiresAt:      view.Invite.ExpiresAt.UTC().Format(time.RFC3339),
		InvitedByID:    view.Invite.InvitedByID.String(),
		InvitedByEmail: view.InvitedByEmail,
		InvitedByName:  view.InvitedByName,
		CreatedAt:      view.Invite.CreatedAt.UTC().Format(time.RFC3339),
	}
}

type QueryResponse struct {
	ID              string `json:"id"`
	WorkspaceID     string `json:"workspaceId"`
	AuthorID        string `json:"authorId"`
	Title           string `json:"title"`
	Body            string `json:"body"`
	Status          string `json:"status"`
	AuthorEmail     string `json:"authorEmail"`
	AuthorFirstName string `json:"authorFirstName"`
	AuthorLastName  string `json:"authorLastName"`
	AuthorAvatarURL string `json:"authorAvatarUrl,omitempty"`
	AuthorRole      string `json:"authorRole"`
	WorkspaceName   string `json:"workspaceName,omitempty"`
	ReplyCount      int    `json:"replyCount"`
	CreatedAt       string `json:"createdAt"`
	UpdatedAt       string `json:"updatedAt"`
}

func NewQueryResponse(view service.QueryView) QueryResponse {
	return QueryResponse{
		ID:              view.Query.ID.String(),
		WorkspaceID:     view.Query.WorkspaceID.String(),
		AuthorID:        view.Query.AuthorID.String(),
		Title:           view.Query.Title,
		Body:            view.Query.Body,
		Status:          view.Query.Status,
		AuthorEmail:     view.AuthorEmail,
		AuthorFirstName: view.AuthorFirstName,
		AuthorLastName:  view.AuthorLastName,
		AuthorAvatarURL: view.AuthorAvatarURL,
		AuthorRole:      view.AuthorRole,
		WorkspaceName:   view.WorkspaceName,
		ReplyCount:      view.ReplyCount,
		CreatedAt:       view.Query.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:       view.Query.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

type QueryReplyResponse struct {
	ID              string  `json:"id"`
	QueryID         string  `json:"queryId"`
	WorkspaceID     string  `json:"workspaceId"`
	AuthorID        string  `json:"authorId"`
	ParentReplyID   *string `json:"parentReplyId,omitempty"`
	Body            string  `json:"body"`
	AuthorEmail     string  `json:"authorEmail"`
	AuthorFirstName string  `json:"authorFirstName"`
	AuthorLastName  string  `json:"authorLastName"`
	AuthorAvatarURL string  `json:"authorAvatarUrl,omitempty"`
	AuthorRole      string  `json:"authorRole"`
	CreatedAt       string  `json:"createdAt"`
	UpdatedAt       string  `json:"updatedAt"`
}

func NewQueryReplyResponse(view service.QueryReplyView) QueryReplyResponse {
	var parentReplyID *string
	if view.Reply.ParentReplyID != nil {
		value := view.Reply.ParentReplyID.String()
		parentReplyID = &value
	}

	return QueryReplyResponse{
		ID:              view.Reply.ID.String(),
		QueryID:         view.Reply.QueryID.String(),
		WorkspaceID:     view.Reply.WorkspaceID.String(),
		AuthorID:        view.Reply.AuthorID.String(),
		ParentReplyID:   parentReplyID,
		Body:            view.Reply.Body,
		AuthorEmail:     view.AuthorEmail,
		AuthorFirstName: view.AuthorFirstName,
		AuthorLastName:  view.AuthorLastName,
		AuthorAvatarURL: view.AuthorAvatarURL,
		AuthorRole:      view.AuthorRole,
		CreatedAt:       view.Reply.CreatedAt.UTC().Format(time.RFC3339),
		UpdatedAt:       view.Reply.UpdatedAt.UTC().Format(time.RFC3339),
	}
}

type QueryDetailResponse struct {
	Query   QueryResponse        `json:"query"`
	Replies []QueryReplyResponse `json:"replies"`
}

func NewQueryDetailResponse(view service.QueryDetailView) QueryDetailResponse {
	replies := make([]QueryReplyResponse, 0, len(view.Replies))
	for _, reply := range view.Replies {
		replies = append(replies, NewQueryReplyResponse(reply))
	}
	return QueryDetailResponse{
		Query:   NewQueryResponse(view.Query),
		Replies: replies,
	}
}

type UserResponse struct {
	ID          string `json:"id"`
	ClerkUserID string `json:"clerkUserId"`
	Email       string `json:"email"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	AvatarURL   string `json:"avatarUrl,omitempty"`
	GlobalRole  string `json:"globalRole"`
}

func NewUserResponse(user *domain.User) UserResponse {
	return UserResponse{
		ID:          user.ID.String(),
		ClerkUserID: user.ClerkUserID,
		Email:       user.Email,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		AvatarURL:   user.AvatarURL,
		GlobalRole:  user.GlobalRole,
	}
}

type ErrorResponse struct {
	Error struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}
