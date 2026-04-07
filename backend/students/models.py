from django.db import models
from django.conf import settings

class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    contact_number = models.CharField(max_length=15, blank=True)
    enrollment_date = models.DateField(auto_now_add=True)
    batch = models.ForeignKey('academics.Batch', on_delete=models.SET_NULL, null=True, blank=True, related_name='students')

    def __str__(self):
        return f"{self.user.username} Profile"