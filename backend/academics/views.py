from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from .models import Course, CourseSection, Enrollment, Attendance, Notification
from .serializers import CourseSerializer, CourseSectionSerializer, EnrollmentSerializer, FacultyGradeSerializer, AttendanceSerializer, NotificationSerializer
from students.models import StudentProfile
from .permissions import IsStudent, IsFaculty, IsAdminOrFaculty

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class CourseListView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

class StudentEnrollmentView(generics.ListCreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated, IsStudent]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user.student_profile).select_related('course_section__course')

    def perform_create(self, serializer):
        student_profile = self.request.user.student_profile
        course = serializer.validated_data['course'] 
        
        if not student_profile.batch:
            raise ValidationError("You have not been assigned to a Batch. Contact administration.")

        try:
            target_section = CourseSection.objects.get(course=course, batch=student_profile.batch)
        except CourseSection.DoesNotExist:
            raise ValidationError(f"Administration has not yet assigned a timetable for {course.name} to your batch.")

        if Enrollment.objects.filter(student=student_profile, course_section=target_section).exists():
             raise ValidationError("You are already enrolled in this course.")

        if Enrollment.objects.filter(student=student_profile, course_section__course=course).exists():
            raise ValidationError("You are already enrolled in a different section of this course.")

        serializer.save(student=student_profile, course_section=target_section)

class FacultyCourseListView(generics.ListAPIView):
    serializer_class = CourseSectionSerializer
    permission_classes = [IsAuthenticated, IsFaculty]

    def get_queryset(self):
        return CourseSection.objects.filter(instructor=self.request.user)

class CourseRosterView(generics.ListAPIView):
    serializer_class = FacultyGradeSerializer 
    permission_classes = [IsAuthenticated, IsFaculty]

    def get_queryset(self):
        section_id = self.kwargs['course_id'] # Recycled param name from React
        return Enrollment.objects.filter(course_section_id=section_id, course_section__instructor=self.request.user).select_related('student__user', 'course_section__course')

class GradeUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = FacultyGradeSerializer
    permission_classes = [IsAuthenticated, IsFaculty]

    def get_queryset(self):
        return Enrollment.objects.filter(course_section__instructor=self.request.user)

class SystemAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrFaculty]

    def get(self, request):
        total_students = StudentProfile.objects.count()
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()
        
        courses = Course.objects.prefetch_related('sections__enrolled_students').all()
        popular_course = "None"
        max_enrolls = 0
        
        for c in courses:
            enroll_count = sum(section.enrolled_students.count() for section in c.sections.all())
            if enroll_count > max_enrolls:
                max_enrolls = enroll_count
                popular_course = c.name

        return Response({
            'total_students': total_students,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'popular_course': popular_course
        })

class DailyAttendanceView(APIView):
    permission_classes = [IsAuthenticated, IsFaculty]

    def get(self, request, course_id, date):
        if not CourseSection.objects.filter(id=course_id, instructor=request.user).exists():
            return Response({"error": "Unauthorized to view this course."}, status=403)

        enrollments = Enrollment.objects.filter(course_section_id=course_id)
        records = []
        
        for enrollment in enrollments:
            record, created = Attendance.objects.get_or_create(
                enrollment=enrollment,
                date=date,
                defaults={'is_present': True}
            )
            records.append(record)
            
        serializer = AttendanceSerializer(records, many=True)
        return Response(serializer.data)

    def put(self, request, course_id, date):
        if not CourseSection.objects.filter(id=course_id, instructor=request.user).exists():
            return Response({"error": "Unauthorized"}, status=403)

        for item in request.data:
            try:
                record = Attendance.objects.get(id=item['id'], enrollment__course_section_id=course_id)
                record.is_present = item['is_present']
                record.save()
            except Attendance.DoesNotExist:
                continue
                
        return Response({"message": "Attendance saved successfully!"})

class TranscriptPDFView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            student_profile = request.user.student_profile
            enrollments = Enrollment.objects.filter(student=student_profile).select_related('course_section__course')
        except:
            return Response({"error": "Only students can download transcripts."}, status=403)

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{request.user.username}_transcript.pdf"'

        p = canvas.Canvas(response)
        
        p.setFont("Helvetica-Bold", 24)
        p.drawString(100, 800, "EduCore University")
        
        p.setFont("Helvetica", 14)
        p.drawString(100, 770, "Official Academic Transcript")
        p.drawString(100, 740, f"Student: {request.user.first_name} {request.user.last_name} (@{request.user.username})")
        
        p.line(100, 720, 500, 720)

        p.setFont("Helvetica-Bold", 12)
        p.drawString(100, 690, "Course Code")
        p.drawString(220, 690, "Course Name")
        p.drawString(450, 690, "Official Grade")
        
        p.line(100, 680, 500, 680)

        y_position = 650
        p.setFont("Helvetica", 12)
        
        for enrollment in enrollments:
            course = enrollment.course_section.course
            p.drawString(100, y_position, course.code)
            course_name = course.name[:25] + "..." if len(course.name) > 25 else course.name
            p.drawString(220, y_position, course_name)
            grade = enrollment.grade if enrollment.grade else "Pending"
            p.drawString(450, y_position, grade)
            y_position -= 30 
            if y_position < 100:
                p.showPage()
                y_position = 800

        p.showPage()
        p.save()
        
        return response

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, is_read=False)

class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            notif = Notification.objects.get(id=pk, user=request.user)
            notif.is_read = True
            notif.save()
            return Response({"status": "marked as read"})
        except Notification.DoesNotExist:
            return Response({"error": "Not found"}, status=404)