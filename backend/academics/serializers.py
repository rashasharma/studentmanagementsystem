from rest_framework import serializers
from .models import Course, CourseSection, SectionSchedule, Enrollment, Attendance, Notification

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

class SectionScheduleSerializer(serializers.ModelSerializer):
    day = serializers.CharField(source='get_day_of_week_display', read_only=True)
    start_time = serializers.TimeField(format='%I:%M %p', read_only=True)
    end_time = serializers.TimeField(format='%I:%M %p', read_only=True)

    class Meta:
        model = SectionSchedule
        fields = ['day', 'start_time', 'end_time', 'room_number']

class CourseSectionSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.code', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    batch_names = serializers.SerializerMethodField()
    schedules = SectionScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = CourseSection
        fields = ['id', 'course_code', 'course_name', 'batch_names', 'schedules']

    def get_batch_names(self, obj):
        return ", ".join([b.name for b in obj.batches.all()])

class EnrollmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course_section.course.name', read_only=True)
    course_code = serializers.CharField(source='course_section.course.code', read_only=True)
    schedules = SectionScheduleSerializer(source='course_section.schedules', many=True, read_only=True)
    attendance_percentage = serializers.SerializerMethodField()
    
    # --- NEW: Field to grab detailed daily records ---
    attendance_details = serializers.SerializerMethodField()
    
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), write_only=True) 

    class Meta:
        model = Enrollment
        # Added attendance_details to the fields list
        fields = ['id', 'course', 'course_name', 'course_code', 'enrollment_date', 'grade', 'schedules', 'attendance_percentage', 'attendance_details']
        read_only_fields = ['grade']

    def get_attendance_percentage(self, obj):
        total_classes = obj.attendance_records.count()
        if total_classes == 0:
            return "No classes recorded"
        classes_attended = obj.attendance_records.filter(is_present=True).count()
        percentage = (classes_attended / total_classes) * 100
        return f"{round(percentage)}%"

    # --- NEW: Method to extract and sort the dates ---
    def get_attendance_details(self, obj):
        records = obj.attendance_records.all().order_by('-date')
        return [{"date": record.date, "is_present": record.is_present} for record in records]

class FacultyGradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.username', read_only=True)
    course_name = serializers.CharField(source='course_section.course.name', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student_name', 'course_name', 'grade']

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='enrollment.student.user.username', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'enrollment', 'student_name', 'date', 'is_present']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']