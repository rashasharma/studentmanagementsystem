from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    search_fields = ['username', 'email', 'first_name', 'last_name']
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')

    # 1. This adds your custom fields to the "Edit" page (after creation)
    fieldsets = UserAdmin.fieldsets + (
        ('Account Configuration', {'fields': ('role',)}),
    )

    # 2. THIS FIXES YOUR UI: It adds the fields to the initial "Add User" page
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Account Configuration', {
            'classes': ('wide',),
            'fields': ('email', 'role',),
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)