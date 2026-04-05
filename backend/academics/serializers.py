from rest_framework import serializers
from .models import Course, Enrollment, Attendance # Add Attendance here

class CourseSerializer(serializers.ModelSerializer):
    # This grabs the instructor's username instead of just sending a raw ID number
    instructor_name = serializers.CharField(source='instructor.username', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'code', 'name', 'description', 'credits', 'instructor_name']

class EnrollmentSerializer(serializers.ModelSerializer):
    # These extra fields will make it easier for React to display the course details
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_code', 'course_name', 'enrollment_date', 'grade']
        # We make the student field read-only because we will automatically assign it in the view
        read_only_fields = ['student', 'enrollment_date', 'grade']
class FacultyGradeSerializer(serializers.ModelSerializer):
    # Pull in the student's username so the professor knows who they are grading
    student_name = serializers.CharField(source='student.user.username', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = Enrollment
        # We only expose the fields the professor needs to see and edit
        fields = ['id', 'student_name', 'course_name', 'grade']        

class AttendanceSerializer(serializers.ModelSerializer):
    # Pull the student's name so the professor knows who they are marking absent
    student_name = serializers.CharField(source='enrollment.student.user.username', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'enrollment', 'student_name', 'date', 'is_present']