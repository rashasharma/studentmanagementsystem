from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import StudentProfile
from .serializers import StudentProfileSerializer

# RetrieveUpdateAPIView automatically handles GET (read) and PUT/PATCH (update) requests!
class StudentProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated] # Ensures only logged-in users can access this

    def get_object(self):
        # This is the magic line. Instead of looking up a student by an ID in the URL,
        # it automatically grabs the profile attached to the user who made the request.
        return self.request.user.student_profile