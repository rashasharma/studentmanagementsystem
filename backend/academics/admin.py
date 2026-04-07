from django.contrib import admin
from .models import AcademicYear, Batch, Course, CourseSection, SectionSchedule, Enrollment, Attendance, Notification

# Tell Django to display schedules inside the Course Section view!
class SectionScheduleInline(admin.TabularInline):
    model = SectionSchedule
    extra = 1 # Shows 1 empty row by default

# Customize the CourseSection admin view
class CourseSectionAdmin(admin.ModelAdmin):
    list_display = ('course', 'batch', 'instructor')
    inlines = [SectionScheduleInline] # Attach the schedules here!

admin.site.register(AcademicYear)
admin.site.register(Batch)
admin.site.register(Course)
admin.site.register(CourseSection, CourseSectionAdmin) # Register with the custom view
admin.site.register(Enrollment)
admin.site.register(Attendance)
admin.site.register(Notification)