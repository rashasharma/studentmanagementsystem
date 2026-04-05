from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    # This takes the standard user layout and adds a new section for our custom fields
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Roles', {'fields': ('role',)}),
    )
    
    # This makes the role visible on the main list screen too!
    list_display = ('username', 'email', 'role', 'is_staff')

# Register the model with our new customized admin class
admin.site.register(CustomUser, CustomUserAdmin)