from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models.signals import pre_save
from django.dispatch import receiver
from students.models import StudentProfile

class AcademicYear(models.Model):
    name = models.CharField(max_length=50, unique=True, help_text="e.g., 2024-2028")
    start_year = models.IntegerField(help_text="e.g., 2024")
    end_year = models.IntegerField(help_text="e.g., 2028")

    def __str__(self):
        return self.name
    
class Batch(models.Model):
    name = models.CharField(max_length=100, unique=True)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='batches')
    
    # NEW: The Branch field!
    branch = models.CharField(
        max_length=50, 
        default="CSE", 
        help_text="e.g., CSE, ECE, MECH, CIVIL"
    )
    
    def __str__(self):
        # Now it will show up as "24A12 - CSE (2024-2028)"
        return f"{self.name} - {self.branch} ({self.academic_year.name})"
    
class Course(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    credits = models.IntegerField(default=3)

    def __str__(self):
        return f"{self.code} - {self.name}"

class CourseSection(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    batch = models.ForeignKey('Batch', on_delete=models.CASCADE, related_name='timetable')
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        limit_choices_to={'role': 'FACULTY'}
    )
    

    def __str__(self):
        return f"{self.course.code} for {self.batch.name}"
class Enrollment(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='enrollments')
    course_section = models.ForeignKey(CourseSection, on_delete=models.CASCADE, related_name='enrolled_students')
    enrollment_date = models.DateField(auto_now_add=True)
    grade = models.CharField(max_length=2, blank=True, null=True)

    class Meta:
        unique_together = ('student', 'course_section')

    def __str__(self):
        return f"{self.student.user.username} enrolled in {self.course_section.course.code}"

class Attendance(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    is_present = models.BooleanField(default=True) 

    class Meta:
        unique_together = ('enrollment', 'date')

    def __str__(self):
        status = "Present" if self.is_present else "Absent"
        return f"{self.enrollment.student.user.username} | {self.enrollment.course_section.course.code} | {self.date} | {status}"

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"To {self.user.username}: {self.message}"

@receiver(pre_save, sender=Enrollment)
def track_grade_changes(sender, instance, **kwargs):
    if instance.id:
        try:
            old_enrollment = Enrollment.objects.get(id=instance.id)
            if old_enrollment.grade != instance.grade and instance.grade is not None:
                Notification.objects.create(
                    user=instance.student.user,
                    message=f"New Grade Alert: Your professor has posted a {instance.grade} for {instance.course_section.course.code}!"
                )
        except Enrollment.DoesNotExist:
            pass

class SectionSchedule(models.Model):
    DAY_CHOICES = [
        ('MON', 'Monday'), ('TUE', 'Tuesday'), ('WED', 'Wednesday'),
        ('THU', 'Thursday'), ('FRI', 'Friday'), ('SAT', 'Saturday'), ('SUN', 'Sunday')
    ]
    
    course_section = models.ForeignKey(CourseSection, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.CharField(max_length=3, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room_number = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')}"

    # CLASH DETECTION HAPPENS PER TIMESLOT NOW!
    def clean(self):
        super().clean()
        
        # Find any OTHER schedules that happen on the exact same day and overlap in time
        overlapping_schedules = SectionSchedule.objects.filter(
            day_of_week=self.day_of_week,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time
        ).exclude(pk=self.pk)

        for schedule in overlapping_schedules:
            # 1. VENUE CLASH
            if self.room_number == schedule.room_number:
                raise ValidationError(f"VENUE CLASH: Room {self.room_number} is booked on {self.get_day_of_week_display()} at this time.")
            
            # 2. INSTRUCTOR CLASH
            if self.course_section.instructor == schedule.course_section.instructor:
                raise ValidationError(f"INSTRUCTOR CLASH: Prof. {self.course_section.instructor.username} is already teaching on {self.get_day_of_week_display()} at this time.")
            
            # 3. BATCH CLASH
            if self.course_section.batch == schedule.course_section.batch:
                raise ValidationError(f"BATCH CLASH: {self.course_section.batch.name} already has a class scheduled at this time on {self.get_day_of_week_display()}.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

# ... (Keep Enrollment, Attendance, Notification the same below this)