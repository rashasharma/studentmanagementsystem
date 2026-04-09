from django.contrib import admin
from .models import StudentProfile

class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('get_roll_number', 'user', 'contact_number', 'batch')
    
    # THIS IS THE LINE THAT CREATES THE BATCH DROPDOWNS ON THE LIST PAGE:
    list_editable = ('batch',) 
    
    search_fields = ('user__username', 'user__first_name', 'user__last_name')
    list_filter = ('batch', 'enrollment_date')
    autocomplete_fields = ['user'] 

    def get_roll_number(self, obj):
        return obj.user.username
    get_roll_number.short_description = 'Roll Number'

    def has_add_permission(self, request):
        return False

admin.site.register(StudentProfile, StudentProfileAdmin)