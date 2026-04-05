from django.db import models
from django.conf import settings

class StudentProfile(models.Model):
    # This links directly to your CustomUser model. 
    # 'CASCADE' means if the user account is deleted, this profile gets deleted too.
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='student_profile'
    )
    
    # Demographic & Academic Data
    date_of_birth = models.DateField(null=True, blank=True)
    contact_number = models.CharField(max_length=15, blank=True)
    program = models.CharField(max_length=100)  # e.g., "B.Tech CSE"
    enrollment_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}'s Profile - {self.program}"