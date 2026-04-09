from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='student_profile',
        limit_choices_to={'role': 'STUDENT'}
    )
    contact_number = models.CharField(max_length=15, blank=True)
    enrollment_date = models.DateField(auto_now_add=True)
    batch = models.ForeignKey('academics.Batch', on_delete=models.SET_NULL, null=True, blank=True, related_name='students')

    def __str__(self):
        return f"{self.user.username} Profile"

    @property
    def roll_number(self):
        return self.user.username

@receiver(post_save, sender=settings.AUTH_USER_MODEL, dispatch_uid="create_student_profile_once")
def auto_create_student_profile(sender, instance, created, **kwargs):
    """
    Listens for new CustomUser creations. If the user is a STUDENT, 
    it automatically generates a blank StudentProfile for them.
    """
    if created and instance.role == 'STUDENT':
        StudentProfile.objects.get_or_create(user=instance)