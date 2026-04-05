from django.db import models
from django.conf import settings
from students.models import StudentProfile

class Course(models.Model):
    code = models.CharField(max_length=20, unique=True) # e.g., CS101
    name = models.CharField(max_length=200) # e.g., Data Structures and Algorithms
    description = models.TextField(blank=True)
    credits = models.IntegerField(default=3)
    
    # Links to the CustomUser table, but strictly filters for Faculty
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        limit_choices_to={'role': 'FACULTY'}
    )

    def __str__(self):
        return f"{self.code} - {self.name}"


class Enrollment(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrolled_students')
    enrollment_date = models.DateField(auto_now_add=True)
    grade = models.CharField(max_length=2, blank=True, null=True)

    class Meta:
        # This ensures a student cannot enroll in the exact same course twice
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.user.username} enrolled in {self.course.code}"


class Attendance(models.Model):
    # We link attendance directly to the Enrollment, so we know both the student and the course!
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    
    # Defaults to True, so the professor only has to uncheck the box for kids who are absent
    is_present = models.BooleanField(default=True) 

    class Meta:
        # A student can only have one attendance record per course, per day
        unique_together = ('enrollment', 'date')

    def __str__(self):
        status = "Present" if self.is_present else "Absent"
        return f"{self.enrollment.student.user.username} | {self.enrollment.course.code} | {self.date} | {status}"