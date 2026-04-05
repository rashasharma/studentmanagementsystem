from rest_framework import serializers
from .models import StudentProfile

class StudentProfileSerializer(serializers.ModelSerializer):
    # We can pull in read-only data from the linked CustomUser model so the frontend has everything it needs!
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'username', 'email', 'role', 
            'date_of_birth', 'contact_number', 'program', 
            'enrollment_date', 'is_active'
        ]