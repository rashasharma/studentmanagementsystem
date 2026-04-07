from django.contrib import admin
from .models import AcademicYear, Batch, Course, CourseSection, SectionSchedule, Enrollment, Attendance, Notification

class SectionScheduleInline(admin.TabularInline):
    model = SectionSchedule
    extra = 1

class CourseSectionAdmin(admin.ModelAdmin):
    list_display = ('course', 'batch', 'instructor')
    inlines = [SectionScheduleInline]

admin.site.register(AcademicYear)
admin.site.register(Batch)
admin.site.register(Course)
admin.site.register(CourseSection, CourseSectionAdmin)
admin.site.register(Enrollment)
admin.site.register(Attendance)
admin.site.register(Notification)