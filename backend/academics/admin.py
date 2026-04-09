from django.contrib import admin
from .models import AcademicYear, Batch, Course, CourseSection, SectionSchedule, Enrollment, Attendance, Notification

class SectionScheduleInline(admin.TabularInline):
    model = SectionSchedule
    extra = 1

class CourseSectionAdmin(admin.ModelAdmin):
    list_display = ('course', 'get_batches', 'instructor')
    inlines = [SectionScheduleInline]
    filter_horizontal = ('batches',) 

    def get_batches(self, obj):
        return ", ".join([b.name for b in obj.batches.all()])
    get_batches.short_description = 'Assigned Batches'

class BatchAdmin(admin.ModelAdmin):
    list_display = ('name', 'branch', 'academic_year')

class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course_section', 'enrollment_date', 'grade')
    list_filter = ('course_section', 'grade')
    # This turns the giant dropdown into a sleek search bar!
    autocomplete_fields = ['student']

admin.site.register(AcademicYear)
admin.site.register(Batch, BatchAdmin)
admin.site.register(Course)
admin.site.register(CourseSection, CourseSectionAdmin)
admin.site.register(Enrollment, EnrollmentAdmin) 
admin.site.register(Attendance)
admin.site.register(Notification)