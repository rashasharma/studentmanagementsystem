from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Define the role choices based on the SRS requirements
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('FACULTY', 'Faculty'),
        ('STAFF', 'Registrar/Finance Staff'),
        ('ADMIN', 'Administrator'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    
    # We can add an email field and make it unique, as it's better for login later
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.username} - {self.role}"