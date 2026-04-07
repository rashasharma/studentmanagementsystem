from rest_framework import permissions

class IsStudent(permissions.BasePermission):
    """Allows access only to users with the STUDENT role."""
    message = "Access Denied: You must be a Student to perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'STUDENT')


class IsFaculty(permissions.BasePermission):
    """Allows access only to users with the FACULTY role."""
    message = "Access Denied: You must be a Faculty member to perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'FACULTY')


class IsAdmin(permissions.BasePermission):
    """Allows access only to users with the ADMIN role."""
    message = "Access Denied: You must be a System Admin to perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')


class IsAdminOrFaculty(permissions.BasePermission):
    """Allows access to both ADMIN and FACULTY roles (useful for Analytics)."""
    message = "Access Denied: Only Staff and Admins can view this."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'FACULTY'])
class IsFinance(permissions.BasePermission):
    """Allows access only to users with the FINANCE role."""
    message = "Access Denied: You must be Finance Staff to perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'FINANCE')