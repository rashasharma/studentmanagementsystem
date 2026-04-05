from django.contrib import admin
from .models import StudentProfile

# This tells the Admin panel to show the StudentProfile table
admin.site.register(StudentProfile)