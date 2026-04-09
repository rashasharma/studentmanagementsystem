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
    branch = models.CharField(max_length=50, default="CSE", help_text="e.g., CSE, ECE, MECH, CIVIL")
    
    def __str__(self):
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
    batches = models.ManyToManyField(Batch, related_name='course_sections')
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        limit_choices_to={'role': 'FACULTY'}
    )

    def __str__(self):
        return f"{self.course.code} - {self.instructor.username if self.instructor else 'TBA'}"

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

    def clean(self):
        super().clean()
        
        # Guard against partial data during initial form validation
        if not self.start_time or not self.end_time or not self.day_of_week:
            return

        if self.start_time >= self.end_time:
            raise ValidationError({'end_time': "Class end time must be strictly after the start time."})

        # Sanitize the room number to prevent "101 " vs "101" bypasses
        current_room = self.room_number.strip().upper() if self.room_number else ""
        
        # Find exact overlapping timeframes
        overlapping_schedules = SectionSchedule.objects.filter(
            day_of_week=self.day_of_week,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time
        )
        
        # Safely exclude ourselves if we are updating an existing record
        if self.pk:
            overlapping_schedules = overlapping_schedules.exclude(pk=self.pk)

        for schedule in overlapping_schedules:
            # 1. Venue Clash Verification (Now Case-Insensitive and Stripped)
            conflict_room = schedule.room_number.strip().upper() if schedule.room_number else ""
            if current_room == conflict_room:
                # Passing a dictionary binds the error directly to the 'room_number' input field!
                raise ValidationError({
                    'room_number': f"VENUE CLASH: Room {current_room} is already booked for {schedule.course_section.course.code} from {schedule.start_time.strftime('%H:%M')} to {schedule.end_time.strftime('%H:%M')}."
                })
            
            # 2. Instructor Clash Verification
            if self.course_section.instructor and schedule.course_section.instructor:
                if self.course_section.instructor == schedule.course_section.instructor:
                    prof_name = self.course_section.instructor.username
                    raise ValidationError({
                        'course_section': f"INSTRUCTOR CLASH: Prof. {prof_name} is already teaching {schedule.course_section.course.code} at this time."
                    })

            # 3. Batch Clash Verification
            try:
                my_batches = set(self.course_section.batches.all())
                their_batches = set(schedule.course_section.batches.all())
                common_batches = my_batches.intersection(their_batches)
                if common_batches:
                    batch_names = ", ".join([b.name for b in common_batches])
                    raise ValidationError({
                        'course_section': f"BATCH CLASH: The following batches already have a class scheduled: {batch_names}."
                    })
            except ValueError:
                pass

    def save(self, *args, **kwargs):
        # Permanently save the sanitized room string to the database
        if self.room_number:
            self.room_number = self.room_number.strip().upper()
        self.clean()
        super().save(*args, **kwargs)

class Enrollment(models.Model):
    student = models.ForeignKey(
        StudentProfile, 
        on_delete=models.CASCADE, 
        related_name='enrollments',
        # ADD THIS LINE: It reaches into the profile to check the underlying CustomUser's role
        limit_choices_to={'user__role': 'STUDENT'} 
    )
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