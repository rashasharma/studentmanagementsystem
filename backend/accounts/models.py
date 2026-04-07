from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('FACULTY', 'Faculty'),
        ('FINANCE', 'Finance Staff'),
        ('ADMIN', 'Administrator'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    email = models.EmailField(unique=True, blank=True, null=True)

    def __str__(self):
        return f"{self.username} - {self.role}"