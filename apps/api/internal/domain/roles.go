package domain

const (
	RoleAdmin  = "admin"
	RoleMember = "member"
	RoleUser   = "user"
)

func IsValidWorkspaceRole(role string) bool {
	switch role {
	case RoleAdmin, RoleMember, RoleUser:
		return true
	default:
		return false
	}
}
