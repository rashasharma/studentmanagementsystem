from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from .models import Course, Enrollment, Attendance
from .serializers import CourseSerializer, EnrollmentSerializer, FacultyGradeSerializer
from students.models import StudentProfile
from rest_framework.views import APIView
from rest_framework.response import Response

class CourseListView(generics.ListAPIView):
    """API endpoint to view all available courses."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

class StudentEnrollmentView(generics.ListCreateAPIView):
    """API endpoint for a student to view their enrollments and enroll in new courses."""
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return the courses that the currently logged-in student is enrolled in
        return Enrollment.objects.filter(student=self.request.user.student_profile)

    def perform_create(self, serializer):
        # Automatically assign the logged-in student to this enrollment
        student_profile = self.request.user.student_profile
        course = serializer.validated_data['course']
        
        # Security check: Prevent the student from enrolling in the same course twice
        if Enrollment.objects.filter(student=student_profile, course=course).exists():
            raise ValidationError("You are already enrolled in this course.")
            
        serializer.save(student=student_profile)

class FacultyCourseListView(generics.ListAPIView):
    """API endpoint for Faculty to view the courses they are teaching."""
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Security: Only return courses where the instructor matches the logged-in user
        return Course.objects.filter(instructor=self.request.user)

class CourseRosterView(generics.ListAPIView):
    """API endpoint for Faculty to view students enrolled in a specific course."""
    
    # Change this line! It used to be EnrollmentSerializer
    serializer_class = FacultyGradeSerializer 
    
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return Enrollment.objects.filter(
            course_id=course_id, 
            course__instructor=self.request.user
        )

class GradeUpdateView(generics.RetrieveUpdateAPIView):
    """API endpoint for Faculty to assign or update a grade."""
    serializer_class = FacultyGradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Security: Faculty can only edit enrollments for courses they teach
        return Enrollment.objects.filter(course__instructor=self.request.user)

class SystemAnalyticsView(APIView):
    """API endpoint to get system-wide statistics."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Count the basic totals
        total_students = StudentProfile.objects.count()
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()
        
        # 2. Find the most popular course
        courses = Course.objects.all()
        popular_course = "None"
        max_enrolls = 0
        
        for c in courses:
            enroll_count = c.enrolled_students.count()
            if enroll_count > max_enrolls:
                max_enrolls = enroll_count
                popular_course = c.name

        # 3. Package it up and send it to React
        return Response({
            'total_students': total_students,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'popular_course': popular_course
        })
class DailyAttendanceView(APIView):
    """API endpoint for Faculty to view and update bulk attendance for a specific date."""
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id, date):
        # Security: Verify this professor actually teaches this course
        if not Course.objects.filter(id=course_id, instructor=request.user).exists():
            return Response({"error": "Unauthorized to view this course."}, status=403)

        enrollments = Enrollment.objects.filter(course_id=course_id)
        records = []

        # Automatically generate attendance records for the day if they don't exist
        for enrollment in enrollments:
            record, created = Attendance.objects.get_or_create(
                enrollment=enrollment,
                date=date,
                defaults={'is_present': True} # Assume everyone is present by default
            )
            records.append(record)

        # Import the serializer inline to avoid circular imports, or rely on top imports
        from .serializers import AttendanceSerializer
        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data)

    def put(self, request, course_id, date):
        # Security Check
        if not Course.objects.filter(id=course_id, instructor=request.user).exists():
            return Response({"error": "Unauthorized"}, status=403)

        # React will send a list of updated attendance data: [{'id': 1, 'is_present': False}, ...]
        for item in request.data:
            try:
                record = Attendance.objects.get(id=item['id'], enrollment__course_id=course_id)
                record.is_present = item['is_present']
                record.save()
            except Attendance.DoesNotExist:
                continue

        return Response({"message": "Attendance saved successfully!"})